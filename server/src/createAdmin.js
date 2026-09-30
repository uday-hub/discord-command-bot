const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const pool = require("./config/database");

async function createAdmin() {
  try {
    const email = "admin@commandflow.com";
    const password = "Admin@12345";

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admins (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email, passwordHash]
    );

    console.log("Admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exit(1);
  }
}

createAdmin();