import { Router } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { authenticate } from "../middleware/auth.middleware";

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
    const accessToken = await loginUser(email, password);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
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
