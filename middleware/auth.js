import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from './errorHandler.js';

export async function authenticate(req, _res, next) {
  // TODO:
  // Hint: read Authorization: Bearer <token>. Verify with jwt.verify(token, JWT_SECRET).
  // Load User.findById(payload.sub). Attach to req.user. Any failure -> 401.
  // See: docs/API.md "Authentication", tester/tests/auth.test.js
  const {authorization} = req.headers;
  if(!authorization || !authorization.startsWith('Bearer ')){
    throw new HttpError(401, 'No token provided');
  }
  const token = authorization.split(' ')[1];
  if(!token){
    throw new HttpError(401, 'Token is missing');
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new HttpError(401, 'Invalid token');
  }
  const user = await User.findById(payload.sub);
  if(!user){
    throw new HttpError(401, 'User not found');
  }
  req.user = user;
  next();
}

export function signToken(user) {
  // TODO:
  // Hint: jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN || '7d' })
  const token = jwt.sign({sub: user._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return token;
}
