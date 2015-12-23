var expect = require('chai').expect;
var scaleFnt = require('../lib/scale-fnt.js');
var fs = require('fs');
var del = require('del');
var async = require('async');
var fntLoad = require('load-bmfont');
var Jimp = require('jimp');

var tmpPath = 'test/tmp-result-res';
describe('scale-fnt', function () {
  before(function () {
    del.sync(tmpPath);
    fs.mkdirSync(tmpPath);
  });

  it('scale fnt file test', function (done) {
    scaleFnt('test/res/beerUI.fnt', tmpPath, 0.5, function (err) {
      expect(err).not.exist;
      async.parallel({
        fnt: function (callback) {
          fntLoad(tmpPath + '/beerUI.fnt', function (err, json) {
            expect(json.common.lineHeight).to.equal(22);
            expect(json.chars[0].x).to.equal(62);
            expect(json.chars[0].y).to.equal(65);
            callback(err);
          });
        },
        png: function (callback) {
          Jimp(tmpPath + '/BeerUI.png', (err, img) => {
            expect(img.bitmap.width).to.equal(84);
            expect(img.bitmap.height).to.equal(86);
            callback(err);
          });
        }
      }, function (err) {
        expect(err).not.exist;
        done();
      });
    });
  });

  it('scale not exist fnt file', function (done) {
    scaleFnt('test/res/unexit.fnt', tmpPath, 0.5, function (err) {
      expect(err).exist;
      done();
    });
  });
});