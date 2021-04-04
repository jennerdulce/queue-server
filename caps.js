'use strict'
// Main hub app
const Queue = require('./queue.js')
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(PORT);
const queues = {
  vendorID: {
    flowers: new Queue('Flowers'),
    acme: new Queue('ACME Inc.')
  }
}

io.on('connection', (socket) => {
  console.log(`${socket.id} HAS CONNECTED!`)
  // subscribes to 'delievered' 
  socket.on('join', (payload) => {
    // 'acme delievery'
    socket.join(payload)
    console.log(`User ${socket.id} has joined '${payload}'`)
  })

  socket.on('delievered', (payload) => {
    if (payload.storeName === '1-200-Flowers') {
      console.log(`***DELIEVERED: ORDER NUMBER: ${payload.orderId}\n`)
      // remove from 'transit' queue
      queues.vendorID.flowers.transit.shift()
      // add to 'delievered' queue
      queues.vendorID.flowers.delievered.push(payload)
      // triggers delievered in vendor
      io.to('flower delievery').emit('delievered', payload)
    } else if (payload.storeName === 'ACME Inc.') {
      console.log(`***DELIEVERED: ORDER NUMBER: ${payload.orderId}\n`)
      // remove from 'transit' queue
      queues.vendorID.acme.transit.shift()
      // add to 'delievered' queue
      queues.vendorID.acme.delievered.push(payload)
      // triggers delievered in vendor
      io.to('acme delievery').emit('delievered', payload)

    };
  })

  // make catchup dynamic?
  // flush delievered: takes items from queue notifies vendor
  socket.on('catchupQueue', (payload) => {
    queues.vendorID[payload].delievered.forEach(value => {
      // triggers delievered in vendor
      if (payload === 'flowers') {
        io.to('flower delievery').emit('delievered', value)
      } else if (payload === 'acme') {
        io.to('acme delievery').emit('delievered', value)
      }
    })
  })

  // flush pickup
  socket.on('pickupQueue', (payload) => {
    queues.vendorID[payload].pickup.forEach(value => {
      socket.emit('newPickup', value)
      console.log(`Catching up on ${value}`)
    })
  })

  socket.on('pickup', (payload) => {
    // push new order into 'pickup' queue
    if (payload.storeName === '1-200-Flowers') {
      queues.vendorID.flowers.pickup.push(payload)
      console.log(`***NEW PICKUP: ITEM NEEDS TO BE PICKED UP \n
      ${payload.storeName}\n 
      ${payload.orderId}\n
      ${payload.customerName}\n
      ${payload.address}\n`);
      socket.broadcast.emit('newPickup', payload);

    } else if (payload.storeName === 'ACME Inc.') {
      queues.vendorID.acme.pickup.push(payload)
      console.log(`***NEW PICKUP: ITEM NEEDS TO BE PICKED UP \n
        ${payload.storeName}\n 
        ${payload.orderId}\n
        ${payload.customerName}\n
        ${payload.address}\n`);
      io.to('pickup').emit('newPickup', payload);
    }
  })

  // move package from pickup -> transit
  socket.on('in-transit', (payload) => {
    if (payload.storeName === '1-200-Flowers') {
      setTimeout(() => {
        console.log(`***PICKED UP: ORDER NUMBER: ${payload.orderId}`)
        // remove from pickup
        queues.vendorID.flowers.pickup.shift()
        console.log(`***TRANSIT: ORDER NUMBER: ${payload.orderId}\n`)
        // add package to 'transit' queue
        queues.vendorID.flowers.transit.push(payload)
        socket.emit('relayMessage', payload)
      }, 3000)
    } else if (payload.storeName === 'ACME Inc.') {
      setTimeout(() => {
        console.log(`***PICKED UP: ORDER NUMBER: ${payload.orderId}`)
        // remove from pickup
        queues.vendorID.acme.pickup.shift()
        console.log(`***TRANSIT: ORDER NUMBER: ${payload.orderId}\n`)
        // add package to 'transit' queue
        queues.vendorID.acme.transit.push(payload)
        socket.emit('relayMessage', payload)
      }, 3000)
    }
  })

  // emits from vendor: removes from delievered queue
  socket.on('received', (payload) => {
    if (payload.storeName === '1-200-Flowers') {
      queues.vendorID.flowers.delievered.shift()
    } else if (payload.storeName === 'ACME Inc.') {
      queues.vendorID.acme.delievered.shift()
    }
  })
})

console.log('CAPS TURNED ON...');

