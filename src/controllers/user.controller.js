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