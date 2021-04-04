'use strict';

const io = require('socket.io-client');
const host = 'http://localhost:3000'
const caps = io.connect(host)
const faker = require('faker');

caps.on('connect', (socket) => {
  // subscribes to 'delievered'
  caps.emit('join', 'delieveredFlowers')
  console.log(`joined 'delievered'`)
})

setInterval(() => {
  let fakeOrder = {
    storeName: '1-200-Flowers',
    orderId: faker.address.zipCode(),
    customerName: faker.name.findName(),
    address: faker.address.streetAddress()
  }

  caps.emit('pickup', fakeOrder)
}, 5000)


caps.emit('catchup')
caps.on('delievered', hasBeenDelievered)


function hasBeenDelievered(payload) {
  console.log(`***DELIEVERY COMPLETE.. PACKAGE ${payload.orderId} ON ${new Date()} THANK YOU`)
  caps.emit('completeDelievery', payload)
}

module.exports = {
  hasBeenDelievered: hasBeenDelievered
}

console.log('VENDOR TURNED ON...')