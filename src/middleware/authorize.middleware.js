import { ApiError } from '../utils/ApiError.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
    } 

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, 'Insufficient permission'));
    }

    next();
  }
}