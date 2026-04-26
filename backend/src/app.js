const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
const urlRoutes = require('./routes/urlRoutes');
app.use('/', urlRoutes);

module.exports = app;