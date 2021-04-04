'use strict';

const driver = require('../driver.js');

describe('VENDOR TESTING', () => {
  let consoleSpy;
  let payload = {orderId: 111};

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.useFakeTimers()
  });

  afterEach(() => {
    consoleSpy.mockRestore()
    jest.useRealTimers()
  })

  it('function "pickUpItem" properly logs some output', () => {
    driver.pickUpItem(payload)
    jest.advanceTimersByTime(1000)
    expect(consoleSpy).toHaveBeenCalled();
  })
})