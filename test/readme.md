# Unit Tests

This folder contains unit tests that ensure the functionality of q5.js.

q5.js is compatible with Node.js, Bun, and Deno.

These tests are setup to run with Node.js (using Jest). Code for running the tests with Bun and Deno is provided, but commented out.

## Unit Testing with Node.js (Jest)

- https://jestjs.io/docs/getting-started
- https://www.npmjs.com/package/skia-canvas (faster than node-canvas)
- https://www.npmjs.com/package/jsdom

Install Jest globally with npm then cd to the `q5` folder and run it.

```zsh
jest
```

## Unit Testing with Bun

Just like testing with Node.js but uses Bun's built-in test runner that implements Jest's `expect` API.

```zsh
bun test
```

## Unit Testing with Deno

- https://jsr.io/@std/expect
- https://jsr.io/@b-fuze/deno-dom (faster than jsdom)
- https://jsr.io/@gfx/canvas

```zsh
deno test --unstable-node-globals -A
```

## Unit Test Debugging

You can run these tests with the Visual Studio Code debugger. Launch settings are located in `.vscode/launch.json`.
