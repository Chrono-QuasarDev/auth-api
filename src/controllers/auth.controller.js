import { registerUser, loginUser } from "../services/auth.service.js";

export async function register(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email and password are required'
    });
  }

  const accessToken = await registerUser({ email, password });
  res.status(201).json({ success: true, accessToken });
}

export async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const user = await loginUser({ email, password });
  return res.status(201).json({ success: true, data: user });
}