import { EventEmitter } from 'events'
import amqp from 'amqplib'
import { strict as strictAssert } from 'assert'

export interface MessageData<T> {
  eventName?: string
  payload: T
}

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
      this.emit('start')
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public send<T>(data: MessageData<T>): void
  public send(data: MessageData<object>): void {
    try {
      strictAssert(this.connection, 'AMQP Publisher: No connection stablished yet.')
      strictAssert(this.channel, 'AMQP Publisher: No channel created yet.')
      this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)))
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public async stop() {
    try {
      strictAssert(this.connection, 'AMQP Publisher: No connection stablished yet.')
      await this.connection.close()
      this.emit('close', 'AMQP Publisher: Connection has been closed.')
    } catch (e) {
      this.emit('error', e.message)
    }
  }
}
