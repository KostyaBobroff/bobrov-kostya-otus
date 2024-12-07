import { Role, User } from "@prisma/client";
import { Request, Response } from "express";
import { createErrorResponse } from "./response";

export const checkUserPermissions = (req: Request, userId: number) => {
  const user = req.user as User;
  return user.role !== Role.ADMIN && userId !== user.id;
};
