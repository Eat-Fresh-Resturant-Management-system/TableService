import {AmqpPublishSubscribe, Amqp } from 'typescript-amqp';

const amqp = new Amqp();

// RabbitMQ configuration
const rmqUser = 'guest';
const rmqPass = 'guest';
const rmqHost = 'rabbitmq-service';
const rmqPort = '5672';
const queueName = 'table_booking_queue'; // Define queue name
const exchangeName = 'table_booking_exchange'; // Define exchange name

let channel: AmqpPublishSubscribe | undefined;
// Establishes a connection to the server
export async function connectToRabbitMQ() {
  try {
    await amqp.connect("amqp://${rmqUser}:${rmqPass}@${rmqHost}:${rmqPort}");
    channel = await amqp.createPublisherAndSubscriber(exchangeName) as AmqpPublishSubscribe;

    console.log('Connected to RabbitMQ server');
  } catch (error) {
    console.error('Error connecting to RabbitMQ server:', error);
    throw error;
  }
}

// Publish message to RabbitMQ
export async function publishMessage(message: any) {
  try {
    // Ensure channel is initialized
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    // Publish message to exchange
    await channel.send(message);
    console.log('Message published to RabbitMQ:', message);
  } catch (error) {
    console.error('Error publishing message to RabbitMQ:', error);
    throw error;
  }
}

export function getChannel(): AmqpPublishSubscribe {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
}