import events from 'events'
import amqp from 'amqplib'
import { strict as assert } from 'assert'
import { MessageData } from './publisher'

const EventEmitter = events.EventEmitter

export default class extends EventEmitter {
  private readonly amqpUrl: string
  private readonly queueName: string
  private connection: amqp.Connection | null
  constructor(url: string, queue: string) {
    super()
    this.amqpUrl = url
    this.queueName = queue
    this.connection = null
  }

  public async start() {
    try {
      assert(this.amqpUrl, 'No amqp url provided in constructor.')
      this.connection = await amqp.connect(this.amqpUrl)
      const channel = await this.connection.createChannel()
      await channel.assertQueue(this.queueName)
      await channel.consume(this.queueName, async (data) => {
        if (data) {
          const msgData: MessageData = JSON.parse(data.content.toString('utf8'))
          this.emit(msgData.eventName || 'message', msgData.payload)
          channel.ack(data)
        }
      })
      console.info('AMQP Subscriber started and consuming...')
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public async stop() {
    try {
      assert(this.connection, 'No connection stablished to be closed.')
      await this.connection.close()
      this.emit('close', 'Connection has been closed.')
      console.info('AMQP Subscriber stoped.')
    } catch (e) {
      this.emit('error', e.message)
    }
  }
}
