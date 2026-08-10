import User from '../models/user.model.js';

export async function getAllProfiles(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
  
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next();
  }
}