# Scale Fnt
scale fnt based gm & load-bmfont

## How to use
```js
var scaleFnt = require('scale-fnt');
scaleFnt(srcFntFile, destFntFile, scale, function(err, result) {
  if (err) {
    console.error(err);
  }
});
```

## Installation
```sh
npm install --save scale-fnt
```

## Tests
```sh
npm install
npm test
```