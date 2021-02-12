import crypto from 'crypto'
import { EventEmitter } from 'events'
import amqp from 'amqplib'
import { strict as strictAssert } from 'assert'
import { MessageData } from './publisher'

export interface MessagePayload {
  id: string
  [x: string]: string | string[] | number | number[] | object | object[]
}

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
          const msgData: MessageData<MessagePayload> = JSON.parse(data.content.toString('utf8'))
          const { eventName, payload } = msgData
          if (!payload && this.channel) {
            return this.channel.ack(data)
          }
          if (!payload.id) {
            payload.id = crypto.randomBytes(8).toString('hex')
          }
          this._messageMapper.set(payload.id, data)
          this.emit(eventName || 'message', payload)
        }
      }, {
        noAck: true
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
