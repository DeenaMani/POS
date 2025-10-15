import Router from "express";
import { Authentication } from "./authentication.contoller";
import { ValidationService } from "./authencation.validatioRules";

const authRouter = Router();

/**
 * 🔍 Authentication Module
 * This module handles user authentication, including login, logout, and MPIN verification.
 */

/**
 * 🔍 User Login
 * Endpoint: POST /login
 * Description: Authenticates a user and returns a token.
 */
authRouter.post("/login", ValidationService.loginRules(), Authentication.login);

/**
 * 🔍 Verify user MPIN
 * Endpoint: POST /verify-mpin
 * Description: Verifies the user's MPIN for authentication.
 */
authRouter.post("/verify-mpin", ValidationService.verifyMpinRules(), Authentication.verifyMpin);

/**
 * 🔍 User Logout
 * Endpoint: POST /logout
 * Description: Logs out the user and invalidates the session.
 */
authRouter.post("/logout", Authentication.logout);

export default authRouter;