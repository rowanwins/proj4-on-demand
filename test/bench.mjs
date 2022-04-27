import Benchmark from "benchmark"
import Proj4OnDemand from '../lib/ProjClass.js'
import proj4 from 'proj4'

const p4 = new Proj4OnDemand()

var firstProjection = 'PROJCS["NAD83 / Massachusetts Mainland",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",42.68333333333333],PARAMETER["standard_parallel_2",41.71666666666667],PARAMETER["latitude_of_origin",41],PARAMETER["central_meridian",-71.5],PARAMETER["false_easting",200000],PARAMETER["false_northing",750000],AUTHORITY["EPSG","26986"],AXIS["X",EAST],AXIS["Y",NORTH]]';
var secondProjection = "+proj=gnom +lat_0=90 +lon_0=0 +x_0=6300000 +y_0=6300000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";

// async function main () {
//   await p4.projectPoint(firstProjection, secondProjection, [2, 5])
//   await p4.projectPoint(firstProjection, secondProjection, [2, 5])
// }
// main()
/**
 * Benchmark Results
 *
 * angle x 980,468 ops/sec ±1.30% (84 runs sampled)
 * angle -- meractor x 931,748 ops/sec ±1.27% (88 runs sampled)
 */

 function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const arr = []
for (let index = 0; index < 10000; index++) {
 arr.push([randomIntFromInterval(-90, 90), randomIntFromInterval(-180, 180)])
}

new Benchmark.Suite("wgs")
  .add("proj4-on-demand", {
    defer: true,
    fn: async (deferred) => {
      const ur = await p4.getTransformer(firstProjection, secondProjection)
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
         ur.forward(element)      
      }
      deferred.resolve()
    }
  })
  .add("proj4", () => {
    const ur = proj4(firstProjection,secondProjection)
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      ur.forward(element)
    }
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run()
