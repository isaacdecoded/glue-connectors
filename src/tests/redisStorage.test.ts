import redis from '../storage/redis'

const redisClient = new redis.Client(
  'localhost',
  6379,
)
const stringValue = 'redis glue-connector test'
const objectValue = {
  name: 'John Doe',
  role: 'Tester',
}
const key = 'test:redis'

test('REDIS client: stores a retrieves a string value', async (done) => {
  try {
    await redisClient.store(key, stringValue)
    const value = await redisClient.retrieve(key)
    expect(value).toEqual(stringValue)
    done()
  } catch (e) {
    done(e)
  }
})

test('REDIS client: stores a retrieves an object value', async (done) => {
  try {
    await redisClient.store(key, objectValue)
    const value = await redisClient.retrieve(key)
    expect(value).toEqual(objectValue)
    done()
  } catch (e) {
    done(e)
  }
})

test('REDIS client: flush all data', async (done) => {
  try {
    const cleaned = await redisClient.clean()
    expect(cleaned).toEqual(true)
    done()
  } catch (e) {
    done(e)
  }
})

test('REDIS client: returns server URL', async (done) => {
  try {
    const url = await redisClient.getUrl()
    expect(url).toEqual('localhost:6379')
    done()
  } catch (e) {
    done(e)
  }
})

test('REDIS client: close connection', async (done) => {
  try {
    const closed = await redisClient.close()
    expect(closed).toEqual(true)
    done()
  } catch (e) {
    done(e)
  }
})
