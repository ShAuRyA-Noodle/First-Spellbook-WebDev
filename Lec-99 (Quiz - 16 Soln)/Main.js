/**
 * ------------------------------------------------------------------
 * Employee Random Data Generator — Express + MongoDB
 * ------------------------------------------------------------------
 *
 * This server:
 * 1. Connects to MongoDB using Mongoose
 * 2. Renders the homepage using EJS templates
 * 3. Generates randomized employee records
 * 4. Clears the collection before regenerating sample data
 *
 * Best Practices:
 * - Await database connection before server operations
 * - Safe random selection logic
 * - Centralized async error handling
 * - Environment-based port configuration
 * ------------------------------------------------------------------
 */

'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Employee = require('./Models/Employees');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * MongoDB connection
 */
async function connectDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Company');
  console.log('MongoDB connected successfully');
}
connectDB();

/**
 * Configure view engine
 */
app.set('view engine', 'ejs');

/**
 * Utility function — get random element from array
 */
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Home route
 */
app.get('/', (req, res) => {
  res.render('index', { foo: 'FOO' });
});

/**
 * Generate random employee dataset
 */
app.get('/generate', async (req, res) => {
  try {
    await Employee.deleteMany({});

    const randomNames = ['Shaurya', 'Shreya', 'Sanjeev', 'Rajni'];
    const randomLang = ['English', 'Hindi', 'French', 'Punjabi'];
    const randomCity = ['Delhi', 'Goa', 'Jaipur', 'Chandigarh'];

    const employees = [];

    for (let i = 0; i < 10; i++) {
      employees.push({
        name: getRandom(randomNames),
        salary: Math.floor(Math.random() * 70000),
        language: getRandom(randomLang),
        city: getRandom(randomCity),
        isManager: Math.random() > 0.5,
      });
    }

    await Employee.insertMany(employees);

    console.log('Random employee dataset generated successfully');

    res.render('index', { foo: 'FOO' });

  } catch (error) {
    console.error('Error generating employees:', error);
    res.status(500).send('Failed to generate employees');
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
