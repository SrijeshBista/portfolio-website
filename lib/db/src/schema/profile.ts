import { pgTable, serial, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Srijesh Bista"),
  title: text("title").notNull().default("Frontend Developer"),
  heroHeadline: text("hero_headline").notNull().default("I Help Brands Grow Online"),
  heroSubheading: text("hero_subheading").notNull().default("I craft modern, performant web experiences that leave an impression."),
  bio: text("bio").notNull().default("I'm a passionate frontend developer with a love for creating beautiful, functional digital experiences. I specialize in building responsive, high-performance web applications."),
  photoUrl: text("photo_url"),
  cvUrl: text("cv_url"),
  githubUrl: text("github_url").default("https://github.com/srijeshbista"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  experience: text("experience").notNull().default("3+"),
  skills: jsonb("skills").notNull().$type<SkillCategory[]>().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SkillCategory = {
  category: string;
  items: { name: string; level: number }[];
};

export const insertProfileSchema = createInsertSchema(profileTable).omit({ id: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profileTable.$inferSelect;
