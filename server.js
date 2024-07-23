const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const socketServer = require('./socket');
const cors = require('cors'); // Import cors

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cors()); // Use cors middleware

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

socketServer(server);
