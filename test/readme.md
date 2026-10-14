# Unit Tests

This folder contains unit tests that ensure the functionality of q5.js.

These tests are setup to run with Bun.

q5.js is compatible with Node.js, Bun, and Deno.

## Unit Testing with Bun

Uses Bun's built-in test runner that implements Jest's `expect` API.

```zsh
bun test
```

## Unit Testing with Node.js (Jest)

- https://jestjs.io/docs/getting-started
- https://www.npmjs.com/package/skia-canvas (faster than node-canvas)
- https://www.npmjs.com/package/jsdom

Install Jest globally with npm then cd to the `q5` folder and run it.

```zsh
jest
```

## Unit Testing with Deno

- https://jsr.io/@std/expect
- https://jsr.io/@b-fuze/deno-dom (faster than jsdom)
- https://jsr.io/@gfx/canvas

Edit the test files to import deno testing libraries.

```js
import { expect } from '@std/expect';
import '../q5-deno-server.js';
let test = Deno.test;
```

```zsh
deno test --unstable-node-globals -A
```

## Unit Test Debugging

You can run these tests with the Visual Studio Code debugger. Launch settings are located in `.vscode/launch.json`.
