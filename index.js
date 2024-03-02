// app.js

const express = require('express');
const bodyParser = require('body-parser');
const countryRoutes = require('./routes/countryRoutes');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 8001;

// Connect to MongoDB
connectDB("mongodb://127.0.0.1:27017/country_db");

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to handle routes related to countries
app.use('/country', countryRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
