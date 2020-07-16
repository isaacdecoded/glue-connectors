import events from 'events'
import amqp from 'amqplib'
import { strict as assert } from 'assert'

const EventEmitter = events.EventEmitter

export default class extends EventEmitter {
  private readonly amqpUrl: string
  private readonly queueName: string
  private connection: amqp.Connection | null
  private channel: amqp.Channel | null
  constructor(url: string, queue: string) {
    super()
    this.amqpUrl = url
    this.queueName = queue
    this.connection = null
    this.channel = null
  }

  public async start() {
    try {
      this.connection = await amqp.connect(this.amqpUrl)
      this.channel = await this.connection.createChannel()
      await this.channel.assertQueue(this.queueName)
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public async send(payload: {}) {
    try {
      assert(this.connection, 'No connection stablished yet.')
      assert(this.channel, 'No channel created yet.')
      this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(payload)))
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public async stop() {
    try {
      assert(this.connection, 'No connection stablished yet.')
      await this.connection.close()
      this.emit('close', 'Connection has been closed.')
    } catch (e) {
      this.emit('error', e.message)
    }
  }
}
