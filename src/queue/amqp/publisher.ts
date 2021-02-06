import events from 'events'
import amqp from 'amqplib'
import { strict as strictAssert } from 'assert'

interface JsonArray extends Array<string | number | boolean | Date | Json | JsonArray> {}
interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray
}

export interface MessageData<T> {
  id?: string
  eventName?: string
  payload: T
}

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
      this.emit('start')
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public send(data: MessageData<object>): void
  public send<T>(data: MessageData<T>): void {
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
