import User from "../models/user.model.js";

export async function getProfile(req, res, next) {
  const user = await User.findByPk(req.user.sub, {
    attributes: { exclude: ['password_hash'] }
  });

  return res.status(200).json({
    success: true,
    data: user
  });
}

export async function deleteProfile(req, res, next) {
  const user = await User.findByPk(req.user.sub);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.destroy();

  return res.status(200).json({
    success: true,
    message: 'Profile deleted successfully'
  });
}