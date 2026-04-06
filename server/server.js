require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Init Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/colleges', require('./routes/college.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));

app.get('/', (req, res) => res.send('API Running'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
