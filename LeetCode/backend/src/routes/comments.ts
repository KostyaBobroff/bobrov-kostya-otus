import { Router } from "express";
import { prisma } from "@/config";
import { createErrorResponse, createSuccessResponse } from "@/lib";
import { Role, User } from "@prisma/client";
import { checkAuthenticated } from "@/middlewares/role";
import { checkUserPermissions } from "@/lib/permissions";

const router = Router();

// Create a comment
router.post("/", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Comments']
 #swagger.path = '/api/comments/'
  #swagger.security = [{
            "apiKeyAuth": []
    }]
 */
  const { content, files, taskId, userId } = req.body;

  const user: User = req.user as User;

  if (checkUserPermissions(req, parseInt(userId))) {
    res.status(403).send(createErrorResponse(403, "Forbidden"));
    return;
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content,
        files,
        taskId,
        userId,
      },
    });
    res.status(201).send(createSuccessResponse(newComment));
  } catch (error) {
    res
      .status(500)
      .send(createErrorResponse(500, (error as Error).message, error));
  }
});

// Read all comments
router.get("/:taskId", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Comments']
 #swagger.path = '/api/comments/{id}'
  #swagger.security = [{
            "apiKeyAuth": []
    }]
 */
  const { taskId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: parseInt(taskId) },
      include: { user: { select: { name: true, id: true, email: true } } },
    });
    res.send(createSuccessResponse(comments));
  } catch (error) {
    res
      .status(500)
      .send(createErrorResponse(500, (error as Error).message, error));
  }
});

// Update a comment
router.patch("/:id", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Comments']
  #swagger.path = '/api/comments/{id}'
   #swagger.security = [{
            "apiKeyAuth": []
    }]
  */

  const { id } = req.params;
  const { content, files } = req.body;
  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      res.status(404).send(createErrorResponse(404, "Comment not found"));
      return;
    }

    const user = req.user as User;
    if (checkUserPermissions(req, existingComment.userId)) {
      res.status(403).send(createErrorResponse(403, "Forbidden"));
      return;
    }
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content, files },
    });
    res.send(createSuccessResponse(updatedComment));
  } catch (error) {
    res
      .status(500)
      .send(createErrorResponse(500, (error as Error).message, error));
  }
});

// Delete a comment
router.delete("/:id", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Comments']
  #swagger.path = '/api/comments/{id}'
  */
  const { id } = req.params;
  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      res.status(404).send(createErrorResponse(404, "Comment not found"));
      return;
    }

    if (checkUserPermissions(req, existingComment.userId)) {
      res.status(403).send(createErrorResponse(403, "Forbidden"));
      return;
    }
    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });
    res.send(createSuccessResponse(id)).status(204);
  } catch (error) {
    res
      .status(500)
      .send(createErrorResponse(500, (error as Error).message, error));
  }
});

export default router;
