import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function registerUser({ email, password }) {
  const isExists = await User.findOne({ where: { email }});
  if (isExists) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw(err);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ email, password: hashedPassword});

  const { password: _, ...safeUser } = user.toJSON();
  return safeUser;
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email }});
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 400;
    throw err;
  }

  const isMatch = bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 400;
    throw err;
  }

  const { password: _, ...safeUser} = user.toJSON();
  return safeUser;
}