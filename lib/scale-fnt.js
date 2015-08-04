var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var async = require('async');
var log = require('debug')('scale-fnt');
var fntLoad = require('load-bmfont');
var gmHelper = require('gm-helper');

module.exports = function scaleFnt(srcFnt, destPath, scale, cb) {
  log('start scale fnt: ' + srcFnt);
  async.waterfall([
    function(callback) {
      fntLoad(srcFnt, callback);
    }, function(json, callback) {
      scaleFntProp(json, scale);
      var dir = path.dirname(srcFnt);
      var destFile = path.join(destPath, path.basename(srcFnt));
      outputDestFile(destFile, json);

      var imgFile = json.pages[0];
      gmHelper.scale(path.join(dir, imgFile), path.join(destPath, imgFile), scale, scale, callback);
    }
  ], function(err) {
    if (err) {
      log(new Error(err));
    }
    cb(err);
  });
};

function scaleFntProp(json, scale) {
  if (json.common && json.common.lineHeight) {
    json.common.lineHeight = Math.round(json.common.lineHeight * scale);
  }

  if (json.chars && json.chars.length > 0) {
    json.chars.forEach(function (char) {
      for (var key in char) {
        if (_.includes(['x', 'y', 'width', 'height', 'xoffset', 'yoffset', 'xadvance'], key)) {
          char[key] = Math.round(char[key] * scale);
        }
      }
    });
  }
}

function outputDestFile(filename, json) {
  function pushInArr(arr, obj) {
    for (var key in obj) {
      var v = obj[key];
      if (typeof v === 'string') {
        v = '"' + v + '"';
      }
      arr.push(key + '=' + v);
    }
  }

  function pushCharInArr(arr, obj) {
    for (var key in obj) {
      var v = obj[key];
      var padLen = 0;
      if (key === 'id') {
        padLen = 6;
      } else if (_.includes(['x', 'y', 'width', 'height', 'xoffset', 'yoffset', 'xadvance'], key)) {
        padLen = 5;
      } else if (_.includes(['page', 'chnl'], key)) {
        padLen = 2;
      }
      arr.push(key + '=' + _.padRight(v, padLen));
    }
  }
  var infoArr = ['info'];
  pushInArr(infoArr, json.info);

  var rst = [infoArr.join(' ')];

  var commArr = ['common'];
  pushInArr(commArr, json.common);
  rst.push(commArr.join(' '));

  var pageArr = ['page', 'id=0'];
  pageArr.push('file="' + json.pages[0] + '"');
  rst.push(pageArr.join(' '));

  var charsArr = ['chars'];
  charsArr.push('count=' + json.chars.length);
  rst.push(charsArr.join(' '));

  for (var i = 0, len = json.chars.length; i < len; i++) {
    var charArr = ['char'];
    pushCharInArr(charArr, json.chars[i]);
    rst.push(charArr.join(' '));
  }

  var kernArr = ['kernings'];
  kernArr.push('count=' + json.kernings.length);
  rst.push(kernArr.join(' '));

  rst.push('');
  fs.writeFileSync(filename, rst.join('\n'));
}