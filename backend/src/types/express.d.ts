import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        appUserId: string;
        authUserId: string;
        email: string;
      };
    }
  }
}

export {};