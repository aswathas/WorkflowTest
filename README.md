# workflow-test

Tiny ESM utility library.

## Install / run

```sh
npm test
```

Runs the suite with the built-in `node:test` runner (`node --test "test/**/*.test.js"`). No dependencies.

## Exports

| Function | Behavior | Source |
| --- | --- | --- |
| `shout(String)` | uppercase | `src/a.js` |
| `double(n)` | `n * 2` | `src/b.js` |
| `sum(arr)` | sum of array | `src/c.js` |
| `triple(n)` | `n * 3` | `src/d.js` |