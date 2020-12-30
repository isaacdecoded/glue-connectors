# glue-connectors

glue-connectors is a nodeJS module for dealing with message-brokers (like rabbitmq) and data structure storages (like redis).

## Installation

```bash
npm install glue-connectors
```
or
```bash
yarn add glue-connectors
```

## Usage

### AMQP queueing
```js
import { amqp } from 'glue-connectors'

const { Subscriber, Publisher } = amqp

const subscriber = new Subscriber('AMQP_URL', 'QUEUE_NAME')
await subscriber.start(['EVENT_TO_EMIT'])

const publisher = new Publisher('AMQP_URL', 'QUEUE_NAME')
await publisher.start()
await publisher.send('MESSAGE')

await subscriber.stop()
await publisher.stop()

```

## Tests
Initialize the following docker:
```bash
sudo docker run --rm -it --hostname my-rabbit -p 15672:15672 -p 5672:5672 rabbitmq:3-management
sudo docker run --rm -it --name my-redis -p 6379:6379 redis
```
Then run the tests:
```bash
npm run test
```
or
```bash
yarn test
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)