# Feedback wanted!
Proj4js is the defacto (and only?) way to do client-side projection of coordinates between different a wide range of coordinate systems. It recieves close to 90k downloads a week. One of the downsides of existing proj4js library is that it's bundle size is fairly big (roughly 90kb minified).

This experiment came from the thought that perhaps [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) might be a way to reduce the bundle size of proj4js. The way projection (and proj4) works is that each [underlying projection](https://github.com/proj4js/proj4js/tree/master/lib/projections) is a set of mathematical formulas. By making use of dynamic imports this allows us to only pull in the transformation code required for certain projections as required. This means users won't be penalised with loading the code for a *Lambert Conformal Conic* projection if they don't actually use it. But of course as soon as your users do want to use a *Lambert Conformal Conic* projection the code will be loaded. 

By shifting to dynamic imports we are able to ship the core package in **26kb** minified (compared to the 86kb minified of `proj4`) which includes the core projections of web mercator and wgs84. Additional bits of code are loaded on demand as a user requests the use of different projections.

Utiliising dynamic imports did however mean moving to a promise-based architecture. So I figured while we were at it we may well introduce some other functionality and breaking changes.
- This library supports loading projections using EPSG codes thanks to [epsg.io](https://epsg.io/)
- We also introduced a more explicit API with support for geojson

### I'm interested in feedback on
- Do you see value in reducing the core bundle size?
- Do you like the proposed API documented below?
- Any other comments?

# proj4-on-demand 
`proj4-on-demand` is a JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations. This library is based on `proj` but aims to be more light-weight while incoporating extra functionality.

## Installing
Not yet available via npm until I decide what to do with this....


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
