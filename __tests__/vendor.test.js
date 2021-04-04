'use strict';

const vendor = require('../vendor.js');

describe('VENDOR TESTING', () => {
  let consoleSpy;
  let payload = {};

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('function "hasBeenDelievered" properly logs some output', () => {
    vendor.hasBeenDelievered(payload)
    expect(consoleSpy).toHaveBeenCalled();
  })
})