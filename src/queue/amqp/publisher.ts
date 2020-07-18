import events from 'events'
import amqp from 'amqplib'
import { strict as assert } from 'assert'

interface JsonArray extends Array<string | number | boolean | Date | Json | JsonArray> {}
interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray
}

export interface MessageData {
  eventName: string
  payload: Json
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
      console.info('AMQP Publisher started and available.')
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public async send(data: MessageData) {
    try {
      assert(this.connection, 'No connection stablished yet.')
      assert(this.channel, 'No channel created yet.')
      this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)))
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public async stop() {
    try {
      assert(this.connection, 'No connection stablished yet.')
      await this.connection.close()
      this.emit('close', 'Connection has been closed.')
      console.info('AMQP Publisher stoped.')
    } catch (e) {
      this.emit('error', e.message)
    }
  }
}
