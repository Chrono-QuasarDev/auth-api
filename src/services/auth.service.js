import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

function toSafeUser(user) {
  const { password_hash: _, ...safeUser } = user.toJSON();
  return safeUser;
}

export async function registerUser({ email, password }) {
  const existingUser = await User.findOne({ where: { email }});
  if (existingUser) {
    throw new ApiError(409, 'Email already in use');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ email, password_hash });

  return toSafeUser(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = createAccessToken(user);
  return { accessToken, user: toSafeUser(user) };
}

function createAccessToken(user) {
  if (!JWT_SECRET) throw new ApiError(500, 'JWT_SECRET is not configured');

  const payload = {
    sub: user.id,
    email: user.email,
    user: user.role
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });

  return token
}