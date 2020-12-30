import redis, { RedisClient } from 'redis'
import { promisify } from 'util'
import { strict as strictAssert } from 'assert'

export default class {
  private readonly client: RedisClient
  private readonly host: string
  private readonly port: number

  constructor(host: string, port: number, password?: string) {
    this.host = host
    this.port = port
    this.client = redis.createClient({
      port,
      host,
      password,
    })
    this.client.on('error', (e) => console.error(e))
    this.client.once('connect', () => console.log('Redis client succesfully connected.'))
  }

  public getUrl() {
    return `${this.host}:${this.port}`
  }

  public async store(key: string, data: string | object) {
    if (typeof data === 'object') {
      data = JSON.stringify(data)
    }
    const setAsync = promisify(this.client.set).bind(this.client)
    return await setAsync(key, data)
      .then(() => true)
      .catch((e) => {
        throw e
      })
  }

  public async retrieve(key: string) {
    const getAsync = promisify(this.client.get).bind(this.client)
    return await getAsync(key)
      .then(async (v) => {
        if (v && this.checkJson(v)) {
          return JSON.parse(v)
        }
        return v
      })
      .catch((e) => {
        throw e
      })
  }

  public async clean() {
    const flushAsync = promisify(this.client.flushall).bind(this.client)
    return (await flushAsync()) === 'OK'
  }

  public async close(): Promise<boolean> {
    strictAssert(this.client.connected, 'Redis Client: No connection stablished to be closed.')
    const quitAsync = promisify(this.client.quit).bind(this.client)
    return (await quitAsync()) === 'OK'
  }

  private checkJson(text: string) {
    if (
      /^[\],:{}\s]*$/.test(
        text
          .replace(/\\["\\\/bfnrtu]/g, '@')
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''),
      )
    ) {
      return true
    }
    return false
  }
}
