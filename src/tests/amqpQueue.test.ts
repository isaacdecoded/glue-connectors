import amqp from '../queue/amqp'
import { MessageData } from '../queue/amqp/publisher'

const amqpUrl = 'amqp://localhost?heartbeat=60'
const amqpQueue = 'test'
const testMessage: MessageData = {
  eventName: 'test_message',
  payload: {
    msg: 'this is a testing message :)',
  },
}

const publisher = new amqp.Publisher(amqpUrl, amqpQueue)
const subscriber = new amqp.Subscriber(amqpUrl, amqpQueue)

test('AMQP Publisher: starts and publish a message', async (done) => {
  try {
    await publisher.start()
    await publisher.send(testMessage)
    done()
  } catch (e) {
    done(e)
  }
})

test('AMQP Subscriber', async (done) => {
  try {
    subscriber.on(testMessage.eventName, async (msg) => {
      console.log(msg)
      expect(msg).toEqual(testMessage.payload)
      done()
    })
    await subscriber.start()
  } catch (e) {
    done(e)
  }
})

afterAll(async () => {
  await publisher.stop()
  await subscriber.stop()
})
