import express from "express";
import cors from "cors";
import { sql, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { specs, tasks } from "./db/schema";
import { generateAllTasks } from "./engine/generator";

const app = express();
const startTime = Date.now();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json({ limit: "1mb" }));

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const createSpecSchema = z.object({
  goal: z.string().min(3, "Goal must be at least 3 characters").max(1000).trim(),
  users: z.string().min(3, "Users must be at least 3 characters").max(500).trim(),
  constraints: z.string().max(1000).trim().default(""),
  templateType: z.enum(["web", "mobile", "internal"], {
    errorMap: () => ({ message: "Template type must be web, mobile, or internal" }),
  }),
});

const updateTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(500).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  groupName: z.string().min(1).max(255).trim().optional(),
});

const reorderSchema = z.object({
  taskIds: z.array(z.string().uuid("Each task ID must be a valid UUID")).min(1, "At least one task ID required"),
});

const groupSchema = z.object({
  taskIds: z.array(z.string().uuid("Each task ID must be a valid UUID")).min(1, "At least one task ID required"),
  groupName: z.string().min(1, "Group name is required").max(255).trim(),
});

function validationError(res: express.Response, parsed: z.SafeParseError<any>) {
  res.status(400).json({
    error: "Validation failed",
    details: parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/status", async (_req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  let dbStatus: { status: string; latency_ms?: number; error?: string };

  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    dbStatus = { status: "connected", latency_ms: Date.now() - start };
  } catch (err) {
    dbStatus = {
      status: "disconnected",
      error: err instanceof Error ? err.message : "Unknown database error",
    };
  }

  res.json({ backend: { status: "healthy", uptime }, database: dbStatus });
});

app.post("/api/specs", async (req, res) => {
  const parsed = createSpecSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);

  try {
    const [spec] = await db.insert(specs).values({
      goal: parsed.data.goal,
      users: parsed.data.users,
      constraints: parsed.data.constraints,
      templateType: parsed.data.templateType,
    }).returning();

    const generatedTasks = await generateAllTasks({
      specId: spec.id,
      goal: parsed.data.goal,
      users: parsed.data.users,
      constraints: parsed.data.constraints,
      templateType: parsed.data.templateType,
    });

    const insertedTasks = await db.insert(tasks).values(generatedTasks).returning();

    res.status(201).json({ ...spec, tasks: insertedTasks });
  } catch (err) {
    console.error("Create spec error:", err);
    res.status(500).json({ error: "Failed to create spec. Please try again." });
  }
});

app.get("/api/specs/:id", async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400).json({ error: "Invalid spec ID format" });
    return;
  }

  try {
    const spec = await db.query.specs.findFirst({
      where: eq(specs.id, req.params.id),
    });

    if (!spec) {
      res.status(404).json({ error: "Spec not found" });
      return;
    }

    const specTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.specId, spec.id))
      .orderBy(tasks.sortOrder);

    res.json({ ...spec, tasks: specTasks });
  } catch (err) {
    console.error("Get spec error:", err);
    res.status(500).json({ error: "Failed to retrieve spec" });
  }
});

app.get("/api/specs", async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 5, 1), 100);
    const result = await db.select().from(specs).orderBy(desc(specs.createdAt)).limit(limit);

    const specsWithCounts = await Promise.all(
      result.map(async (spec) => {
        const specTasks = await db.select().from(tasks).where(eq(tasks.specId, spec.id));
        return {
          id: spec.id,
          goal: spec.goal,
          templateType: spec.templateType,
          taskCount: specTasks.length,
          createdAt: spec.createdAt,
        };
      })
    );

    res.json({ specs: specsWithCounts });
  } catch (err) {
    console.error("List specs error:", err);
    res.status(500).json({ error: "Failed to list specs" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400).json({ error: "Invalid task ID format" });
    return;
  }

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  try {
    const [updated] = await db
      .update(tasks)
      .set(parsed.data)
      .where(eq(tasks.id, req.params.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.put("/api/specs/:specId/tasks/reorder", async (req, res) => {
  if (!isValidUUID(req.params.specId)) {
    res.status(400).json({ error: "Invalid spec ID format" });
    return;
  }

  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);

  try {
    const spec = await db.query.specs.findFirst({
      where: eq(specs.id, req.params.specId),
    });

    if (!spec) {
      res.status(404).json({ error: "Spec not found" });
      return;
    }

    const updates = parsed.data.taskIds.map((id, index) =>
      db.update(tasks).set({ sortOrder: index }).where(eq(tasks.id, id))
    );

    await Promise.all(updates);

    const reordered = await db
      .select()
      .from(tasks)
      .where(eq(tasks.specId, req.params.specId))
      .orderBy(tasks.sortOrder);

    res.json({ message: "Tasks reordered successfully", tasks: reordered });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ error: "Failed to reorder tasks" });
  }
});

app.put("/api/specs/:specId/tasks/group", async (req, res) => {
  if (!isValidUUID(req.params.specId)) {
    res.status(400).json({ error: "Invalid spec ID format" });
    return;
  }

  const parsed = groupSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);

  try {
    const updates = parsed.data.taskIds.map((id) =>
      db.update(tasks).set({ groupName: parsed.data.groupName }).where(eq(tasks.id, id))
    );

    await Promise.all(updates);

    const grouped = await db
      .select()
      .from(tasks)
      .where(eq(tasks.specId, req.params.specId))
      .orderBy(tasks.sortOrder);

    res.json({ message: "Tasks grouped successfully", tasks: grouped });
  } catch (err) {
    console.error("Group error:", err);
    res.status(500).json({ error: "Failed to group tasks" });
  }
});

function buildMarkdownExport(spec: any, stories: any[], engineering: any[], risks: any[]): string {
  const lines: string[] = [];
  lines.push(`# ${spec.goal}`);
  lines.push("");
  lines.push(`**Template:** ${spec.templateType}`);
  lines.push(`**Users:** ${spec.users}`);
  lines.push(`**Constraints:** ${spec.constraints || "None"}`);
  lines.push(`**Created:** ${spec.createdAt}`);
  lines.push("");

  if (stories.length > 0) {
    lines.push("## User Stories");
    lines.push("");
    stories.forEach((t, i) => {
      lines.push(`### ${i + 1}. ${t.title}`);
      lines.push("");
      lines.push(t.description);
      if (t.groupName !== "ungrouped") lines.push(`> Group: ${t.groupName}`);
      lines.push("");
    });
  }

  if (engineering.length > 0) {
    lines.push("## Engineering Tasks");
    lines.push("");
    engineering.forEach((t, i) => {
      lines.push(`### ${i + 1}. ${t.title}`);
      lines.push("");
      lines.push(t.description);
      if (t.groupName !== "ungrouped") lines.push(`> Group: ${t.groupName}`);
      lines.push("");
    });
  }

  if (risks.length > 0) {
    lines.push("## Risks & Unknowns");
    lines.push("");
    risks.forEach((t, i) => {
      lines.push(`### ${i + 1}. ${t.title}`);
      lines.push("");
      lines.push(t.description);
      lines.push("");
    });
  }

  lines.push("---");
  lines.push("*Generated by Tasks Generator*");
  return lines.join("\n");
}

function buildTextExport(spec: any, stories: any[], engineering: any[], risks: any[]): string {
  const lines: string[] = [];
  lines.push(`SPEC: ${spec.goal}`);
  lines.push(`Template: ${spec.templateType}`);
  lines.push(`Users: ${spec.users}`);
  lines.push(`Constraints: ${spec.constraints || "None"}`);
  lines.push(`Created: ${spec.createdAt}`);
  lines.push("");
  lines.push("=".repeat(60));

  if (stories.length > 0) {
    lines.push("");
    lines.push("USER STORIES");
    lines.push("-".repeat(40));
    stories.forEach((t, i) => {
      lines.push(`  ${i + 1}. ${t.title}`);
      lines.push(`     ${t.description}`);
      if (t.groupName !== "ungrouped") lines.push(`     [Group: ${t.groupName}]`);
      lines.push("");
    });
  }

  if (engineering.length > 0) {
    lines.push("ENGINEERING TASKS");
    lines.push("-".repeat(40));
    engineering.forEach((t, i) => {
      lines.push(`  ${i + 1}. ${t.title}`);
      lines.push(`     ${t.description}`);
      if (t.groupName !== "ungrouped") lines.push(`     [Group: ${t.groupName}]`);
      lines.push("");
    });
  }

  if (risks.length > 0) {
    lines.push("RISKS & UNKNOWNS");
    lines.push("-".repeat(40));
    risks.forEach((t, i) => {
      lines.push(`  ${i + 1}. ${t.title}`);
      lines.push(`     ${t.description}`);
      lines.push("");
    });
  }

  lines.push("=".repeat(60));
  lines.push("Generated by Tasks Generator");
  return lines.join("\n");
}

app.get("/api/specs/:id/export", async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400).json({ error: "Invalid spec ID format" });
    return;
  }

  const format = (req.query.format as string) || "markdown";
  if (format !== "markdown" && format !== "text") {
    res.status(400).json({ error: "Format must be 'markdown' or 'text'" });
    return;
  }

  try {
    const spec = await db.query.specs.findFirst({
      where: eq(specs.id, req.params.id),
    });

    if (!spec) {
      res.status(404).json({ error: "Spec not found" });
      return;
    }

    const specTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.specId, spec.id))
      .orderBy(tasks.sortOrder);

    const stories = specTasks.filter((t) => t.category === "user_story");
    const engineering = specTasks.filter((t) => t.category === "engineering_task");
    const risks = specTasks.filter((t) => t.category === "risk");

    let output: string;

    if (format === "text") {
      output = buildTextExport(spec, stories, engineering, risks);
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="spec-${spec.id}.txt"`);
    } else {
      output = buildMarkdownExport(spec, stories, engineering, risks);
      res.setHeader("Content-Type", "text/markdown");
      res.setHeader("Content-Disposition", `attachment; filename="spec-${spec.id}.md"`);
    }

    res.send(output);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Failed to export spec" });
  }
});

app.delete("/api/specs/:id", async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400).json({ error: "Invalid spec ID format" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(specs)
      .where(eq(specs.id, req.params.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Spec not found" });
      return;
    }

    res.json({ message: "Spec deleted successfully" });
  } catch (err) {
    console.error("Delete spec error:", err);
    res.status(500).json({ error: "Failed to delete spec" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found", path: _req.path });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

export default app;