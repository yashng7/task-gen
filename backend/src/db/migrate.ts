import { sql } from "drizzle-orm";
import { db } from "./index";

async function migrate() {
  console.log("⏳ Creating tables...");

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE template_type AS ENUM ('web', 'mobile', 'internal');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE task_category AS ENUM ('user_story', 'engineering_task', 'risk');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS specs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      goal TEXT NOT NULL,
      users TEXT NOT NULL,
      constraints TEXT NOT NULL DEFAULT '',
      template_type template_type NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      spec_id UUID NOT NULL REFERENCES specs(id) ON DELETE CASCADE,
      category task_category NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT NOT NULL,
      group_name VARCHAR(255) NOT NULL DEFAULT 'ungrouped',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  console.log("✅ Tables created successfully");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});