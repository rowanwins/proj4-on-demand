import {
    geodeticToGeocentric,
    geocentricToGeodetic
} from '../datumUtils.js';

import Projection from '../ProjectionClass.js'

export const names = ["Geocentric", 'geocentric', "geocent", "Geocent"]

export default class Geocentric extends Projection {
    constructor() {
        super(names)
    }

    init() {
        this.name = 'geocent';
    }
    
    forward(p) {
        var point = geodeticToGeocentric(p, this.es, this.a);
        return point;
    }

    inverse(p) {
        var point = geocentricToGeodetic(p, this.es, this.a, this.b);
        return point;
    }

}