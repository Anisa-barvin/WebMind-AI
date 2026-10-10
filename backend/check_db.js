const mongoose = require('mongoose');
const Website = require('./models/Website');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const website = await Website.findOne().sort({ createdAt: -1 });
  console.log("Current Stage:", website.currentStage);
  console.log("Status:", website.status);
  console.log("Pages Found:", website.pagesFound);
  console.log("Pages Processed:", website.pagesProcessed);
  console.log("Embeddings Generated:", website.embeddingsGenerated);
  console.log("Logs:", website.logs.map(l => l.message).join('\n'));
  process.exit(0);
}

run().catch(console.error);
