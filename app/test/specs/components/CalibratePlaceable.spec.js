/* global describe, it */
import { expect } from 'chai'
import sinon from 'sinon'
import CalibratePlaceable from 'components/CalibratePlaceable.vue'
import { getRenderedVm } from '../../util.js'

function getMockStore() {
  return {
    actions: {
      pickUpTip: sinon.spy(),
      dropTip: sinon.spy(),
      moveToPosition: sinon.spy(),
      calibrate: sinon.spy()
    }
  }
}

let placeable = {
  'slot': 'A1',
  'label': 'tiprack-12ml',
  'sanitizedType': 'tiprack',
  'calibrated': true
}
let instrument = {'axis': 'a'}

const mockStore = getMockStore()
const propsData = { placeable, instrument }
let calibratePlaceable = getRenderedVm(CalibratePlaceable, propsData, mockStore)

describe('CalibratePlaceable.vue', () => {
  it('renders pick_up/drop tip if placeable is tiprack', () => {
    const buttons = calibratePlaceable.$el.querySelectorAll('button')
    expect(buttons.length).to.equal(4)
  })

  it('does not render tip buttons if placeable is not tiprack', () => {
    let plate = JSON.parse(JSON.stringify(placeable))
    plate['sanitizedType'] = 'default'

    expect(getRenderedVm(CalibratePlaceable, {
      placeable: plate,
      instrument
    }).$el.querySelectorAll('button').length).to.equal(2)
  })

  it('disables all buttons except for save when not calibrated', () => {
    let uncalibratedPlate = JSON.parse(JSON.stringify(placeable))
    uncalibratedPlate['calibrated'] = false

    expect(getRenderedVm(CalibratePlaceable, {
      placeable: uncalibratedPlate,
      instrument
    }).$el.querySelectorAll('button.disabled').length).to.equal(3)
  })

  it('enables all buttons when calibrated', () => {
    let buttons = calibratePlaceable.$el.querySelectorAll('button.disabled')
    expect(buttons.length).to.equal(0)
  })

  it('calls the correct actions for each button click', () => {
    calibratePlaceable.calibrate()
    calibratePlaceable.moveToPosition()
    calibratePlaceable.pickUpTip()
    calibratePlaceable.dropTip()

    expect(mockStore.actions.calibrate.called).to.be.true
    expect(mockStore.actions.moveToPosition.called).to.be.true
    expect(mockStore.actions.pickUpTip.called).to.be.true
    expect(mockStore.actions.dropTip.called).to.be.true
  })
})
