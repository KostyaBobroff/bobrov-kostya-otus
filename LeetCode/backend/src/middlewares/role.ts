import { createErrorResponse } from "@/lib";
import { Role, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const checkAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.isAuthenticated()) {
    res.status(401).send(createErrorResponse(401, "Unauthorized"));
    return;
  }
  next();
};

export const checkRolesAccess = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user as User;
    if (roles.includes(role)) {
      next();
    } else {
      res.status(403).send("Forbidden");
    }
  };
};
