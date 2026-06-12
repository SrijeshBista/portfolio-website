import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, profileTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const uploadsDir = path.resolve(workspaceRoot, "artifacts/api-server/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-photo-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

async function ensureProfile() {
  const rows = await db.select().from(profileTable).limit(1);
  if (rows.length === 0) {
    const [created] = await db.insert(profileTable).values({}).returning();
    return created;
  }
  return rows[0];
}

function serializeProfile(p: typeof profileTable.$inferSelect) {
  return {
    ...p,
    skills: p.skills ?? [],
    updatedAt: undefined,
  };
}

router.get("/profile", async (_req, res) => {
  const profile = await ensureProfile();
  res.json(serializeProfile(profile));
});

router.patch("/profile", requireAuth, async (req, res) => {
  const profile = await ensureProfile();
  const { name, title, heroHeadline, heroSubheading, bio, photoUrl, cvUrl,
    githubUrl, linkedinUrl, twitterUrl, experience, skills } = req.body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (title !== undefined) updates.title = title;
  if (heroHeadline !== undefined) updates.heroHeadline = heroHeadline;
  if (heroSubheading !== undefined) updates.heroSubheading = heroSubheading;
  if (bio !== undefined) updates.bio = bio;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
  if (cvUrl !== undefined) updates.cvUrl = cvUrl;
  if (githubUrl !== undefined) updates.githubUrl = githubUrl;
  if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
  if (twitterUrl !== undefined) updates.twitterUrl = twitterUrl;
  if (experience !== undefined) updates.experience = experience;
  if (skills !== undefined) updates.skills = skills;

  const { eq } = await import("drizzle-orm");
  const [updated] = await db.update(profileTable).set(updates).where(eq(profileTable.id, profile.id)).returning();
  res.json(serializeProfile(updated));
});

router.post("/profile/photo", requireAuth, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No photo uploaded" });
    return;
  }
  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
