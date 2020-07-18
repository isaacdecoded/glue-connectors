import amqp from './queue/amqp'

async function startAmqp() {
  try {
    const s = new amqp.Subscriber('amqp://localhost?heartbeat=60', 'test')
    s.on('helloworld', console.log)
    await s.start()
  } catch (e) {
    console.log(e.message)
  }
}

startAmqp()

export { amqp }
