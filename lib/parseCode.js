import match from './match.js';

var wktCodeWords = ['PROJECTEDCRS', 'PROJCRS', 'GEOGCS','GEOCCS','PROJCS','LOCAL_CS', 'GEODCRS', 'GEODETICCRS', 'GEODETICDATUM', 'ENGCRS', 'ENGINEERINGCRS'];
export function isWkt (code) {
  return wktCodeWords.some((word) => {
    return code.indexOf(word) > -1;
  });
}

var codes = ['3857', '900913', '3785', '102113'];
export function checkMercator(item) {
  var auth = match(item, 'authority');
  if (!auth) {
    return;
  }
  var code = match(auth, 'epsg');
  return code && codes.indexOf(code) > -1;
}

export function checkProjStr(item) {
  var ext = match(item, 'extension');
  if (!ext) {
    return;
  }
  return match(ext, 'proj4');
}

export function isProjString(code){
  return code[0] === '+';
}

export function looksLikeEpsgCode(code) {
  if (typeof code === 'number') return code
  if (typeof code === 'string') {
    if (code.toLowerCase().indexOf('epsg') > -1) return true
  }
}

export function getPlainEpsgCode(code) {
  if (typeof code === 'number') return code
  if (typeof code === 'string') {
    if (code.toLowerCase().indexOf('epsg') > -1) {
      return code.toLowerCase().split('epsg:')[1]
    }
    return code
  }
}