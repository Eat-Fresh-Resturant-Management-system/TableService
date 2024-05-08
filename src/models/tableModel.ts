import mongoose, { Schema, Document } from "mongoose";

export interface ITableBooking extends Document {
    tableName: string;
    userName: string;
    bookingDate: Date;
    bookingDuration: number; // Duration in hours
    bookingEndTime: Date;
    bookingStatus: string;
}

export interface ITable extends Document {
    tableId: string;
    tableName: { type: String, unique: true },
    capacity: number;
    isAvailable: boolean;
}

export const table_schema = new Schema<ITable>({
    tableId: { type: String, unique: true},
    tableName: { type: String, unique: true, required: true},
    capacity: { type: Number},
    isAvailable: { type: Boolean }
});

export const table_booking_schema = new Schema<ITableBooking>({
    tableName: { type: String, required: true },
    userName: { type: String, required: true },
    bookingDate: { type: Date},
    bookingDuration: { type: Number, required: true }, // Duration in hours
    bookingStatus: { type: String, default: "Waiting" } // Default status to "Waiting"

});

export const TableBooking = mongoose.model<ITableBooking>('TableBooking', table_booking_schema);
export const Table = mongoose.model<ITable>('Table', table_schema);
