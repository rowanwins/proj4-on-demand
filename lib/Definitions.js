import Definition from "./DefinitionClass.js";

export default class Definitions {
  constructor () {
    this.definitions = {}
    this._init()
  }

  _init () {
    const wgs = new Definition('EPSG:4326', "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees")
    this.registerDefinition(wgs)
    this.registerDefinition(wgs.clone('WGS84'))
    const wm = new Definition('EPSG:3857', "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs")
    this.registerDefinition(wm)
    this.registerDefinition(wm.clone('EPSG:3785'))
    this.registerDefinition(wm.clone('GOOGLE'))
    this.registerDefinition(wm.clone('EPSG:900913'))
    this.registerDefinition(wm.clone('EPSG:102113'))
    this.registerDefinition(new Definition('EPSG:4269', "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"))
  }

  registerDefinition (newDefinition) {
    this.definitions[newDefinition.id] = newDefinition
  }

  get (id) {
    if (id in this.definitions) return this.definitions[id]
  }

  isInDefinitions (id) {
    return id in this.definitions
  }

}
