import gql from "graphql-tag";

export const typeDefs = gql`
  # highlight-start
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )
  # highlight-end

  type TableBooking @key(fields: "id") {
    id: ID!
    userName: String!
    tableName: String!
    bookingDate: String!
    bookingDuration: Int!
    bookingStatus: String!
  }

  type Table {
    tableId: ID!
    tableName: String!
    capacity: Int!
    isAvailable: Boolean!
  }

  type Query {
    getAllTableBookings: [TableBooking]
    getAllTables: [Table]
    getAvailableTables: [Table]
    getTableBookingByUserName(userName: String!): [TableBooking]
  }

  type Mutation {
    createTableBooking(
      tableName: String!
      userName: String!
      bookingDuration: Int!
    ): TableBooking
    createTable(tableName: String!, capacity: Int!): Table
    toggleTableAvailability(tableName: String!): Table
    deleteTableBooking(userName: String!): TableBooking
    deleteTable(tableName: String!): Table
  }
`;
