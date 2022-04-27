import Projection from '../ProjectionClass.js'

export const names = ['longlat', 'identity']

export default class LongLat extends Projection {
  constructor () {
    super(names)
  }

  init () {}
 
  forward (pt) {
    return pt
  }

  inverse (pt) {
    return pt
  }
}
