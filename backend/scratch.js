require('dotenv').config();
const mongoose = require('mongoose');

async function dropAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    const collections = ['users', 'workers', 'employers', 'scores', 'applications', 'jobs', 'verifications', 'disputes'];
    for (const c of collections) {
      try {
        await mongoose.connection.db.dropCollection(c);
        console.log(`Dropped ${c}`);
      } catch (e) {
        console.log(`Failed to drop ${c} (might not exist)`);
      }
    }
    console.log("Database cleared for the new Email-based schema.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

dropAll();
