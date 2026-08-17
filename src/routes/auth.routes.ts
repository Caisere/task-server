import { Router } from "express";
import {
  loginUser,
  registerUser,
  validateRefreshToken,
} from "../services/auth.service";
import { authenticate } from "../middleware/auth.middleware";
import { setAuthCookies } from "../lib/cookie";

export const authRouter = Router();

// register
authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // service login
    await registerUser(email, password);

    // return response
    res.status(201).json({
      success: true,
      message: "User Created Successfully. Please, login to continue",
    });
  } catch (error) {
    next(error);
  }
});

// login
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // login user
    const { id, email: userEmail, role } = await loginUser(email, password);

    setAuthCookies(res, { id, email: userEmail, role });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        id,
        email: userEmail,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { id, email, role } = await validateRefreshToken(req);

    // sign-new cookies
    setAuthCookies(res, { id, email, role });

    res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
});

// me
authRouter.get("/me", authenticate, async (req, res) => {
  res.json(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});
