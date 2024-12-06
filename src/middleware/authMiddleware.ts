import asyncHandler from "express-async-handler";
import { UnauthorizedError } from "../errors/errors";
import { verifyToken } from "../helper/helper";
import User from "../models/User";
import { NextFunction, Request, Response } from "express";

export const isLoggedIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    try {
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        // Get token from header
        token = req.headers.authorization.split(" ")[1];
        // Verify token
        const decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
        // Get user from token
        // @ts-ignore
        req.user = await User.findById(decoded._id).select("-password");
        next();
      }

      if (!token) {
        throw new UnauthorizedError("Please log in to proceed", "UNAUTHORIZED");
      }
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedError(
          "Session expired, please log in again",
          "SESSION_EXPIRED"
        );
      } else if (err.name === "JsonWebTokenError") {
        throw new UnauthorizedError(
          "Invalid token, please log in again",
          "INVALID_TOKEN"
        );
      } else {
        next(err);
      }
    }
  }
);

export const isAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = req.user;

    try {
      if (user.isAdmin) {
        next();
      } else {
        throw new UnauthorizedError(
          "You must be administrator to continue",
          "UNAUTHORIZED"
        );
      }
    } catch (err) {
      next(err);
    }
  }
);

module.exports = { isLoggedIn, isAdmin };
