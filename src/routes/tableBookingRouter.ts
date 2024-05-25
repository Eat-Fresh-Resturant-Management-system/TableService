import express, { Request, Response } from 'express';
import { Table,TableBooking } from '../models/tableModel.js'; // Import the TableBooking model


// Create a new router instance
const router = express.Router();

// Define route handlers
router.get('/', (req: Request, res: Response) => {
    
    //show the available endpoints in the table booking service
    res.json({ message: 'Table booking service is up and running (Use /Graphql for Graphql queries)',
     endpoints: ['/table-bookings', '/tables', '/tables/available',
      '/table-bookings/:userName', '/table-bookings', '/tables',
       '/tables/:tableName/toggle-availability', '/table-bookings/:userName',
        '/tables/:tableName'] });
});
// GetTableBookings
router.get('/table-bookings', async (req, res) => {
    try {
        const tableBookings = await TableBooking.find();
        res.json(tableBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GetTables
router.get('/tables', async (req, res) => {
    try {
        const tables = await Table.find();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GetAvailableTables
router.get('/tables/available', async (req, res) => {
    try {
        const tables = await Table.find({ isAvailable: true });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GetTableBookingByUserName
router.get('/table-bookings/:userName', async (req, res) => {
    const { userName } = req.params;
    try {
        const bookings = await TableBooking.find({ userName });
        if (!bookings) {
            return res.status(404).json({ message: `No bookings found for user '${userName}'.` });
        }
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new table booking
router.post('/table-bookings', async (req, res) => {
    try {
        const { tableName, userName, bookingDuration } = req.body;
        // Create a new table booking instance
        const newTableBooking = new TableBooking({
            tableName,
            userName,
            bookingDate: new Date(),
            bookingDuration,
            bookingStatus: "Waiting" // Set default status to "Waiting"
        });
        // Save the new table booking
        const savedBooking = await newTableBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create a new table
router.post('/tables', async (req, res) => {
    try {
        const { tableName, capacity } = req.body;
        // Create a new table instance
        const newTable = new Table({
            tableName,
            capacity,
            isAvailable: true // Set default availability to true
        });
        // Save the new table
        const savedTable = await newTable.save();
        res.status(201).json(savedTable);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT toggle table availability
router.put('/tables/:tableName/toggle-availability', async (req, res) => {
    const { tableName } = req.params;
    try {
        const tableBooking = await TableBooking.findOne({ tableName });
        if (!tableBooking) {
            return res.status(404).json({ message: `Table booking for table '${tableName}' not found` });
        }
        // Toggle the booking status
        tableBooking.bookingStatus = tableBooking.bookingStatus === "Waiting" ? "Serving" : "Waiting";
        await tableBooking.save();
        res.json(tableBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE table booking by userName
router.delete('/table-bookings/:userName', async (req, res) => {
    const { userName } = req.params;
    try {
        const deletedBookings = await TableBooking.deleteMany({ userName });
        if (deletedBookings.deletedCount === 0) {
            return res.status(404).json({ message: `No bookings found for user '${userName}'.` });
        }
        res.json({ success: true, message: `Bookings for user '${userName}' were deleted.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE table by tableName
router.delete('/tables/:tableName', async (req, res) => {
    const { tableName } = req.params;
    try {
        const deletedTable = await Table.findOneAndDelete({ tableName });
        if (!deletedTable) {
            return res.status(404).json({ message: `Table with name '${tableName}' not found.` });
        }
        res.json({ success: true, message: `Table '${tableName}' was deleted.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Export the router
export default router;