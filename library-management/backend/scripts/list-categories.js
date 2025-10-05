import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Book from '../models/Book.js';

// Construct a reliable path to the .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

const testCategoryQuery = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not found. Please ensure it is set in', envPath);
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log('✅ MongoDB connected for script.');

    const categoryToTest = 'Adventure';
    const query = { categories: { $regex: categoryToTest, $options: "i" } };

    console.log(`\n--- Running distinct query for categories... ---
`);
    const categories = await Book.distinct('categories');
    console.log(categories);

    console.log(`\n--- Running find query: ${JSON.stringify(query)} ---
`);
    const books = await Book.find(query);
    
    if (books.length > 0) {
      console.log(`✅ Found ${books.length} book(s) with the category '${categoryToTest}':
`);
      books.forEach(book => {
        console.log(`- ${book.title} (Categories: [${book.categories.join(', ')}])
`);
      });
    } else {
      console.log(`❌ No books found with the category '${categoryToTest}' using the find query.
`);
    }
    console.log('---------------------------------------------------\n');

  } catch (error) {
    console.error('❌ Error running script:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log('👋 MongoDB disconnected.');
    }
  }
};

testCategoryQuery();
