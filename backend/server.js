const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');

// Load env vars FIRST
dotenv.config();

const connectDB = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const examRoutes = require('./src/routes/examRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const placementRoutes = require('./src/routes/placementRoutes');
const aiTutorRoutes = require('./src/routes/aiTutorRoutes');
const exerciseRoutes = require('./src/routes/exerciseRoutes');
const placementConfigRoutes = require('./src/routes/placementConfigRoutes'); // Added this line
const courseRoutes = require('./src/routes/courseRoutes'); // Added this line
const mockRoutes = require('./src/routes/mockRoutes');
const officialMockRoutes = require('./src/routes/officialMockExamRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
require('./src/config/passport'); // Initialize passport

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: [/^http:\/\/localhost:\d+$/, process.env.FRONTEND_URL].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
    }
});
require('./src/sockets/socketManager')(io);

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cors({
    origin: [/^http:\/\/localhost:\d+$/, process.env.FRONTEND_URL].filter(Boolean),
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    xFrameOptions: false,
    contentSecurityPolicy: false
}));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(passport.initialize());

// Routes
app.use('/api/users', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/placement-config', placementConfigRoutes); // Added this line
app.use('/api/courses', courseRoutes); // Added this line
app.use('/api/mock-exams', mockRoutes);
app.use('/api/official-mocks', officialMockRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running...' });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Trigger nodemon restart

// Trigger nodemon restart
