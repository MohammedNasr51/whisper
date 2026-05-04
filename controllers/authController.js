import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function signup(req, res, next) {
  // TODO:
  // Hint: validate already ran (see routes). Pull { username, email, password, displayName } from req.body.
  const { username, email, password, displayName } = req.body;
  // Check duplicate email/username -> 409. Hash password with User.hashPassword, create user,
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new HttpError(409, "User already exists");
  }
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    username,
    email,
    passwordHash,
    displayName,
  });
  const token = signToken(user);
  res.status(201).json({ token, user });
  // signToken(user), respond 201 { token, user }. toJSON strips passwordHash automatically.
  // Mongo duplicate-key errors (err.code === 11000) must also become 409.
  // See: docs/API.md "POST /api/auth/signup", tester/tests/auth.test.js
}

export async function login(req, res, next) {
  // TODO:
  // Hint: find user by email. If missing OR comparePassword fails, 401 with a GENERIC message
  // (don't leak which half was wrong). On success return { token, user }.
  // See: docs/API.md "POST /api/auth/login", tester/tests/auth.test.js

  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    throw new HttpError(401, 'Invalid email or password');
  }
  const isPasswordValid = await user.comparePassword(password);
  if(!isPasswordValid){
    throw new HttpError(401, 'Invalid email or password');
  }
  const token = signToken(user);
  res.status(200).json({ token, user });
}

export async function me(req, res) {
  // TODO:
  // Hint: authenticate middleware has already attached the user — just return it.
  // See: docs/API.md "GET /api/auth/me", tester/tests/auth.test.js
  res.status(200).json(req.user);
}
