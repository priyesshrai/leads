import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";


async function main() {
  const superAdminEmail = "super@admin.com";
  const superAdminPassword = "SuperAdmin@123";

  const existing = await prisma.user.findUnique({
    where: { email: superAdminEmail }
  });

  if (existing) {
    console.log("Superadmin already exists. Skipping seed.");
    return;
  }

  console.log("Creating SUPERADMIN user...");

  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const account = await prisma.account.create({
    data: {
      businessName: "Super Admin Account",
      email: superAdminEmail,
      phone: "0000000000",
      location: "System",
      users: {
        create: {
          name: "Super Admin",
          email: superAdminEmail,
          password: hashedPassword,
          role: "SUPERADMIN"
        }
      }
    }
  });

  console.log("SUPERADMIN created successfully:");
  console.log("Email:", superAdminEmail);
  console.log("Password:", superAdminPassword);
  console.log("Account ID:", account.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("Seed Error:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
