import mongoose from "mongoose";
import { Table, TableBooking } from "../models/tableModel.js"; // Importing Table and TableBooking models
import { getChannel, publishMessage } from "../RMQ/RMQ_connection.js";

interface TableBookingInput {
  tableName: string;
  userName: string;
  bookingDate: Date;
  bookingDuration: number;
}

interface TableInput {
  tableName: string;
  capacity: number;
}

export const resolvers = {
  TableBooking: {
    __resolveReference: async (reference) => {
      return await TableBooking.findById(reference.id);
    },
  },
  Query: {
    getAllTableBookings: async () => {
      return await TableBooking.find();
    },
    getAllTables: async () => {
      return await Table.find();
    },
    getAvailableTables: async () => {
      return await Table.find({ isAvailable: true });
    },
    getTableBookingByUserName: async (_: any, { userName }: { userName: string }) => {
      const bookings = await TableBooking.find({ userName });
      if (!bookings) {
        throw new Error(`No bookings found for user '${userName}'.`);
      }
      return bookings;
    },
  },
  Mutation: {
    createTableBooking: async (_: any, { tableName, userName, bookingDuration }: TableBookingInput) => {
      const channel = getChannel();
      const table = await Table.findOne({ tableName });

      if (!table) {
        throw new Error(`Table with name '${tableName}' not found.`);
      }
      if (!table.isAvailable) {
        throw new Error(`Table '${tableName}' is not available.`);
      }

      const bookingDate = new Date();
      const bookingEndTime = new Date(bookingDate);
      bookingEndTime.setHours(bookingEndTime.getHours() + bookingDuration);

      table.isAvailable = false;
      await table.save();

      const newTableBooking = new TableBooking({
        tableName,
        userName,
        bookingDate,
        bookingDuration,
        bookingEndTime,
        bookingStatus: "Serving"
      });
      await newTableBooking.save();
      await publishMessage(newTableBooking.tableName);

      return newTableBooking;
    },
    createTable: async (_: any, { tableName, capacity }: TableInput) => {
      const newTable = new Table({ tableName, capacity, isAvailable: true });
      const savedTable = await newTable.save();
      savedTable.tableId = savedTable._id.toString();
      await savedTable.save();

      return savedTable;
    },
    toggleTableAvailability: async (_: any, { tableName }: { tableName: string }) => {
      const table = await Table.findOne({ tableName });
      if (!table) {
        throw new Error(`Table with name '${tableName}' not found.`);
      }
      table.isAvailable = !table.isAvailable;
      await table.save();
      return table;
    },
    deleteTable: async (_: any, { tableName }: { tableName: string }) => {
      const table = await Table.findOne({ tableName });
      if (!table) {
        throw new Error(`Table with name '${tableName}' not found.`);
      }
      await table.deleteOne();
      return { success: true, message: `Table '${tableName}' was deleted.` };
    },
    deleteTableBooking: async (_: any, { userName }: { userName: string }) => {
      const bookings = await TableBooking.find({ userName });
      if (!bookings.length) {
        throw new Error(`No bookings found for user '${userName}'.`);
      }
      await TableBooking.deleteMany({ userName });
      return { success: true, message: `Bookings for user '${userName}' were deleted.` };
    },
  },
};
