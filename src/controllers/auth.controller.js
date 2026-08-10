import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../services/auth.service.js";
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

    const { accessToken, refreshToken, user} = await loginUser({ email, password });
    
    return res.status(200).json({ 
      success: true, 
      data: {
        accessToken,
        refreshToken,
        user
      }
    }); 
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    await logoutUser(refreshToken);

    res.status(200).json({ 
      success: true, 
      message: 'User logged out successfully' 
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const { accessToken, refreshToken, user } = await refreshAccessToken(token);

    res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
}