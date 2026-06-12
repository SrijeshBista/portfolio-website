import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken, type AuthRequest } from "../middlewares/auth";
import type { Response } from "express";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username)).limit(1);
  if (!admin) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken(admin.id, admin.username);
  res.json({ token, admin: { id: admin.id, username: admin.username } });
});

router.get("/auth/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ id: req.adminId, username: req.adminUsername });
});

router.post("/auth/change-password", requireAuth, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "currentPassword and newPassword required" });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.id, req.adminId!)).limit(1);
  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  const newHash = await bcrypt.hash(newPassword, 10);
  await db.update(adminsTable).set({ passwordHash: newHash }).where(eq(adminsTable.id, admin.id));
  res.json({ success: true });
});

router.post("/auth/change-username", requireAuth, async (req: AuthRequest, res: Response) => {
  const { newUsername, password } = req.body;
  if (!newUsername || !password) {
    res.status(400).json({ error: "newUsername and password required" });
    return;
  }
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.id, req.adminId!)).limit(1);
  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Password is incorrect" });
    return;
  }
  const [existing] = await db.select().from(adminsTable).where(eq(adminsTable.username, newUsername)).limit(1);
  if (existing) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }
  await db.update(adminsTable).set({ username: newUsername }).where(eq(adminsTable.id, admin.id));
  res.json({ success: true });
});

export default router;
