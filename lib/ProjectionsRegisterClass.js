export default class ProjectionsRegister {
  constructor () {
    this.projections = {}
  }

  get wgs84Projection () {
    return this.projections['wgs84'].proj
  }

  makeCompleteProjection (baseProjection, ids, proj) {
    const completeProjection = baseProjection.createFromInput(ids, proj)
    this.addProjectionUsingClass(completeProjection)
    return completeProjection
  }

  addProjectionUsingClass (proj) {
    proj.names.forEach((n) => {
      this.projections[n.toLowerCase()] = {
        proj,
        path: null
      };
    });
    return this;
  }

  addProjectionsUsingClass (projs) {
    projs.forEach(p => this.addProjectionUsingClass(p))
  }

  addProjectionUsingNamesAndPath (opt) {
    opt.names.forEach((n) => {
      this.projections[n.toLowerCase()] = {
        proj: null,
        path: opt.path
      };
    });
  }

  addProjectionsUsingNamesAndPath (projs) {
    projs.forEach(opt => this.addProjectionUsingNamesAndPath(opt))
  }

  async _importProjection (path) {
    const mod = await import(`./projections/${path}.js`)
    return new mod.default()
  }

  async addProjectionToExistingName (name) {
    var n = name.toLowerCase()
    const p = this.projections[n]
    if (typeof p !== 'undefined' && p.proj === null) {
      p.proj = await this._importProjection(p.path)
    }    
  }

  hasProjection (name) {
    return name.toLowerCase() in this.projections
  }

  getProjectionByName (name) {
    var n = name.toLowerCase()
    const p = this.projections[n]
    if (typeof p !== 'undefined' && p.proj !== null) {
      return p.proj
    } 
  }


}