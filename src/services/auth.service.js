import User from '../models/user.model.js';
import RefreshTokens from '../models/refreshToken.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY;

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
  const refreshToken = await createRefreshToken(user.id);
  return { accessToken, refreshToken, user: toSafeUser(user) };
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

// Creates a new refresh token for the given user ID
async function createRefreshToken(userId) {
  // Generate a random refresh token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);

  // Set the expiration date for the refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parseInt(REFRESH_EXPIRY));

  // Create the refresh token record
  const refreshToken = await RefreshTokens.create({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt
  });

  return rawToken;
}

// Refreshes the access token using a valid refresh token
export async function refreshAccessToken(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  // Hash the provided refresh token
  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await RefreshTokens.findOne({ where: { token_hash: tokenHash } });

  if (!storedToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Check if the refresh token has been revoked
  if (storedToken.revoked_at) {
    // Revoke all sessions for the user
    await storedToken.update(
      { revoked_at: new Date() },
      { where: { user_id: storedToken.user_id, revoked_at: null } }
    );
    throw new ApiError(401, 'Refresh token reuse detected all sessions revoked');
  }

  if (storedToken.expires_at < new Date()) {
    throw new ApiError(401, 'Refresh token has expired');
  }

  const user = await User.findByPk(storedToken.user_id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Revoke the old token
  await storedToken.update({ revoked_at: new Date() });

  // Create a new access token and refresh token
  const newAccessToken = await createAccessToken(user);
  const newRefreshToken = await createRefreshToken(user.id);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: toSafeUser(user) };
}

// Logs out the user by revoking their refresh token
export async function logoutUser(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  // Hash the provided refresh token
  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await RefreshTokens.findOne({ where: { token_hash: tokenHash } });

  if (!storedToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Revoke the refresh token
  await storedToken.update(
    { revoked_at: new Date() },
    { where: { user_id: storedToken.user_id, revoked_at: null } }
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}