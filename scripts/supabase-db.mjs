import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const root = process.cwd();

const envFiles = [
  ".env.supabase.local",
  ".env.vercel.production.local",
  ".env.production.local",
  ".env.local",
];

const loadEnvFile = (file) => {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return;

  for (const rawLine of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    let value = rest.join("=").trim();
    value = value.replace(/^["']|["']$/g, "");
    if (!value || value === "\"\"" || value === "''") continue;
    if (!process.env[key]) process.env[key] = value;
  }
};

envFiles.forEach(loadEnvFile);

const usage = () => {
  console.log(`
HotMess Supabase DB helper

Usage:
  npm run db:apply -- supabase/migrations/004_dating_part4.sql supabase/migrations/011_dating_runtime.sql
  npm run db:check
  npm run db:check -- scripts/sql/check-app-schema.sql

Needs one local secret file:
  .env.supabase.local

Required value:
  POSTGRES_URL_NON_POOLING="postgresql://postgres.<project-ref>:<password>@aws-...pooler.supabase.com:5432/postgres?sslmode=require"

This file is ignored by git.
`);
};

const getConnectionString = () => {
  const value = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || "";
  if (!value || value.includes("[YOUR-PASSWORD]") || value.includes("localhost") || value.includes("127.0.0.1")) {
    throw new Error(
      "POSTGRES_URL_NON_POOLING fehlt oder zeigt nicht auf Supabase. Trage den echten Supabase Connection String in .env.supabase.local ein.",
    );
  }
  return value;
};

const connect = async () => {
  const client = new pg.Client({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
};

const readSql = (file) => {
  const fullPath = path.resolve(root, file);
  if (!fs.existsSync(fullPath)) throw new Error(`SQL-Datei nicht gefunden: ${file}`);
  return fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
};

const applyFiles = async (files) => {
  if (files.length === 0) {
    usage();
    throw new Error("Keine SQL-Dateien angegeben.");
  }

  const client = await connect();
  try {
    for (const file of files) {
      const sql = readSql(file);
      console.log(`Applying ${file} ...`);
      await client.query(sql);
      console.log(`OK ${file}`);
    }
  } finally {
    await client.end();
  }
};

const check = async (file = "scripts/sql/check-app-schema.sql") => {
  const client = await connect();
  try {
    const result = await client.query(readSql(file));
    console.table(result.rows);
    const row = result.rows[0] ?? {};
    const failed = Object.entries(row)
      .filter(([, value]) => value !== true)
      .map(([key]) => key);
    if (failed.length) {
      throw new Error(`Schema-Check fehlgeschlagen: ${failed.join(", ")}`);
    }
    console.log("Schema-Check OK");
  } finally {
    await client.end();
  }
};

const main = async () => {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help") {
    usage();
    return;
  }

  if (command === "apply") {
    await applyFiles(args);
    return;
  }

  if (command === "check") {
    await check(args[0]);
    return;
  }

  usage();
  throw new Error(`Unbekannter Befehl: ${command}`);
};

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
