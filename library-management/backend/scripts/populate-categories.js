import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Category from '../models/Category.js';

// This is the hardcoded list from the frontend constants.
// We include it here to make the script self-contained.
const CATEGORIES_TO_ADD = [
  "Adventure", "American Literature", "British Literature", "French Literature", 
  "German Literature", "Russian Literature", "Classics of Literature", "Biographies", 
  "Novels", "Short Stories", "Poetry", "Plays/Films/Dramas", "Romance", 
  "Science-Fiction & Fantasy", "Crime Thrillers & Mystery", "Mythology Legends & Folklore", 
  "Humour", "Children & Young Adult Reading", "Literature - Other", 
  "Engineering & Technology", "Mathematics", "Science - Physics", 
  "Science - Chemistry/Biochemistry", "Science - Biology", "Science - Earth/Agricultural/Farming", 
  "Research Methods/Statistics/Information Sys", "Environmental Issues", "History - American", 
  "History - British", "History - European", "History - Ancient", "History - Medieval/Middle Ages", 
  "History - Early Modern (c. 1450–1750)", "History - Modern (1750+)", "History - Religious", 
  "History - Royalty", "History - Warfare", "History - Schools & Universities", "History - Other", 
  "Archaeology & Anthropology", "Business/Management", "Economics", "Law & Criminology", 
  "Gender & Sexuality Studies", "Psychiatry/Psychology", "Sociology", "Politics", 
  "Parenthood & Family Relations", "Old Age & the Elderly", "Art", "Architecture", "Music", 
  "Fashion", "Journalism/Media/Writing", "Language & Communication", "Essays Letters & Speeches", 
  "Religion/Spirituality", "Philosophy & Ethics", "Cooking & Drinking", "Sports/Hobbies", 
  "How To", "Travel Writing", "Nature/Gardening/Animals", "Sexuality & Erotica", 
  "Health & Medicine", "Drugs/Alcohol/Pharmacology", "Nutrition", 
  "Encyclopedias/Dictionaries/Reference", "Teaching & Education", "Reports & Conference Proceedings", 
  "Journals"
];

// Load environment variables from the backend's .env file
dotenv.config({ path: path.resolve(process.cwd(), 'library-management', 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI;

const populateCategories = async () => {
  if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI not found. Make sure you have a .env file in the backend directory.');
    process.exit(1);
  }

  let connection;
  try {
    // Connect to MongoDB
    connection = await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully.');

    // Step 1: Clear existing categories to avoid duplicates
    console.log('🗑️ Deleting all existing categories...');
    const deleteResult = await Category.deleteMany({});
    console.log(`👍 Deleted ${deleteResult.deletedCount} old categories.`);

    // Step 2: Prepare the new categories for insertion
    const categoriesToInsert = CATEGORIES_TO_ADD.map(name => ({
      name: name,
      // You can add default descriptions here if you want
      // description: `Description for ${name}` 
    }));
    
    // Step 3: Insert the new categories into the database
    console.log(`🌱 Inserting ${categoriesToInsert.length} new categories...`);
    const insertResult = await Category.insertMany(categoriesToInsert);
    console.log(`✅ Successfully inserted ${insertResult.length} new categories.`);

  } catch (error) {
    console.error('❌ An error occurred during the population process:', error);
  } finally {
    // Disconnect from MongoDB
    if (connection) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected.');
    }
  }
};

// Run the population script
populateCategories();
