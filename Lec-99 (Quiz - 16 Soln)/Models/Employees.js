/**
 * ------------------------------------------------------------------
 * Employee Model — Mongoose Schema Definition
 * ------------------------------------------------------------------
 *
 * This module defines the schema and model for Employee documents
 * stored in MongoDB. The schema specifies field types, validation
 * rules, and optional configuration such as timestamps.
 *
 * Best Practices Applied:
 * - Required field validation
 * - Default values where applicable
 * - Timestamp tracking (createdAt, updatedAt)
 * - Clean naming conventions
 * ------------------------------------------------------------------
 */

'use strict';

const mongoose = require('mongoose');

/**
 * Employee schema definition
 */
const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    language: {
      type: String,
      default: 'English',
    },
    city: {
      type: String,
      required: true,
    },
    isManager: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/**
 * Employee model
 * Collection will be automatically pluralized to "employees"
 */
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
