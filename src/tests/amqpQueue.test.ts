import amqp from '../queue/amqp'

const amqpUrl = 'amqp://localhost?heartbeat=60'
const amqpQueue = 'test'
const testEventName = 'test_message'
const testMessage = {
  eventName: testEventName,
  text: 'this is a testing message :)',
}

test('AMQP Publisher', async () => {
  const publisher = new amqp.Publisher(amqpUrl, amqpQueue)
  await publisher.start()
  await publisher.send(testMessage)
  await publisher.stop()
})

test('AMQP Subscriber', async () => {
  const subscriber = new amqp.Subscriber(amqpUrl, amqpQueue)
  await subscriber.start()
  await subscriber.stop()
})
