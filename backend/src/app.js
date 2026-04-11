const express = require("express");
const app = express();

const urlRoutes = require("./routes/urlRoutes");

app.use(express.json());

// routes
app.use("/api", urlRoutes);

module.exports = app;