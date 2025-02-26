// import express from "express";
// const app = express();
// import cors from "cors";

// // middleware to allow cross-origin requests
// app.use(cors());
// app.use(express.json());

// // SIGN IN
// app.post("/sign-in", async (req, res) => {
//   const { email, password } = req.body;
//   console.log(
//     `received login attempt from user: ${email}, password: ${password}`
//   );

//   // check if the email already exists in the database
//   try {
//     const check = await collection.findOne({ email: email });
//     if (check) {
//       res.json("exists");
//     } else {
//       res.json("notexists");
//     }
//   } catch (e) {
//     res.json("notexists");
//   }

//   // validate the credentials against database
//   // if (email === "Test" || password === "password") {
//   //   return res.status(200).json({ message: "login successful" });
//   // } else {
//   //   return res.status(401).json({ message: "invalid credentials" });
//   // }
// });


// // SIGN UP
// app.post("/sign-up", async (req, res) => {
//   const { username, email, password } = req.body;
//   const data = {
//     email: email,
//     password: password
//   }

//   // check if the email already exists in the database
//   try {
//     const check = await collection.findOne({ email: email });
//     if (check) {
//       res.json("exists");
//     } else {
//       res.json("does not exist");
//       await collection.insertMany([data]) // insert into the collection
//     }
//   } catch (e) {
//     res.json("does not exists");
//   }

//   // validate the credentials against database
//   // if (email === "Test" || password === "password") {
//   //   return res.status(200).json({ message: "login successful" });
//   // } else {
//   //   return res.status(401).json({ message: "invalid credentials" });
//   // }
// });

// // start the server
// const PORT = 8000;
// app.listen(PORT, () => {
//   console.log(`server is running on http://localhost:${PORT}`);
// });


// // nodemon server.js


import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database.js';  
import authRoutes from './routes/authRoutes.js';
import corsOptions from './config/corsOptions.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { logger } from './utils/logger.js';


dotenv.config();
const app = express();

// Apply CORS before other middleware
app.use(cors(corsOptions));
app.use(express.json());

// console.log('MongoDB URI:', process.env.MONGO_URI);
// console.log('PORT:', process.env.PORT);


// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Middleware
app.use(helmet()); // Set security headers
app.use(cors(corsOptions));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(express.json({ limit: '10kb' })); // Body parser with size limit

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});