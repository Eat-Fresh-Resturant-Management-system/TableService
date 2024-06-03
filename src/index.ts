import { ApolloServer } from '@apollo/server';
import { readFileSync } from 'fs';
import { resolvers } from './resolvers/resolver';
import { connectToDatabase } from './DB/mongodb';
import { connectToRabbitMQ } from './RMQ/RMQ_connection';
import { job } from './workers/Table_bg_worker.js';
import router from './routes/tableBookingRouter';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from '@apollo/server';
import { auth } from 'express-oauth2-jwt-bearer';
import { startStandaloneServer } from '@apollo/server/standalone';
import express from 'express';

// Load type definitions from GraphQL schema file
const typeDefs = gql(readFileSync('src/schema/schema.graphql', 'utf-8'));

// JWT middleware setup
const jwtCheck = auth({
  audience: 'https://swwao.orbit.au.dk/grp-13',
  issuerBaseURL: 'https://dev-feeu3ze3mjv64zbn.eu.auth0.com/',
  tokenSigningAlg: 'RS256'
});

const startServer = async () => {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  // Start the standalone server with required context and middleware
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      // JWT check can be added to the context
      const token = req.headers.authorization || '';
      await jwtCheck(req, {}, () => {}); // Apply JWT check middleware
      return { token };
    },
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at ${url}`);

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
