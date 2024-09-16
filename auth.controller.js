import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Function to generate access and refresh tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// Store refresh token in Redis
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days
};

// Set cookies for accessToken and refreshToken
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  // Secure in production
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,  // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  // Secure in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  });
};

// Signup handler
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in Redis
    await storeRefreshToken(user._id, refreshToken);

    // Set cookies
    setCookies(res, accessToken, refreshToken);

    // Respond with user info
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Placeholder login route
export const login = async (req, res) => {
  res.send("Login route called");
};

// Placeholder logout route
export const logout = async (req, res) => {
  res.send("Logout route called");
};
