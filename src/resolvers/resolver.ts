import mongoose from "mongoose";
import { Table, TableBooking } from "../models/tableModel.js"; // Importing Table and TableBooking models
import { getChannel , publishMessage } from "../RMQ/RMQ_connection.js";


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
  Query: {
    getAllTableBookings: async () => {
      return await TableBooking.find();
    },
    getAllTables: async () => {
      return await Table.find(); // Correcting to use TableBooking model
    },
    getAvailableTables: async () => {
      return await Table.find({ isAvailable: true });
    },
    getTableBookingByUserName: async (_: any, { userName }: { userName: string }) => {
      try {
        const bookings = await TableBooking.find({ userName });
        if (!bookings) {
          throw new Error(`No bookings found for user '${userName}'.`);
        }
        return bookings;
      } catch (error) {
        throw new Error(`Failed to get bookings by user name: ${error.message}`);
      }
    },
  },
  Mutation: {
    createTableBooking: async (
      _: any,
      { tableName, userName, bookingDuration }: TableBookingInput,
      context: any
    ) => {
      try {
        const channel = getChannel();

        // Find the table by its name
        const table = await Table.findOne({ tableName });

        if (!table) {
          throw new Error(`Table with name '${tableName}' not found.`);
        }
        // Check if the table is available
        if (!table.isAvailable) {
          throw new Error(`Table '${tableName}' is not available.`);
        }

        const bookingDate = new Date();

        // Calculate the end time of the booking
        const bookingEndTime = new Date(bookingDate);
        bookingEndTime.setHours(bookingEndTime.getHours() + bookingDuration);

        // Update the availability status of the table for the booking duration
        table.isAvailable = false; // Assuming table becomes unavailable during booking
        await table.save();

        // Create a new table booking instance
        const newTableBooking = new TableBooking({
          tableName,
          userName,
          bookingDate,
          bookingDuration,
          bookingEndTime,
          bookingStatus: "Serving" // Set status to "Serving"

        });
        await newTableBooking.save();
        // Publish a message containing the details of the new booking
        await publishMessage(newTableBooking.tableName);

        // Save the new table booking
        return newTableBooking;
      } catch (error) {
        throw new Error(`Failed to create table booking: ${error.message}`);
      }
    },

    createTable: async (
      _: any,
      { tableName, capacity }: { tableName: string; capacity: number }
    ) => {
      try {
        // Create a new table instance
        const newTable = new Table({ tableName, capacity, isAvailable: true });

        // Save the new table to the database
        const savedTable = await newTable.save();

        // Assign the generated MongoDB ID to the tableId field
        savedTable.tableId = savedTable._id.toString(); // Convert ObjectId to string

        // Update the table with the assigned tableId
        await savedTable.save();

        return savedTable; // Return the updated table with tableId
      } catch (error) {
        throw new Error(`Failed to create table: ${error.message}`);
      }
    },
    toggleTableAvailability: async (
      _: any,
      { tableName }: { tableName: string }
    ) => {
      try {
        // Find the table by its name
        const table = await Table.findOne({ tableName });

        if (!table) {
          throw new Error(`Table with name '${tableName}' not found.`);
        }
        // Toggle the availability
        table.isAvailable = !table.isAvailable;

        // Save the updated table
        await table.save();
        // Create a success message
        const Confirm = `Table availability toggled successfully: ${
          table.isAvailable ? "Available" : "Not available"
        }`;

        // Log the message for verification
        console.log(Confirm);

        return table;
      } catch (error) {
        throw new Error(
          `Failed to toggle table availability: ${error.message}`
        );
      }
    },
    deleteTable: async (_: any, { tableName }: { tableName: string }) => {
      try {
        const table = await Table.findOne({ tableName });
        if (!table) {
          throw new Error(`Table with name '${tableName}' not found.`);
        }
        await table.deleteOne();
        return { success: true, message: `Table '${tableName}' was deleted.` };
      } catch (error) {
        throw new Error(`Failed to delete table: ${error.message}`);
      }
    },
    deleteTableBooking: async (_: any, { userName }: { userName: string }) => {
      try {
        const bookings = await TableBooking.find({ userName });
        if (!bookings.length) {
          throw new Error(`No bookings found for user '${userName}'.`);
        }
        await TableBooking.deleteMany({ userName });
        return { success: true, message: `Bookings for user '${userName}' were deleted.` };
      } catch (error) {
        throw new Error(`Failed to delete bookings: ${error.message}`);
      }
    },
  },
};
