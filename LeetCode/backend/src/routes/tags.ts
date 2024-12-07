import { Router, Request } from "express";
import { prisma } from "@/config";
import { createErrorResponse, createSuccessResponse } from "@/lib";
import { checkAuthenticated, checkRolesAccess } from "@/middlewares/role";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN, Role.INTERVIEWER]),
  async (req, res) => {
    /* #swagger.tags = ['Tags']
   #swagger.path = '/api/tags'
    #swagger.security = [{
            "apiKeyAuth": []
    }]
   */
    try {
      const tags = await prisma.tag.findMany();
      res.send(createSuccessResponse(tags));
    } catch (error) {
      res
        .status(500)
        .send(createErrorResponse(500, (error as Error).message, error));
    }
  },
);

router.get(
  "/:id",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN, Role.INTERVIEWER]),
  async (req, res) => {
    /* #swagger.tags = ['Tags']
   #swagger.path = '/api/tags/{id}'
    #swagger.security = [{
            "apiKeyAuth": []
    }]
  */
    const { id } = req.params;
    try {
      const tag = await prisma.tag.findUnique({
        where: { id: parseInt(id) },
      });
      if (!tag) {
        res.status(404).send(createErrorResponse(404, "Tag not found"));
      } else {
        res.send(createSuccessResponse(tag));
      }
    } catch (error) {
      res
        .status(500)
        .send(createErrorResponse(500, (error as Error).message, error));
    }
  },
);

router.post(
  "/",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN, Role.INTERVIEWER]),
  async (req: Request<any, any, { tag: string }>, res) => {
    /* #swagger.tags = ['Tags']
   #swagger.path = '/api/tags'
    #swagger.security = [{
            "apiKeyAuth": []
    }]
  */
    const { tag } = req.body;
    try {
      const existinTag = await prisma.tag.findFirst({
        where: { tag },
      });

      if (existinTag) {
        res.status(400).send(createErrorResponse(400, "Tag already exists"));
        return;
      }

      const newTag = await prisma.tag.create({
        data: { tag },
      });
      res.send(createSuccessResponse(newTag));
    } catch (error) {
      res
        .status(500)
        .send(createErrorResponse(500, (error as Error).message, error));
    }
  },
);

router.patch(
  "/:id",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN, Role.INTERVIEWER]),
  async (req: Request<any, any, { tag: string }>, res) => {
    /* #swagger.tags = ['Tags']
   #swagger.path = '/api/tags/{id}'
    #swagger.security = [{
            "apiKeyAuth": []
    }]
  */
    const { id } = req.params;
    const { tag } = req.body;
    try {
      const updatedTag = await prisma.tag.update({
        where: { id: parseInt(id) },
        data: { tag },
      });
      res.send(createSuccessResponse(updatedTag));
    } catch (error) {
      res
        .status(404)
        .send(createErrorResponse(404, (error as Error).message, error));
    }
  },
);

router.delete(
  "/:id",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN, Role.INTERVIEWER]),
  async (req, res) => {
    /* #swagger.tags = ['Tags']
  #swagger.path = '/api/tags/{id}'
   #swagger.security = [{
            "apiKeyAuth": []
    }]
  */
    const { id } = req.params;
    try {
      await prisma.tag.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send(createSuccessResponse(id));
    } catch (error) {
      res
        .status(404)
        .send(createErrorResponse(404, (error as Error).message, error));
    }
  },
);

export default router;
