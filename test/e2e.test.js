import { expect, test } from 'vitest'
import Proj4OnDemand from '../lib/ProjClass.js'
import { testPoints } from './testData.js'

const p4 = new Proj4OnDemand()

test('Works backwards and forwards', async () => {

  for (let index = 0; index < testPoints.length; index++) {
    const testPoint = testPoints[index];
    // console.log(testPoint.code)
    let xyAcc = 2
    let llAcc = 6
    if ('acc' in testPoint) {
      if ('xy' in testPoint.acc) xyAcc = testPoint.acc.xy
      if ('ll' in testPoint.acc) llAcc = testPoint.acc.ll
    }
    const xyEPSLN = Math.pow(10, - 1 * xyAcc)
    const llEPSLN = Math.pow(10, - 1 * llAcc)

    const out1 = await p4.projectPointFromWgs84(testPoint.code, testPoint.ll)
    expect(out1[0]).toBeCloseTo(testPoint.xy[0], xyEPSLN)
    expect(out1[1]).toBeCloseTo(testPoint.xy[1], xyEPSLN)
    const out2 = await p4.projectPointToWgs84(testPoint.code, testPoint.xy)
    expect(out2[0]).toBeCloseTo(testPoint.ll[0], llEPSLN)    
    expect(out2[1]).toBeCloseTo(testPoint.ll[1], llEPSLN)    
  }


})
