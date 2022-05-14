import ProjectionsRegister from './ProjectionsRegisterClass.js'
import { transformer } from "./core.js";
import wkt from 'wkt-parser'
import projStr from './projString.js'
import Mercator from "./projections/merc.js";
import LongLat from "./projections/longlat.js";
import { isWkt, checkMercator, checkProjStr, isProjString, looksLikeEpsgCode, getPlainEpsgCode } from './parseCode.js'
import { getDepth } from 'get-depth'

export default class Proj4 {
  constructor () {
    this.projectionRegister = new ProjectionsRegister()
    this._init()
  }

  _init () {
    const baseMercatorClass = new Mercator()
    this.projectionRegister.addProjectionUsingClass(baseMercatorClass)
    const wgs84String = "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"
    this.projectionRegister.makeCompleteProjection(baseMercatorClass, ['WGS84', 'EPSG:4326', wgs84String], projStr(wgs84String))
    
    this.projectionRegister.addProjectionUsingClass(new LongLat())
    const pseudoMercatorString = "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"
    this.projectionRegister.makeCompleteProjection(baseMercatorClass, ['EPSG:3785', 'EPSG:3857', 'EPSG:900913', 'EPSG:102113', pseudoMercatorString], projStr(pseudoMercatorString))

    this.projectionRegister.addProjectionsUsingNamesAndPath([
      {names: ["Albers_Conic_Equal_Area", "Albers", "aea"], path: 'aea'},
      {names: ["Azimuthal_Equidistant", "aeqd"], path: 'aeqd'},
      {names: ["Cassini", "Cassini_Soldner", "cass"], path: 'cass'},
      {names: ["Cylindrical_Equal_Area", "cea"], path: 'cea'},
      {names: ["Equirectangular", "Equidistant_Cylindrical", "eqc"], path: 'eqc'},
      {names: ["Equidistant_Conic", "eqdc"], path: 'eqdc'},
      {names: ["equi"], path: 'equi'},
      {names: ["Extended_Transverse_Mercator", "Extended Transverse Mercator", "etmerc", "Transverse_Mercator", "Transverse Mercator", "tmerc"], path: 'etmerc'},
      {names: ["gauss"], path: 'gauss'},
      {names: ["Geocentric", 'geocentric', "geocent", "Geocent"], path: 'geocent'},
      {names: ["Geostationary Satellite View", "Geostationary_Satellite", "geos"], path: 'geos'},
      {names: ["gnom"], path: 'gnom'},
      {names: ["gstmerg", "gstmerc"], path: 'gstmerc'},
      {names: ["Krovak", "krovak"], path: 'krovak'},
      {names: ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"], path: 'laea'},
      {names: ["Lambert Tangential Conformal Conic Projection", "Lambert_Conformal_Conic", "Lambert_Conformal_Conic_1SP", "Lambert_Conformal_Conic_2SP", "lcc", "Lambert Conic Conformal (1SP)", "Lambert Conic Conformal (2SP)"], path: 'lcc'},
      {names: ["Miller_Cylindrical", "mill"], path: 'mill'},
      {names: ["Mollweide", "moll"], path: 'moll'},
      {names: ["New_Zealand_Map_Grid", "nzmg"], path: 'nzmg'},
      {names: ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Two_Point_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "Oblique_Mercator", "omerc"], path: 'omerc'},
      {names: ["ortho"], path: 'ortho'},
      {names: ["Polyconic", "poly"], path: 'poly'},
      {names: ["Quadrilateralized Spherical Cube", "Quadrilateralized_Spherical_Cube", "qsc"], path: 'qsc'},
      {names: ["Robinson", "robin"], path: 'robin'},
      {names: ["Sinusoidal", "sinu"], path: 'sinu'},
      {names: ["somerc"], path: 'somerc'},
      {names: ["stere", "Stereographic_South_Pole", "Polar Stereographic (variant B)"], path: 'stere'},
      {names: ["Stereographic_North_Pole", "Oblique_Stereographic", "Polar_Stereographic", "sterea", "Oblique Stereographic Alternative", "Double_Stereographic"], path: 'sterea'},
      {names: ["Fast_Transverse_Mercator", "Fast Transverse Mercator"], path: 'tmerc'},
      {names: ["Tilted_Perspective", "tpers"], path: 'tpers'},
      {names: ["Universal Transverse Mercator System", "utm"], path: 'utm'},
      {names: ["Van_der_Grinten_I", "VanDerGrinten", "vandg"], path: 'vandg'}
    ])
  }

  async registerRequiredProjection (projectionId) {
    if (this.projectionRegister.hasProjection(projectionId)) {
      return
    }
    const projDetails = await this._parseInputProjectToJson(projectionId)
    await this.projectionRegister.addProjectionToExistingName(projDetails.projName)
  }

  async projectGeojson (projectionId1, projectionId2, geojsonObj) {
    const transformer = await this.getTransformer(projectionId1, projectionId2)
    return this._transformGeojson(transformer, geojsonObj)
  }

  async projectGeojsonFromWgs84 (projectionId1, geojsonObj) {
    const transformer = await this.getTransformer(this.projectionRegister.wgs84Projection, projectionId1)
    return this._transformGeojson(transformer, geojsonObj)
  }

  async projectGeojsonToWgs84 (projectionId1, geojsonObj) {
    const transformer = await this.getTransformer(projectionId1, this.projectionRegister.wgs84Projection)
    return this._transformGeojson(transformer, geojsonObj)
  }

  async projectPoint (projectionId1, projectionId2, coords) {
    let proj1 = await this._getOrCreateProjectionById(projectionId1)
    let proj2 = await this._getOrCreateProjectionById(projectionId2)
    return this._transform(proj1, proj2, coords)
  }

  async projectPointFromWgs84 (projectionId, coords) {
    let proj = await this._getOrCreateProjectionById(projectionId)
    return this._transform(this.projectionRegister.wgs84Projection, proj, coords)
  }
  
  async projectPointToWgs84 (projectionId, coords) {
    let proj = await this._getOrCreateProjectionById(projectionId)
    return this._transform(proj, this.projectionRegister.wgs84Projection, coords)
  }

  async _tryGetFromEpsgIo (epsgCode) {
    const response = await fetch(`https://epsg.io/${epsgCode}.proj4`)
    if (!response.ok) {
      return null
    }
    const projId = await response.text()
    return projId
  }

  async addProjectionFromEpsgIo (epsgCode) {
    const projId = await this._tryGetFromEpsgIo(epsgCode)
    if (projId === null) return
    return projId
    // const projDetails = await this._parseInputProjectToJson(projId)
    // await this.registerRequiredProjection(projId)
    // const baseProjection = await this._getOrCreateProjectionById(projId)
    // this.projectionRegister.makeCompleteProjection(baseProjection, [projId, `EPSG:${epsgCode}`, `epsg:${epsgCode}`, `${epsgCode}`] , projDetails)
  }

  async _parseInputProjectToJson (input) {
    if (looksLikeEpsgCode(input)) {
      const out = await this.addProjectionFromEpsgIo(getPlainEpsgCode(input))
      return projStr(out)
    }
    if (isWkt(input)) {
      var out = wkt(input)
      if (checkMercator(out)) return this.projectionRegister.wgs84Projection
      var maybeProjStr = checkProjStr(out)
      if (maybeProjStr) return projStr(maybeProjStr)
      return out
    }
    if (isProjString(input)) return projStr(input)
    return null
  }

  _getProjectionFromJson (json) {
    const proj = this.projectionRegister.getProjectionByName(json.projName)
    return proj
  }

  async _createCompleteProjection (projectionId) {
    const projDetails = await this._parseInputProjectToJson(projectionId)
    let baseProjection = this._getProjectionFromJson(projDetails)
    if (baseProjection === undefined) {
      await this.registerRequiredProjection(projectionId)
      baseProjection = this._getProjectionFromJson(projDetails)
    }
    return this.projectionRegister.makeCompleteProjection(baseProjection, [projectionId], projDetails) 
  }

  async _getOrCreateProjectionById (projectionId) {
    if (this.projectionRegister.hasProjection(projectionId)) {
      return this.projectionRegister.getProjectionByName(projectionId)
    } else {
     const p = await this._createCompleteProjection(projectionId)
     return p
    }
  }

  _transform (from, to, coords) {
    return transformer(from, to, coords, false)
  }

  _transformGeojson (transformer, geojsonObj) {
    if (geojsonObj.type === "FeatureCollection") {
      return {
        ...geojsonObj,
        features: geojsonObj.features.map(feature => this._transformGeojson(transformer, feature))
      };
    } else if (geojsonObj.type === "Feature") {
      return {
        ...geojsonObj,
        geometry: this._transformGeojson(transformer, geojsonObj.geometry)
      };
    } else if (geojsonObj.type === "LineString") {
      return {
        ...geojsonObj,
        coordinates: geojsonObj.coordinates.map(coord => transformer.forward(coord))
      };
    } else if (geojsonObj.type === "MultiLineString") {
      return {
        ...geojsonObj,
        coordinates: geojsonObj.coordinates.map(line => line.map(coord => transformer.forward(coord)))
      };
    } else if (geojsonObj.type === "MultiPoint") {
      return {
        ...geojsonObj,
        coordinates: geojsonObj.coordinates.map(point => transformer.forward(point))
      };
    } else if (geojsonObj.type === "MultiPolygon") {
      return {
        ...geojsonObj,
        coordinates: geojsonObj.coordinates.map(polygon => {
          return polygon.map(ring => ring.map(coord => transformer.forward(coord)));
        })
      };
    } else if (geojsonObj.type === "Point") {
      return {
        ...geojsonObj,
        coordinates: transformer.forward(geojsonObj.coordinates)
      };
    } else if (geojsonObj.type === "Polygon") {
      return {
        ...geojsonObj,
        coordinates: geojsonObj.coordinates.map(ring => ring.map(coord => this._transform(from, to, coord)))
      };
    } else if (Array.isArray(geojsonObj)) {
      const depth = getDepth(geojsonObj);
  
      if (depth === 1) {
        // coord
        return transformer.forward(geojsonObj);
      } else if (depth === 2) {
        // ring
        return geojsonObj.map(coord => transformer.forward(coord));
      } else if (depth === 3) {
        // polygon
        return geojsonObj.map(ring => ring.map(coord => transformer.forward(coord)));
      } else if (depth === 4) {
        // multi-polygon
        return geojsonObj.map(polygon => {
          return polygon.map(ring => ring.map(coord => transformer.forward(coord)));
        });
      }
    }
  }

  async getTransformer (projectionId1, projectionId2) {
    let proj1 = await this._getOrCreateProjectionById(projectionId1)
    let proj2 = await this._getOrCreateProjectionById(projectionId2)
    return {
      forward: function (coords, enforceAxis) {
        return transformer(proj1, proj2, coords, enforceAxis);
      },
      inverse: function (coords, enforceAxis) {
        return transformer(proj2, proj1, coords, enforceAxis);
      }
    }
  }

}