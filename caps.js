'use strict'
// Main hub app
const Queue = require('./queue.js')
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(PORT);
const queues = {
  vendorID: {
    flowers: new Queue('Flowers'),
    acme: new Queue('Acme')
  }
}

io.on('connection', (socket) => {
  console.log(`${socket.id} HAS CONNECTED!`)

  // subscribes to 'delievered' 
  socket.on('join', (payload) => {
    socket.join(payload)
    console.log(`User ${socket.id} has joined '${payload}'`)
  })

  // io.of('flowers').to('delievered').emit('delievered')

  socket.on('delievered', (payload) => {
    if (payload.storeName === '1-200-Flowers') {
      console.log(`***DELIEVERED: ORDER NUMBER: ${payload.orderId}\n`)
      // remove from 'transit' queue
      queues.vendorID.flowers.transit.shift()
      // add to 'delievered' queue
      queues.vendorID.flowers.delievered.push(payload)
      socket.broadcast.emit('delievered', payload)
    } 
 
  });


  // make catchup dynamic?
  // flush delievered: takes items from queue notifies vendor
  socket.on('catchup', (payload) => {
    queues.vendorID.flowers.delievered.forEach(value => {
      socket.emit('delievered', value)
    })
  })

  // flush pickup
  socket.on('pickupQueue', (payload) => {
    queues.vendorID.flowers.pickup.forEach(value => {
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
      
    } else if (payload.storeName === 'acme') {
      queues.vendorID.flowers.pickup.push(payload)
      console.log(`***NEW PICKUP: ITEM NEEDS TO BE PICKED UP \n
        ${payload.storeName}\n 
        ${payload.orderId}\n
        ${payload.customerName}\n
        ${payload.address}\n`);
      socket.broadcast.emit('newPickup', payload);
    }
  })

  // move package from pickup -> transit
  socket.on('in-transit', (payload) => {
    setTimeout(() => {
      console.log(`***PICKED UP: ORDER NUMBER: ${payload.orderId}`)
      // remove from pickup
      queues.vendorID.flowers.pickup.shift()
      console.log(`***TRANSIT: ORDER NUMBER: ${payload.orderId}\n`)
      // add package to 'transit' queue
      queues.vendorID.flowers.transit.push(payload)
      socket.emit('relayMessage', payload)
    }, 3000)
  })

  // emits from vendor: removes from delievered queue
  socket.on('completeDelievery', (payload) => {
    queues.vendorID.flowers.delievered.shift()
  })

})





console.log('CAPS TURNED ON...')