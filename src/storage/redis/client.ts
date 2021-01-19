import redis, { RedisClient } from 'redis'
import { promisify } from 'util'
import { strict as strictAssert } from 'assert'

const DEFAULT_EX = 60 * 60 * 24

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

  /**
   * Returns current connection host and port in format: "host:port"
   */
  public getUrl() {
    return `${this.host}:${this.port}`
  }

  public async store<T>(key: string, data: T, expires?: number): Promise<void>
  public async store(key: string, data: string | number | object, expires?: number): Promise<void> {
    strictAssert(data, `Invalid parameter "data": cannot be undefined nor null`)
    await new Promise((resolve, reject) => {
      this.client.set(
        key,
        typeof data === 'object' ? JSON.stringify(data) : data.toString(),
        'EX',
        expires || DEFAULT_EX,
        (err) => (err ? reject(err) : resolve(true)),
      )
    })
  }

  public async retrieve<T>(key: string): Promise<T>
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

  public async remove(key: string) {
    await new Promise((resolve, reject) => {
      this.client.del(key, (err, v) => (err ? reject(err) : resolve(v)))
    })
  }

  /**
   * Exec flushall removing all keys from all Redis databases.
   */
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
