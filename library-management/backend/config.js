import dotenv from 'dotenv';
dotenv.config();

// Optional: Add a check here to ensure the key is loaded
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in .env file (from config.js)!");
  process.exit(1);
}