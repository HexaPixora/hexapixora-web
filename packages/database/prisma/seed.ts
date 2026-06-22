/**
 * Bootstraps the first SUPER_ADMIN so a freshly-deployed database can be logged
 * into. Idempotent and safe to run on every deploy:
 *   - no SEED_ADMIN_PASSWORD set        → no-op (logs a hint, exits 0)
 *   - admin email does not exist yet    → creates the SUPER_ADMIN
 *   - admin email already exists        → leaves it untouched (never clobbers a
 *                                          password the user may have changed)
 *
 * Run: `npm run db:seed --workspace=@repo/database`
 * Env: SEED_ADMIN_EMAIL (default admin@hexapixora.com), SEED_ADMIN_PASSWORD (required),
 *      SEED_ADMIN_NAME (default "Administrator").
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@hexapixora.com").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Administrator";

  if (!password) {
    console.warn(
      "[seed] SEED_ADMIN_PASSWORD is not set — skipping admin creation. " +
        "Set SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD to bootstrap the first login.",
    );
    return;
  }
  if (password.length < 8) {
    throw new Error("[seed] SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] User ${email} already exists (role: ${existing.role}) — leaving as-is.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, password: hashed, name, role: "SUPER_ADMIN", permissions: [] },
  });
  console.log(`[seed] Created SUPER_ADMIN ${email}.`);
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
