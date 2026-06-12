import { Router } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/projects", async (_req, res) => {
  const projects = await db.select().from(projectsTable).orderBy(asc(projectsTable.sortOrder), asc(projectsTable.createdAt));
  res.json(projects.map(p => ({ ...p, tags: p.tags ?? [], createdAt: p.createdAt.toISOString() })));
});

router.get("/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  if (!project) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...project, tags: project.tags ?? [], createdAt: project.createdAt.toISOString() });
});

router.post("/projects", requireAuth, async (req, res) => {
  const { title, description, imageUrl, liveUrl, githubUrl, tags, featured, sortOrder } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: "title and description required" });
    return;
  }
  const [created] = await db.insert(projectsTable).values({
    title,
    description,
    imageUrl: imageUrl || null,
    liveUrl: liveUrl || null,
    githubUrl: githubUrl || null,
    tags: tags ?? [],
    featured: featured ?? false,
    sortOrder: sortOrder ?? 0,
  }).returning();
  res.status(201).json({ ...created, tags: created.tags ?? [], createdAt: created.createdAt.toISOString() });
});

router.patch("/projects/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, imageUrl, liveUrl, githubUrl, tags, featured, sortOrder } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (liveUrl !== undefined) updates.liveUrl = liveUrl;
  if (githubUrl !== undefined) updates.githubUrl = githubUrl;
  if (tags !== undefined) updates.tags = tags;
  if (featured !== undefined) updates.featured = featured;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;

  const [updated] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...updated, tags: updated.tags ?? [], createdAt: updated.createdAt.toISOString() });
});

router.delete("/projects/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  res.status(204).send();
});

export default router;
