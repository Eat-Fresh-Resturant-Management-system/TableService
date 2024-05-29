// Purpose: Connect to MongoDB
import mongoose from 'mongoose';



export async function connectToDatabase() {
    try {
      await mongoose.connect('mongodb://root:example@mongo:27017/', { dbName: "TableBooking" });
      console.log("Connected to MongoDB");
  
    //   await startServer();
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }