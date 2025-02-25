#!/usr/bin/env node
const { execSync } = require('child_process');
const inquirer = require('@inquirer/prompts');
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');

// Properly export main function for compatibility with "npx testcafe-cli-select run"
async function main() {
	let implicitConfigFromTestCafeRc =
		'use implicit browser config from .testcaferc.js';

	// Step 1: Choose test mode (Headed or Headless)
	const testMode = await inquirer.select({
		message: 'Run tests in headed or headless mode?',
		choices: ['headed', 'headless', `${implicitConfigFromTestCafeRc}`],
	});
	console.log(`Test Mode: ${testMode}`);

	let browserMode = 'headed';
	const testDir = './tests';
	const testFiles = getTestFiles(testDir);

	if (!testFiles.some((choice) => !choice.disabled)) {
		console.error(
			'No valid test files found. Make sure the test files are located under `tests` folder and contain .spec.js or .test.js extension (e.g. tests/login.spec.js or tests/login.test.js)'
		);
		return;
	}

	// Step 2: Choose between running full specs or selecting specific tests
	const runMode = await inquirer.select({
		message: 'Do you want to run the entire spec files or select specific tests?',
		choices: [
			{ name: 'Run entire spec files', value: 'spec' },
			{ name: 'Select specific tests', value: 'tests' },
		],
	});

	// Step 3: If running entire specs, allow selecting multiple spec files
	if (runMode === 'spec') {
		const selectedFiles = await inquirer.checkbox({
			message: 'Select one or more test spec files to run:',
			choices: testFiles,
		});

		if (selectedFiles.length === 0) {
			console.error('No spec files selected.');
			return;
		}

		const defaultBrowser = `${args.browser || 'chrome'}`;
		let command;
		if (testMode === 'headless') {
			browserMode = `${args.browser || 'chrome'}:headless`;
			command = `npx testcafe ${browserMode} ${selectedFiles.map((file) => path.join(testDir, file)).join(' ')}`;
		} else if (testMode === implicitConfigFromTestCafeRc) {
			console.log(
				'NOTE: make sure you have .testcaferc.js file configured in your project!'
			);
			console.log(
				'Documentation: https://testcafe.io/documentation/402638/reference/configuration-file'
			);
			command = `npx testcafe ${selectedFiles.map((file) => path.join(testDir, file)).join(' ')}`;
		} else {
			command = `npx testcafe ${defaultBrowser} ${selectedFiles.map((file) => path.join(testDir, file)).join(' ')}`;
		}

		console.log(`Running: ${command}`);
		execSync(command, { stdio: 'inherit' });
		return;
	}

	// Step 4: If selecting specific tests, pick one spec file first
	const selectedFile = await inquirer.select({
		message: 'Select a test spec file:',
		choices: testFiles,
	});

	if (!selectedFile) return;

	const testFilePath = path.join(testDir, String(selectedFile));
	const testTitles = getTestTitles(testFilePath);

	if (!testTitles.some((choice) => !choice.disabled)) {
		console.error(`No tests found in ${selectedFile}.`);
		return;
	}

	// Step 5: Select one or more tests from the chosen spec file
	const selectedTitles = await inquirer.checkbox({
		message: 'Select test titles to run:',
		choices: testTitles,
	});

	if (selectedTitles.length === 0) {
		console.error('No tests selected.');
		return;
	}

	const grepPattern = selectedTitles.map((title) => `-t "${title}"`).join(' ');
	let command = `npx testcafe ${browserMode} ${testFilePath} ${grepPattern}`;
	if (testMode === 'headless') {
		browserMode = `${args.browser || 'chrome'}:headless`;
		command = `npx testcafe ${browserMode} ${testFilePath} ${grepPattern}`;
	} else if (testMode === implicitConfigFromTestCafeRc) {
		command = `npx testcafe ${testFilePath} ${grepPattern}`;
	}

	console.log(`Running: ${command}`);
	execSync(command, { stdio: 'inherit' });
}

function getTestFiles(testDir) {
	  const files = fs
    .readdirSync(testDir)
    .filter((file) => /\.(spec|test)\.(js|ts)$/.test(file));

	return files.length > 0
		? files.map((file) => ({ name: file, value: file }))
		: [{ name: 'No test files found', value: null, disabled: true }];
}

function getTestTitles(testFile) {
	const content = fs.readFileSync(testFile, 'utf-8');
	const matches = content.match(/test\(['"`](.*?)['"`]/g) || [];
	const titles = matches.map((match) => match.match(/test\(['"`](.*?)['"`]/)[1]);
	return titles.length > 0
		? titles.map((title) => ({ name: title, value: title }))
		: [{ name: 'No tests found in file', value: null, disabled: true }];
}

// Export main function correctly for compatibility
module.exports.main = main;
if (require.main === module) main();
