 <h2 align=center>TestCafe CLI-Select</h2>
<p align="center">
</p>

<p align="center">
TestCafe interactive CLI prompts to select and run specific spec files / tests
</p>

<br>
<p align="left">
Important note: the test files should include .spec.js / .spec.ts / .test.js / .test.ts suffix  and be located in the tests folder (e.g. tests/login.spec.js or tests/login.test.js)
</p>

## Installation

Install the following package:

```bash
npm install -D testcafe-cli-select
# within your TestCafe repository as dev dependency
```

---

## How to run

Run the following command in your TestCafe repository:

```bash
npx testcafe-cli-select run
```

## Command line arguments

You can also include more CLI arguments in which you can specify specific browser, otherwise Chrome Browser will be implicitly used

```bash
npx testcafe-cli-select run --browser firefox
```

Official TestCafe documentation with the list of all the supported browsers [HERE](https://testcafe.io/documentation/402828/guides/intermediate-guides/browsers).

---

## Setting up a `npm` script

For convenience, you may want to store the `npx` command within an npm script in your project's `package.json`, including any desired CLI arguments:

```json
  "scripts": {
    "tc:select": "npx testcafe-cli-select run --browser=firefox"
  }
```

---

## Contributions

Feel free to open a pull request or drop any feature request or bug in the [issues](https://github.com/razvanvancea/testcafe-cli-select/issues).

Please see more details in the [contributing doc](https://github.com/razvanvancea/testcafe-cli-select/blob/main/CONTRIBUTING.md).
