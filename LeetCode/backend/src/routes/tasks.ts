import { Router } from "express";
import { prisma } from "@/config";
import { createErrorResponse, createSuccessResponse } from "@/lib";
import { checkAuthenticated, checkRolesAccess } from "@/middlewares/role";
import { Role, User } from "@prisma/client";

const router = Router();

router.get("/", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Tasks']
  #swagger.path = '/api/tasks'
    #swagger.security = [{
            "apiKeyAuth": []
    }]
  */

  try {
    const tasks = await prisma.task.findMany({});
    res.send(createSuccessResponse(tasks));
  } catch (error) {
    res
      .status(500)
      .send(createErrorResponse(500, (error as Error).message, error));
  }
});

router.post(
  "/",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN, Role.INTERVIEWER]),
  async (req, res) => {
    /* #swagger.path = '/api/tasks'
  #swagger.tags = ['Tasks']
    #swagger.security = [{
            "apiKeyAuth": []
    }]
  */
    const { title, description, input, output, level, links, files, tagsIds } =
      req.body;

    try {
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          input,
          output,
          level,
          links,
          files,
          tags: {
            connect: tagsIds.map((id: number) => ({ id })),
          },
        },
        include: {
          tags: true,
        },
      });
      res.send(createSuccessResponse(newTask)).status(201);
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
  async (req, res) => {
    /* #swagger.tags = ['Tasks']
 #swagger.path = '/api/tasks/{id}'
   #swagger.security = [{
            "apiKeyAuth": []
    }]
 */
    const { id } = req.params;
    const {
      title,
      description,
      input,
      output,
      level,
      links,
      files,
      tagsIds = [],
    } = req.body;

    try {
      const existingTask = await prisma.task.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingTask) {
        res.status(404).send(createErrorResponse(404, "Task not found"));
        return;
      }

      const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          input,
          output,
          level,
          links,
          files,
          tags: {
            connect: tagsIds.map((id: number) => ({ id })),
          },
        },
        include: {
          tags: true,
        },
      });

      res.send(createSuccessResponse(updatedTask));
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorResponse(500, (error as Error).message, error));
    }
  },
);

router.delete(
  "/:id",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN, Role.INTERVIEWER]),
  async (req, res) => {
    /* #swagger.tags = ['Tasks']
  #swagger.path = '/api/tasks/{id}'
    #swagger.security = [{
            "apiKeyAuth": []
    }]
  */

    const { id } = req.params;
    try {
      const existingTask = await prisma.task.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingTask) {
        res.status(404).send(createErrorResponse(404, "Task not found"));
        return;
      }

      await prisma.task.delete({
        where: { id: parseInt(id) },
      });

      res.send(createSuccessResponse(parseInt(id))).status(204);
    } catch (error) {
      res
        .status(500)
        .send(createErrorResponse(500, (error as Error).message, error));
    }
  },
);

router.get("/:id", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Tasks']
 #swagger.path = '/api/tasks/{id}'
   #swagger.security = [{
            "apiKeyAuth": []
    }]
 */
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        tags: true,
      },
    });

    if (!task) {
      res.status(404).send(createErrorResponse(404, "Task not found"));
      return;
    }
    res.status(200).send(createSuccessResponse(task));
  } catch (e) {
    res.send(500).send(createErrorResponse(500, (e as Error).message, e));
  }
});

router.post("/:id/assessment", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Tasks']
 #swagger.path = '/api/tasks/{id}/assessment'
   #swagger.security = [{
            "apiKeyAuth": []
    }]
 */

  const { id } = req.params;
  const { userId, assessment } = req.body;
  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTask) {
      res.status(404).send(createErrorResponse(404, "Task not found"));
      return;
    }

    await prisma.taskAssessment.create({
      data: { taskId: Number(id), userId: userId, assessment },
    });

    const [totalAssessment] = await prisma.taskAssessment.groupBy({
      by: ["taskId"],
      where: { taskId: Number(id) },
      // _sum: { assessment: true },
      _avg: { assessment: true },
    });

    res.send(
      createSuccessResponse({
        totalAssessment: totalAssessment._avg?.assessment || 0,
      }),
    );
  } catch (e) {
    res.status(500).send(createErrorResponse(500, (e as Error).message, e));
  }
});

router.get("/:id/assessment", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Tasks']
 #swagger.path = '/api/tasks/{id}/assessment'
   #swagger.security = [{
            "apiKeyAuth": []
    }]
 */

  const { id } = req.params;

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTask) {
      res.status(404).send(createErrorResponse(404, "Task not found"));
      return;
    }

    const [totalAvgAssessment] = await prisma.taskAssessment.groupBy({
      by: ["taskId"],
      where: { taskId: Number(id) },
      _avg: { assessment: true },
    });
    res.send(
      createSuccessResponse({
        totalAssessment: totalAvgAssessment._avg?.assessment || 0,
      }),
    );
  } catch (e) {
    res.status(500).send("Error getting assessment");
  }
});

router.patch("/:id/assessment", checkAuthenticated, async (req, res) => {
  /* #swagger.tags = ['Tasks']
 #swagger.path = '/api/tasks/{id}/assessment'
   #swagger.security = [{
   
 }]
 */

  const { id } = req.params;
  const { assessment } = req.body;
  const user = req.user as User;

  try {
    const existingAssessment = await prisma.taskAssessment.findFirst({
      where: { taskId: Number(id), userId: user.id },
    });

    if (!existingAssessment) {
      res.status(404).send(createErrorResponse(404, "Assessment not found"));
      return;
    }

    await prisma.taskAssessment.update({
      where: { id: existingAssessment.id },
      data: { assessment: Number(assessment) },
    });

    const [totalAssessment] = await prisma.taskAssessment.groupBy({
      by: ["taskId"],
      where: { taskId: Number(id) },
      // _sum: { assessment: true },
      _avg: { assessment: true },
    });

    res.send(
      createSuccessResponse({
        totalAssessment: totalAssessment._avg?.assessment || 0,
      }),
    );
  } catch (e) {
    createErrorResponse(500, (e as Error).message, e);
  }
});

router.delete(
  "/:id/assessment",
  checkAuthenticated,
  checkRolesAccess([Role.ADMIN, Role.INTERVIEWER]),
  async (req, res) => {
    /* #swagger.tags = ['Tasks']
 #swagger.path = '/api/tasks/{id}/assessment'
   #swagger.security = [{
            "apiKeyAuth": []
    }]
 */

    const { id } = req.params;

    try {
      const existingTask = await prisma.task.findUnique({
        where: { id: Number(id) },
      });

      const user = req.user as User;

      if (!existingTask) {
        res.status(404).send(createErrorResponse(404, "Task not found"));
        return;
      }

      await prisma.taskAssessment.deleteMany({
        where: { taskId: Number(id) },
      });
      res.send(createSuccessResponse({ result: "ok" }));
    } catch (e) {
      res.status(500).send("Error getting assessment");
    }
  },
);

export default router;
