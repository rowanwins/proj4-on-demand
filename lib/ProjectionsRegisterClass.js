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
      const name = this._forceNametoBeLowercaseString(n)
      this.projections[name] = {
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
      const name = this._forceNametoBeLowercaseString(n)
      this.projections[name] = {
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

  _forceNametoBeLowercaseString (name) {
    if (typeof name === 'number') name = name.toString()
    return name.toLowerCase()
  }

  async addProjectionToExistingName (name) {
    name = this._forceNametoBeLowercaseString(name)
    const p = this.projections[name]
    if (typeof p !== 'undefined' && p.proj === null) {
      p.proj = await this._importProjection(p.path)
    }    
  }

  hasProjection (name) {
    name = this._forceNametoBeLowercaseString(name)
    return name in this.projections
  }

  getProjectionByName (name) {
    name = this._forceNametoBeLowercaseString(name)
    const p = this.projections[name]
    if (typeof p !== 'undefined' && p.proj !== null) {
      return p.proj
    } 
  }


}