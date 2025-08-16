const express = require("express");
const mongoose = require("mongoose");
const nocache = require("nocache");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const authMiddleware = require("./middleware/authMiddleware");
require("dotenv").config();

const cors = require('cors');

const app = express();

app.use(cors({
  origin: [
    'https://sifon.sandmgroup.in',      // subdomain
    'https://livora.sandmgroup.in',      // subdomain
    'https://enencia.sandmgroup.in',      // subdomain
    'https://www.sandmgroup.in',        // main domain  (optional)
    'https://sandmgroup.in'             // optional
  ],
  methods: ['GET'],
  credentials: true
}));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(helmet());
app.use(nocache());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
// Routes
app.use("/", require("./routes/authRoutes")); // Unprotected routes (e.g., /admin/login)
app.use("/", require("./routes/publicRoutes")); // Public API routes (e.g., /api/brands)
app.use("/admin", authMiddleware, require("./routes/adminRoutes")); // Protected routes (e.g., /admin/dashboard)
app.use("/api", require("./routes/apiRoutes"));

// Error Handling Middleware
// app.use(require('./middleware/errorMiddleware'));

// Start Server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
