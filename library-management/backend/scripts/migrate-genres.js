import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Book from '../models/Book.js';

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI;

const migrateGenresToCategories = async () => {
  if (!MONGO_URI) {
    console.error('Error: MONGO_URI not found in backend/.env file.');
    process.exit(1);
  }

  let connection;
  try {
    // Connect to MongoDB
    connection = await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');

    // Find books that have a 'genre' field but no 'categories' field
    const booksToMigrate = await Book.find({ 
      genre: { $exists: true, $ne: null, $ne: '' },
      categories: { $exists: false } 
    });

    if (booksToMigrate.length === 0) {
      console.log('No books found that need migration. Database is already up to date.');
      return;
    }

    console.log(`Found ${booksToMigrate.length} books to migrate...`);

    const bulkOps = booksToMigrate.map(book => ({
      updateOne: {
        filter: { _id: book._id },
        update: {
          $set: { categories: [book.genre] }, // Put the old genre into the new categories array
          $unset: { genre: '' } // Remove the old genre field
        }
      }
    }));

    // Execute the bulk update
    const result = await Book.bulkWrite(bulkOps);

    console.log('Migration complete!');
    console.log(`- ${result.modifiedCount} books were successfully updated.`);
    if (result.writeErrors && result.writeErrors.length > 0) {
      console.error('Some errors occurred during migration:');
      console.error(result.writeErrors);
    }

  } catch (error) {
    console.error('An error occurred during the migration process:', error);
  } finally {
    // Disconnect from MongoDB
    if (connection) {
      await mongoose.disconnect();
      console.log('MongoDB disconnected.');
    }
  }
};

// Run the migration
migrateGenresToCategories();
