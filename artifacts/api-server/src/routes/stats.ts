import { Router } from "express";
import { db, projectsTable, contactsTable } from "@workspace/db";
import { count, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
  const [[{ projectCount }], [{ contactCount }], [{ unreadContactCount }]] = await Promise.all([
    db.select({ projectCount: count() }).from(projectsTable),
    db.select({ contactCount: count() }).from(contactsTable),
    db.select({ unreadContactCount: count() }).from(contactsTable).where(eq(contactsTable.read, false)),
  ]);
  res.json({ projectCount, contactCount, unreadContactCount });
});

export default router;
