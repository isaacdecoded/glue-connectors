import amqp from '../queue/amqp'
import { MessageData } from '../queue/amqp/publisher'

const { Subscriber, Publisher } = amqp
const amqpUrl = 'amqp://localhost?heartbeat=60'
const amqpQueue = 'test'
const EVENT_NAME = 'test_message'
const testMessage: MessageData<object> = {
  eventName: EVENT_NAME,
  payload: {
    msg: 'this is a testing message :)',
  },
}

const publisher = new Publisher(amqpUrl, amqpQueue)
const subscriber = new Subscriber(amqpUrl, amqpQueue)

test('AMQP Publisher: starts and publish a message', async (done) => {
  try {
    publisher.on('error', done)
    await publisher.start()
    publisher.send(testMessage)
    done()
  } catch (e) {
    done(e)
  }
})

test('AMQP Subscriber: setup event, starts and receive a message', async (done) => {
  try {
    subscriber.on('error', done)
    subscriber.on(EVENT_NAME, async (msg) => {
      expect(msg).toHaveProperty('id')
      delete msg.id
      expect(msg).toEqual(testMessage.payload)
      done()
    })
    await subscriber.start()
  } catch (e) {
    done(e)
  }
})

afterAll(async (done) => {
  try {
    await publisher.stop()
    await subscriber.stop()
    done()
  } catch (e) {
    done(e)
  }
})
