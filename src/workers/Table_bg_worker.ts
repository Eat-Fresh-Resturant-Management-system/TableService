import { CronJob } from 'cron';
import { connectToRabbitMQ, publishMessage, getChannel } from '../RMQ/RMQ_connection.js'; // Import RabbitMQ connection functions
import { Table } from "../models/tableModel.js"; // Import your Table model

// Define the job to run every 10 seconds
export const job = new CronJob('*/30 * * * * *', async () => {
    try {
      // Ensure connection to RabbitMQ server
      await connectToRabbitMQ();
  
      // Get count of available tables from your application's database
      const availableTablesCount = await Table.countDocuments({ isAvailable: true });
      const unavailableTablesCount = await Table.countDocuments({ isAvailable: false });
  
      // Check if there are no tables available
      if (availableTablesCount === 0 && unavailableTablesCount === 0) {
        // Construct message for no tables available
        const message = {
          status: 'No tables available',
        };
  
        // Publish message to RabbitMQ exchange
        await publishMessage(message);
        console.log('No tables available message sent');
      } else {
        // Construct message with table counts
        const message = {
          availableTablesCount,
          unavailableTablesCount,
        };
  
        // Publish message to RabbitMQ exchange
        await publishMessage(message);
        console.log('Table count message sent:', message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
});

