In one of the previous versions we had tests. Now we don't.

If you want to restore them then remember to add following to `package.json`:

```json
"scripts": {
  "test": "jest --coverage --detectOpenHandles"
},
"devDependencies": {
  "jest": "xxx",
  "nock": "xxx",
  "ts-jest": "xxx"
}
```
