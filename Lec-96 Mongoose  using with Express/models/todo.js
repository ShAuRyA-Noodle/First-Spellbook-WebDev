/**
 * ------------------------------------------------------------------
 * Todo Model — Mongoose Schema Definition
 * ------------------------------------------------------------------
 *
 * This module defines the Todo schema and corresponding Mongoose
 * model. The schema specifies the structure, validation rules,
 * and default values for documents stored in the MongoDB collection.
 *
 * Best Practices Applied:
 * - Consistent camelCase field naming
 * - Explicit validation rules
 * - Timestamp tracking for createdAt / updatedAt
 * - Clear model naming aligned with collection purpose
 * ------------------------------------------------------------------
 */

import mongoose from 'mongoose';

/**
 * Todo schema definition
 */
const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'Shreya Punj',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isDone: {
      type: Boolean,
      default: false,
    },
    days: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

/**
 * Todo model
 * Collection name will be automatically pluralized (todos)
 */
export const Todo = mongoose.model('Todo', todoSchema);
