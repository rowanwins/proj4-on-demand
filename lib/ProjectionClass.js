import {sphere as dc_sphere, eccentricity as dc_eccentricity} from './deriveConstants.js';
import Datum from './constants/Datum.js';
import datum from './datum.js';
import match from './match.js';
import {getNadgrids} from "./nadgrid.js";

export default class Projection {
  constructor (names) {
    this.names = names
  }

  createFromInput (newNames, proj) {
    if (proj.datumCode && proj.datumCode !== 'none') {
      var datumDef = match(Datum, proj.datumCode);
      if (datumDef) {
        proj.datum_params = proj.datum_params || (datumDef.towgs84 ? datumDef.towgs84.split(',') : null);
        proj.ellps = datumDef.ellipse;
        proj.datumName = datumDef.datumName ? datumDef.datumName : proj.datumCode;
      }
    }
    proj.k0 = proj.k0 || 1.0;
    proj.axis = proj.axis || 'enu';
    proj.ellps = proj.ellps || 'wgs84';
    proj.lat1 = proj.lat1 || proj.lat0; // Lambert_Conformal_Conic_1SP, for example, needs this

    var sphere_ = dc_sphere(proj.a, proj.b, proj.rf, proj.ellps, proj.sphere);
    var ecc = dc_eccentricity(sphere_.a, sphere_.b, sphere_.rf, proj.R_A);
    var nadgrids = getNadgrids(proj.nadgrids);
    var datumObj = proj.datum || datum(proj.datumCode, proj.datum_params, sphere_.a, sphere_.b, ecc.es, ecc.ep2, nadgrids);
    
    const out = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    out.names = newNames
    Object.assign(out, proj)

    // copy the 4 things over we calculated in deriveConstants.sphere
    out.a = sphere_.a;
    out.b = sphere_.b;
    out.rf = sphere_.rf;
    out.sphere = sphere_.sphere;

    // copy the 3 things we calculated in deriveConstants.eccentricity
    out.es = ecc.es;
    out.e = ecc.e;
    out.ep2 = ecc.ep2;

    // add in the datum object
    out.datum = datumObj;
    // init the projection
    out.init();
    return out
  }
}