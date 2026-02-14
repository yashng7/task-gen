import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const templateTypeEnum = pgEnum("template_type", [
  "web",
  "mobile",
  "internal",
]);

export const taskCategoryEnum = pgEnum("task_category", [
  "user_story",
  "engineering_task",
  "risk",
]);

export const specs = pgTable("specs", {
  id: uuid("id").defaultRandom().primaryKey(),
  goal: text("goal").notNull(),
  users: text("users").notNull(),
  constraints: text("constraints").notNull().default(""),
  templateType: templateTypeEnum("template_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  specId: uuid("spec_id").notNull().references(() => specs.id, { onDelete: "cascade" }),
  category: taskCategoryEnum("category").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  groupName: varchar("group_name", { length: 255 }).notNull().default("ungrouped"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Spec = typeof specs.$inferSelect;
export type NewSpec = typeof specs.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;