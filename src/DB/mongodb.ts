import mongoose from 'mongoose';

export async function connectToDatabase() {
  const dbUser = process.env.MONGODB_USERNAME || 'root';
  const dbPass = process.env.MONGODB_PASSWORD || 'example';
  const dbHost = process.env.MONGODB_HOSTNAME || 'mongo-service';
  const dbName = process.env.MONGODB_DBNAME || 'TableBooking';
  
  const connectionString = `mongodb://${dbUser}:${dbPass}@${dbHost}:27017/${dbName}?authSource=admin`;

  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
