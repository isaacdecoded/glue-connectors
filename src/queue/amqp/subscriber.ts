import crypto from 'crypto'
import events from 'events'
import amqp from 'amqplib'
import { strict as strictAssert } from 'assert'
import { MessageData } from './publisher'

const EventEmitter = events.EventEmitter

export default class extends EventEmitter {
  private readonly amqpUrl: string
  private readonly queueName: string
  private connection: amqp.Connection | null
  private channel: amqp.Channel | null
  private _messageMapper: Map<string, amqp.ConsumeMessage>
  constructor(url: string, queue: string) {
    super()
    this.amqpUrl = url
    this.queueName = queue
    this.connection = null
    this.channel = null
    this._messageMapper = new Map<string, amqp.ConsumeMessage>()
  }

  public async start() {
    try {
      strictAssert(this.amqpUrl, 'No amqp url provided in constructor.')
      this.connection = await amqp.connect(this.amqpUrl)
      this.channel = await this.connection.createChannel()
      await this.channel.assertQueue(this.queueName)
      await this.channel.consume(this.queueName, async (data) => {
        if (data) {
          const msgData: MessageData<object> = JSON.parse(data.content.toString('utf8'))
          if (!msgData.id) {
            msgData.id = crypto.randomBytes(8).toString('hex')
          }
          this._messageMapper.set(msgData.id, data)
          this.emit(msgData.eventName || 'message', msgData.payload)
        }
      })
      this.emit('start')
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public ack(id: string) {
    try {
      strictAssert(this.connection, 'AMQP Publisher: No connection stablished yet.')
      strictAssert(this.channel, 'AMQP Publisher: No channel created yet.')
      const data = this._messageMapper.get(id)
      if (!data) {
        throw new Error(`Error when acknowledgement message with id=${id}`)
      }
      this.channel.ack(data)
    } catch (e) {
      this.emit('error', e.message)
    }
  }

  public async stop() {
    try {
      strictAssert(this.connection, 'AMQP Subscriber: No connection stablished to be closed.')
      await this.connection.close()
      this.emit('close', 'AMQP Subscriber: Connection has been closed.')
    } catch (e) {
      this.emit('error', e.message)
    }
  }
}
