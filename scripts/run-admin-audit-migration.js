/**
 * Applique drizzle/add-admin-audit-logs.sql (table admin_audit_logs + index).
 * Usage: npm run db:migrate:admin-audit
 * Requires: DATABASE_URL dans .env.local (ou l'environnement). Utilise le paquet "pg" (devDependency).
 */
const fs = require("fs");
const path = require("path");

function loadEnvFile(rel) {
  const envPath = path.join(process.cwd(), rel);
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL absent. Ajoutez-le à .env.local ou à l’environnement.");
  process.exit(1);
}

async function main() {
  const { Client } = require("pg");
  const client = new Client({
    connectionString: url,
    ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    let sql = fs.readFileSync(path.join(process.cwd(), "drizzle", "add-admin-audit-logs.sql"), "utf8");
    sql = sql.replace(/--[^\n]*/g, "").trim();
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await client.query(statement + ";");
      console.log("OK:", statement.replace(/\s+/g, " ").slice(0, 72) + (statement.length > 72 ? "…" : ""));
    }
    console.log("Migration admin_audit_logs terminée.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  if (err.code === "42P07" && err.message && err.message.includes("already exists")) {
    console.log("Objet déjà présent (42P07). Rien à faire, ou vérifiez le SQL.");
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
