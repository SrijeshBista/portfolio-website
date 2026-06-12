import { Router } from "express";
import { db, contactsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/contacts", requireAuth, async (_req, res) => {
  const contacts = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt));
  res.json(contacts.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
});

router.post("/contacts", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: "name, email, and message required" });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }
  const [created] = await db.insert(contactsTable).values({ name, email, message }).returning();
  res.status(201).json({ ...created, createdAt: created.createdAt.toISOString() });
});

router.delete("/contacts/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(contactsTable).where(eq(contactsTable.id, id));
  res.status(204).send();
});

export default router;
