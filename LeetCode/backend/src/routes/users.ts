import { Router } from "express";
import { prisma } from "@/config";
import { createErrorResponse, createSuccessResponse } from "@/lib";
import passport from "passport";
import { checkAuthenticated, checkRolesAccess } from "@/middlewares/role";
import { Role, User } from "@prisma/client";
import { checkUserPermissions } from "@/lib/permissions";

const router = Router();

router.get(
  "/list",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN]),
  async (req, res) => {
    /* #swagger.tags = ['Users']
 #swagger.path = '/api/user/list'
 #swagger.security = [{
            "apiKeyAuth": []
    }]
 */
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.send(createSuccessResponse(users));
  },
);

router.post("/login", passport.authenticate("local"), (req, res) => {
  /* #swagger.tags = ['Users']
 #swagger.path = '/api/user/login'
 */

  console.log("You are logged in!", req.session);
  res.send(createSuccessResponse(req.user));
});

router.get("/me", checkAuthenticated, (req, res) => {
  /* #swagger.tags = ['Users']
 #swagger.path = '/api/user/me'
 #swagger.security = [{
            "apiKeyAuth": []
    }]
 */
  res.send(createSuccessResponse(req.user));
});

router.post("/signup", async (req, res) => {
  /* #swagger.tags = ['Users']
 #swagger.path = '/api/user'
 */
  const { name, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    res.status(400).send(createErrorResponse(400, "User already exists"));
    return;
  }

  try {
    const user = await prisma.user.create({
      data: { name, email, password, role },
    });

    req.logIn(user, (err) => {
      if (err) {
        return createErrorResponse(500, err);
      }

      // Отправляем ответ с сообщением об успешном создании аккаунта
      res.send(createSuccessResponse(user));
    });
  } catch (e) {
    res.status(500).send(createErrorResponse(500, (e as Error).message));
  }
});

router.get("/logout", function (req, res) {
  req.logout((err) => {
    if (err) res.send(err);
    res.send("You are logged out!");
  });
});

router.get("/:id", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Users']
 #swagger.path = '/api/user/{id}'
 #swagger.security = [{
            "apiKeyAuth": []
    }]
 */

  const user: User = req.user as User;

  if (checkUserPermissions(req, parseInt(req.params.id))) {
    res.status(403).send(createErrorResponse(403, "Forbidden"));
    return;
  }
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      res.status(404).send(createErrorResponse(404, "User not found"));
    } else {
      res.send(createSuccessResponse(user));
    }
  } catch (e) {
    res.status(500).send(createErrorResponse(500, (e as Error).message, e));
  }
});

router.post(
  "/",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN]),
  async (req, res) => {
    /* #swagger.tags = ['Users']
 #swagger.path = '/api/user',
  #swagger.security = [{
            "apiKeyAuth": []
    }]
 */
    const { name, email, password, role } = req.body;
    try {
      const user = await prisma.user.create({
        data: { name, email, password, role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
      res.send(createSuccessResponse(user));
    } catch (e) {
      res.status(500).send(createErrorResponse(500, (e as Error).message, e));
    }
  },
);

router.patch("/:id", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Users']
 #swagger.path = '/api/user/{id}',
  #swagger.security = [{
            "apiKeyAuth": []
    }]
 */

  const user: User = req.user as User;

  if (checkUserPermissions(req, parseInt(req.params.id))) {
    res.status(403).send(createErrorResponse(403, "Forbidden"));
    return;
  }

  const { id } = req.params;
  const { name, email, password, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, password, role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.send(createSuccessResponse(user));
  } catch (e) {
    res.status(500).send(createErrorResponse(500, (e as Error).message));
  }
});

router.delete("/:id", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Users']
 #swagger.path = '/api/user/{id}'
  #swagger.security = [{
            "apiKeyAuth": []
    }]
 */
  const user: User = req.user as User;

  if (checkUserPermissions(req, parseInt(req.params.id))) {
    res.status(403).send(createErrorResponse(403, "Forbidden"));
    return;
  }
  const { id } = req.params;
  try {
    const user = await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(204).send(createSuccessResponse(user.id));
  } catch (e) {
    res.status(500).send(createErrorResponse(500, (e as Error).message));
  }
});

export default router;
