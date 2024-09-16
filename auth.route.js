import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);  // POST request for signup
router.post("/login", login);    // POST request for login
router.post("/logout", logout);  // POST request for logout

export default router;
