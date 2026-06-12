import pg from "pg";
import bcrypt from "bcryptjs";

const newPassword = process.argv[2];
const username = process.argv[3] ?? "admin";

if (!newPassword) {
  console.error("Usage: pnpm --filter @workspace/scripts run reset-admin-password <newPassword> [username]");
  console.error("Example: pnpm --filter @workspace/scripts run reset-admin-password mySecret123");
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const hash = await bcrypt.hash(newPassword, 10);

const { rows } = await client.query("SELECT id FROM admins WHERE username = $1 LIMIT 1", [username]);

if (rows.length === 0) {
  await client.query(
    "INSERT INTO admins (username, password_hash) VALUES ($1, $2)",
    [username, hash]
  );
  console.log(`Admin account created — username: "${username}", password: "${newPassword}"`);
} else {
  await client.query(
    "UPDATE admins SET password_hash = $1 WHERE username = $2",
    [hash, username]
  );
  console.log(`Password reset — username: "${username}", new password: "${newPassword}"`);
}

await client.end();
process.exit(0);
