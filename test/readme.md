## Unit Testing with Node.js (Jest)

- https://jestjs.io/docs/getting-started
- https://www.npmjs.com/package/skia-canvas (faster than node-canvas)
- https://www.npmjs.com/package/jsdom

```zsh
node run tests
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
