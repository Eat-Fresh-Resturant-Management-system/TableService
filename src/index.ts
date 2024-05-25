import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { resolvers } from './resolvers/resolver';
import { connectToDatabase } from './DB/mongodb';
import { connectToRabbitMQ } from './RMQ/RMQ_connection';
import { job } from './workers/Table_bg_worker.js';
const typeDefs = readFileSync('src/schema/schema.graphql', { encoding: 'utf-8' });
import  router from './routes/tableBookingRouter';

const startServer = async () => {
    const app = express();
    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

     await server.start();
    server.applyMiddleware({ app });

    // Middleware for parsing JSON requests
    app.use(express.json());

    // Mount route handlers
    app.use('/', router);

    // Start the server
    app.listen(4000, () => {
        console.log(`🚀 Server ready at ${server.graphqlPath}`)
    });
    // Adding a 15-second delay before connecting to RabbitMQ
    setTimeout(async () => {
        try {
            await connectToRabbitMQ();
            await job.start();
        } catch (error) {
            console.error("Error connecting to Rabbitmq:", error);
        }
    }, 15000); // 15 seconds in milliseconds
};

connectToDatabase().then(() => startServer().catch(error => console.error("Error starting server:", error)));

