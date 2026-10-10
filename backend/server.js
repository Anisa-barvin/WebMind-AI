require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const documentationRoutes = require('./routes/documentationRoutes');

// Verify key environment variables
console.log('\n=== Environment Variable Checks ===');
console.log(`MONGO_URI: ${process.env.MONGODB_URI ? 'Connected to configured URI' : 'MISSING (Critical)'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Configured' : 'MISSING (Critical)'}`);
console.log(
  `GROQ_API_KEY: ${process.env.GROQ_API_KEY
    ? "Configured"
    : "MISSING (Critical)"
  }`
);
console.log(`CHROMA_URL: ${process.env.CHROMA_URL || 'NOT SET (Fallback to Mongo)'}`);
console.log('===================================\n');

// Connect to MongoDB database
connectDB();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://web-mind-si-2k65.vercel.app', // production Vercel URL
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle OPTIONS preflight for all routes explicitly
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documentation', documentationRoutes);

// Base health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WebMind AI Backend is running smoothly.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
