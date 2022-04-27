# proj4-on-demand 
`proj4-on-demand` is a JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations. This library is based on `proj` but aims to be more light-weight while incoporating extra functionality.

## Installing
```bash
npm install proj4-on-demand
```

If you do not want to download anything, `proj4-on-demand` is also available via various cdn services for direct use in browser applications. 
eg `https://unpkg.com/proj4-on-demand`


## Quick Start
```javascript
import Proj4 from 'proj4-on-demand'

const p4 = new Proj4()

// Project a single point
const out = await p4.projectPointFromWgs84(
  '+proj=tmerc +lat_0=0 +lon_0=9 +k_0=1 +x_0=3500000 +y_0=0 +ellps=bessel +units=m',
  [2, 5]
);
// out => [ 2721877.6985622747, 556990.8686497906 ]

// Project a geojson object
const out2 = await p4.projectGeojson('wgs84', 'epsg:3857', {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [125.6, 10.1]
    },
    properties: { name: 'Dinagat Islands' }
});
//  out2 => {
//   type: 'Feature',
//   geometry: {
//     type: 'Point',
//     coordinates: [ 13981728.04363516, 1130195.3976388907 ]
//   },
//   properties: { name: 'Dinagat Islands' }
// }

// Creating a transformer
const transformer = await p4.getTransformer('wgs84', 'epsg:3857')
const out3 = transformer.forward([125.6, 10.1])
//  out3 => [ 13981728.04363516, 1130195.3976388907 ]
const out4 = transformer.inverse([13981728.04363516, 1130195.3976388907])
//  out4 => [ 125.6, 10.099999999999982 ] 
```

## API
### Proj4 Class
Everything is accessed via the `Proj4` Class which provides a range of methods.

Where a **Projection Reference** is required it may be one of a 
- Proj4 String (eg `+proj=merc ... +wktext  +no_defs`)
- WKT String (eg `PROJCS[...,AUTHORITY["EPSG","3857"]]`)
- EPSG Code as a string or number (eg `3857` or `EPSG:3857`)

| Method                              | Description                                 |
|-------------------------------------|---------------------------------------------|
| projectPointFromWgs84(Output Projection Reference, [x, y]) | Converts a pair of x,y coords in WGS84, into a pair of coords with the requested projection. |
| projectPointToWgs84(Input Projection Reference, [x, y]) | Converts a pair of x,y coords with a specified projection to WGS84. |
| projectPoint(Input Projection Reference,  Output Projection Reference, [x, y]) | Converts a pair of x,y coords in a specified projection, into a pair of coords with the requested projection. |
| projectGeojsonFromWgs84(Output Projection Reference, GeoJsonObject) | Converts a Geojson object in WGS84, to an equivalent object with coordinates in the requested projection. Supports `FeatureCollection`, `Feature`, and `Geometry` objects. |
| projectGeojsonToWgs84(Input Projection Reference, GeoJsonObject) | Converts a Geojson object in a specified projection, to an equivalent object with coordinates in the WGS84. Supports `FeatureCollection`, `Feature`, and `Geometry` objects. |
| projectGeojson(Input Projection Reference, Output Projection Reference, GeoJsonObject) | Returns a Geojson object in a specified projection, to an equivalent object with coordinates in the requested projection. Supports `FeatureCollection`, `Feature`, and `Geometry` objects.  |
| projectGeojson(Input Projection Reference, Output Projection Reference, GeoJsonObject) | Returns a Geojson object in a specified projection, to an equivalent object with coordinates in the requested projection. Supports `FeatureCollection`, `Feature`, and `Geometry` objects.  |
| getTransformer(Input Projection Reference, Output Projection Reference) | Returns an object with a `forward` and `inverse` function which each take a coordinate to transform. |


## Key Differences from `proj4`
This project leans heavily on the existing `proj4` library but has been modified to enable it to leaverage more modern javascript features.
One of the core goals was to be able to distribute a slimmer package, we do this by making use of dynamic imports which allow us to only pull in the transformation code required for certain projections as required. This means your users won't be penalised with loading the code for a *Lambert Conformal Conic* projection if they don't actually use it.But of course as soon as your users do want to use a *Lambert Conformal Conic* projection the code will be loaded. 
This means that our package is 26kb minified vs 86kb minified of `proj4`. 🎉
To achieve dynamic imports this did mean moving to a promise-based architecture. So we figured while we were at it we may well introduce some other functionality and breaking changes.
- This library supports loading projections using EPSG codes thanks to [epsg.io](https://epsg.io/)
- We also introduced a more explicit API with support for geojson