import merc from "./projections/merc.js";
import longlat from "./projections/longlat.js";
var projs = [merc, longlat];
var projRegister = {};


export function add(proj) {
  proj.names.forEach((n) => {
    projRegister[n.toLowerCase()] = {
      proj,
      path: null
    };
  });
  return this;
}

function importProjection (projection) {
  return import(`./projections/${projection}.js`);
}

export function addNameAndExtension(projNames, projPath) {

  projNames.forEach((n) => {
    projRegister[n.toLowerCase()] = {
      proj: null,
      path: projPath
    };
  });
  return this;
}

export function get(name) {
  if (!name) {
    return false;
  }
  var n = name.toLowerCase();

  if (typeof projRegister[n] !== 'undefined' && projRegister[n].proj !== null) {
    return projRegister[n].proj;
  } 

  dynamic:
  if (typeof projRegister[n] !== 'undefined' && projRegister[n].proj === null) {
    return importProjection(projRegister[n].path)
  }
}

export function start() {
  projs.forEach(add);
}
export default {
  start,
  add,
  addNameAndExtension,
  get
};
