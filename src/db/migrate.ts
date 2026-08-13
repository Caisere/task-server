import path from "node:path";
import fs from "fs";
import { pool } from "../lib/db";
import { logger } from "../lib/logger";

type MigrationRow = {
  name: string;
};

const MIGRATION_DIR = path.join(process.cwd(), "migration");

const CREATE_MIGRATION_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;

async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query<MigrationRow>(
    "SELECT name FROM migrations ORDER BY name",
  );

  return result.rows.map((row: MigrationRow) => row.name);
}

function getMigrationFile(): string[] {
  if (!fs.existsSync(MIGRATION_DIR)) {
    fs.mkdirSync(MIGRATION_DIR);
  }

  return fs
    .readdirSync(MIGRATION_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

async function runMigration(fileName: string): Promise<void> {
  const querySql = fs.readFileSync(path.join(MIGRATION_DIR, fileName), "utf-8");

  const client = await pool.connect();

  try {
    // implement transaction operation
    await client.query("BEGIN");
    await client.query(querySql);
    await client.query("INSERT INTO migrations (name) values ($1)", [fileName]);
    await client.query("COMMIT");

    logger.info(`Migration Completed: ${fileName}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function migrate(): Promise<void> {
  // create migration table
  await pool.query(CREATE_MIGRATION_TABLE_SQL);

  // get already migrated files
  const executedMigrations = new Set(await getExecutedMigrations());

  //
  const pending = getMigrationFile().filter(
    (file) => !executedMigrations.has(file),
  );

  if (pending.length === 0) {
    logger.info("No, pending migration");
    return;
  }

  for (const fileName of pending) {
    await runMigration(fileName);
  }

  logger.info("All Migrations Completed...");
}

migrate()
  .catch((error) => {
    logger.error({ err: error }, "Migrations failed");
    process.exit(1);
  })
  .finally(() => pool.end());
