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

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)