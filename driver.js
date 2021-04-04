'use strict';

const io = require('socket.io-client')
const host = 'http://localhost:3000'
const caps = io.connect(host)


caps.on('connect', (socket) => {
  // subscribes to 'pickup'
  caps.emit('join', 'pickup')
  console.log(`joined 'pickup'`)
})

// catch up
caps.emit('pickupQueue')

caps.on('newPickup', pickUpItem)
caps.on('relayMessage', notified)

function pickUpItem(payload) {
  console.log(`***PACKAGE FOR ${payload.customerName} NEEDS TO BE PICKED UP`)
  setTimeout(() => {
    caps.emit('in-transit', payload)
  }, 1000)
}

function notified(payload) {
  console.log('EMIT D=======================================')
  caps.emit('delievered', payload)
}


module.exports = {
  pickUpItem: pickUpItem,
}

console.log('DRIVER TURNED ON...')