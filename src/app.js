import express from "express";
import authRoutes from './routes/auth.route.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message });
});

export default app;