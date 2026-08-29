import { Router } from "express";
import {
  loginUser,
  loginWithGoogle,
  registerUser,
  startGoogleLogin,
  validateRefreshToken,
} from "../services/auth.service";
import { authenticate } from "../middleware/auth.middleware";
import { clearAuthCookies, setAuthCookies } from "../lib/cookie";
import {
  authenticationRateLimit,
  refreshRateLimit,
} from "../middleware/rateLimit.middleware";

export const authRouter = Router();

// register
authRouter.post(
  "/register",
  authenticationRateLimit,
  async (req, res, next) => {
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
  },
);

// login
authRouter.post("/login", authenticationRateLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // login user
    const payload = await loginUser(email, password);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    setAuthCookies(res, {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", refreshRateLimit, async (req, res, next) => {
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
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// google auth
authRouter.get("/google", (_req, res) => {
  const googleAuthUrl = startGoogleLogin();
  res.redirect(googleAuthUrl);
});

authRouter.get("/callback/google", async (req, res, next) => {
  try {
    const code = req.query.code as string | undefined;

    const payload = await loginWithGoogle(code);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    setAuthCookies(res, {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (_req, res) => {
  clearAuthCookies(res);

  res.status(201).json({
    success: true,
    message: "Logged out cleanly",
  });
});
