import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailScheduler from './emailScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('TimeCapsule Backend is running...');
});

// Start the scheduler
emailScheduler();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
