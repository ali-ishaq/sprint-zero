import { Router } from "express";
import { getRunsByUser, getRun, updateRunTaskStatus } from "../lib/firestore.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const runs = await getRunsByUser(req.user.email);
    res.json(runs);
  } catch (error) {
    next(error);
  }
});

router.get("/:runId", requireAuth, async (req, res, next) => {
  try {
    const run = await getRun(req.params.runId);
    if (!run || run.userId !== req.user.email) {
      return res.status(404).json({ error: "Run not found" });
    }
    res.json(run);
  } catch (error) {
    next(error);
  }
});

router.patch("/:runId/tasks/:taskId", requireAuth, async (req, res, next) => {
  try {
    const run = await getRun(req.params.runId);
    if (!run || run.userId !== req.user.email) {
      return res.status(404).json({ error: "Run not found" });
    }

    const status = req.body?.status;
    if (typeof status !== "boolean") {
      return res.status(400).json({ error: "status must be a boolean" });
    }

    const tasks = await updateRunTaskStatus(
      req.params.runId,
      req.params.taskId,
      status,
    );
    if (!tasks) {
      return res.status(404).json({ error: "Run not found" });
    }

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

export default router;
