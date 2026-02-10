/**
 * ------------------------------------------------------------------
 * Express + MongoDB (Mongoose) Example — Todo API
 * ------------------------------------------------------------------
 *
 * This server demonstrates:
 * 1. Connecting to MongoDB using Mongoose
 * 2. Creating and saving Todo documents
 * 3. Fetching Todo documents from the database
 * 4. Returning JSON API responses
 *
 * Best Practices:
 * - Centralized async database connection
 * - Proper error handling
 * - Clean model naming conventions
 * - Awaiting database operations
 * ------------------------------------------------------------------
 */

import express from 'express';
import mongoose from 'mongoose';
import { Todo } from './models/todo.js';

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Connect to MongoDB
 */
await mongoose.connect('mongodb://127.0.0.1:27017/todo');
console.log('MongoDB connected successfully');

/**
 * Create a new Todo document
 */
app.get('/', async (req, res) => {
  try {
    const newTodo = new Todo({
      description: 'God Of War',
      isDone: false,
      days: 4,
    });

    await newTodo.save();

    res.status(201).send('Todo created successfully');
  } catch (error) {
    console.error('Error creating Todo:', error);
    res.status(500).send('Failed to create Todo');
  }
});

/**
 * Fetch a Todo document
 */
app.get('/a', async (req, res) => {
  try {
    const todoItem = await Todo.findOne({});

    if (!todoItem) {
      return res.status(404).json({ message: 'No Todo found' });
    }

    res.json({
      title: todoItem.title,
      description: todoItem.description,
    });
  } catch (error) {
    console.error('Error fetching Todo:', error);
    res.status(500).send('Database query failed');
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
