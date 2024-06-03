import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { resolvers } from './resolvers/resolver';
import { connectToDatabase } from './DB/mongodb';
import { connectToRabbitMQ } from './RMQ/RMQ_connection';
import { job } from './workers/Table_bg_worker.js';
import router from './routes/tableBookingRouter';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'apollo-server-express';
import { auth } from 'express-oauth2-jwt-bearer';


const typeDefs = gql(readFileSync('src/schema/schema.graphql','utf-16le' ));

// const typeDefs = gql`
// type schema {
//     query: Query
//     mutation: Mutation
//   }
  
//   type TableBooking {
//     id: ID!
//     userName: String!
//     tableName: String!
//     bookingDate: String!
//     bookingDuration: Int!
//     bookingStatus: String!
//   }
  
//   type Table {
//     tableId: ID!
//     tableName: String!
//     capacity: Int!
//     isAvailable: Boolean!
//   }
  
//   type Query {
//     getAllTableBookings: [TableBooking]
//     getAllTables: [Table]
//     getAvailableTables: [Table]
//     getTableBookingByUserName(userName: String!): [TableBooking]
//   }
  
//   type Mutation {
//     createTableBooking(tableName: String!, userName: String!, bookingDuration: Int!): TableBooking
//     createTable(tableName: String!, capacity: Int!): Table
//     toggleTableAvailability(tableName: String!): Table
//     deleteTableBooking(userName: String!): TableBooking
//     deleteTable(tableName: String!): Table
//   }
//   `;


const startServer = async () => {
    const app = express();
    const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs, resolvers })
    });

    const jwtCheck = auth({
      audience: 'https://swwao.orbit.au.dk/grp-13',
      issuerBaseURL: 'https://dev-feeu3ze3mjv64zbn.eu.auth0.com/',
      tokenSigningAlg: 'RS256'
    });
    
    // Enforce JWT authentication on all endpoints
    // app.use(jwtCheck);
    
    
    await server.start();
    server.applyMiddleware({ app });

    // Middleware for parsing JSON requests
    app.use(express.json());

    // Mount route handlers
    app.use('/', router);

    // Start the server
    app.listen(4000, () => {
        console.log(`🚀 Server ready at ${server.graphqlPath}`);
    });

    // Adding a 15-second delay before connecting to RabbitMQ
    setTimeout(async () => {
        try {
            await connectToRabbitMQ();
            // await job.start();
        } catch (error) {
            console.error("Error connecting to RabbitMQ:", error);
        }
    }, 15000); // 15 seconds in milliseconds
};

connectToDatabase().then(() => startServer().catch(error => console.error("Error starting server:", error)));
