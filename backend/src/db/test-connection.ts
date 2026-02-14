import postgres from "postgres";

const url = process.env.DATABASE_URL!;

console.log("DATABASE_URL exists:", !!url);
console.log("URL starts with:", url.substring(0, 30) + "...");

const client = postgres(url, {
  max: 1,
  connect_timeout: 15,
  idle_timeout: 10,
  prepare: false,
  ssl: "require",
});

async function test() {
  try {
    const result = await client`SELECT 1 as ok`;
    console.log("✅ Connection successful:", result);
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
  await client.end();
  process.exit(0);
}

test();