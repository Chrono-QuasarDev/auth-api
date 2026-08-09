import { registerUser, loginUser } from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await registerUser({ email, password });

    res.status(201).json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const { accessToken, user} = await loginUser({ email, password });
    
    return res.status(200).json({ 
      success: true, 
      token: accessToken, 
      user 
    }); 
  } catch (error) {
    next(error);
  }
}