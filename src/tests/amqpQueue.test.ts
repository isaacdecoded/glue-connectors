import amqp from '../queue/amqp'

const amqpUrl = 'amqp://localhost?heartbeat=60'
const amqpQueue = 'test'
const testMessage = 'this is a testing message :)'

test('AMQP Subscriber', async () => {
  const subscriber = new amqp.Subscriber(amqpUrl, amqpQueue)
  const testEvent = 'test_message'
  subscriber.on(testEvent, (msg) => {
    expect(msg).toEqual(testMessage)
  })
  await subscriber.start(testEvent)
  await subscriber.stop()
})

test('AMQP Publisher', async () => {
  const publisher = new amqp.Publisher(amqpUrl, amqpQueue)
  await publisher.start()
  await publisher.send(testMessage)
  await publisher.stop()
})
