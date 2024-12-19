import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  query: text("query").notNull(),
  location: text("location").notNull(),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SearchHistory = typeof searchHistory.$inferSelect;
