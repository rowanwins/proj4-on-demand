import fetch, {
  Blob,
  blobFrom,
  blobFromSync,
  File,
  fileFrom,
  fileFromSync,
  FormData,
  Headers,
  Request,
  Response,
} from 'node-fetch'

if (!globalThis.fetch) {
  globalThis.fetch = fetch
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
}

import Proj4 from './lib/ProjClass.js'

const p4 = new Proj4()

async function runCheck() {
  // console.log(await p4.projectPointFromWgs84(
  //   '+proj=tmerc +lat_0=0 +lon_0=9 +k_0=1 +x_0=3500000 +y_0=0 +ellps=bessel +units=m',
  //   [2, 5]
  // ))
  const out = await p4.projectGeojson(
    'epsg:3857',
    'wgs84',
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [13981728.04363516, 1130195.3976388907]
      },
      properties: { name: 'Dinagat Islands' }
    }
  );


  //  await p4.registerRequiredProjection('+proj=tmerc +lat_0=0 +lon_0=9 +k_0=1 +x_0=3500000 +y_0=0 +ellps=bessel +units=m')
  // //  await p4.addProjectionFromEpsgIo('4283')
  // //  console.log(p4.projectionRegister)
  //  const out = p4.projectPointFromWgs84(
  //     '+proj=tmerc +lat_0=0 +lon_0=9 +k_0=1 +x_0=3500000 +y_0=0 +ellps=bessel +units=m', 
  //     [2, 5]
  //   );

    console.log(out) 
}
runCheck()


// const p4 = new Proj4()

// var firstProjection = 'PROJCS["NAD83 / Massachusetts Mainland",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",42.68333333333333],PARAMETER["standard_parallel_2",41.71666666666667],PARAMETER["latitude_of_origin",41],PARAMETER["central_meridian",-71.5],PARAMETER["false_easting",200000],PARAMETER["false_northing",750000],AUTHORITY["EPSG","26986"],AXIS["X",EAST],AXIS["Y",NORTH]]';
// var secondProjection = "+proj=gnom +lat_0=90 +lon_0=0 +x_0=6300000 +y_0=6300000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
// //I'm not going to redefine those two in latter examples.
// const out = p4.projectPoint(firstProjection, secondProjection,[2,5])
// console.log(out)
// // [-2690666.2977344505, 3662659.885459918]