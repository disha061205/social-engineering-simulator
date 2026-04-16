import crypto from "crypto";
import express from "express";
import User from "../models/user.model";

const router = express.Router();
const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE;

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash?: string) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const candidateHash = hashPassword(password, salt).split(":")[1];
  if (!candidateHash) return false;
  return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(candidateHash, "hex"));
}

router.post("/login", async (req, res) => {
  const { email, password, name, mode = "login", requestedRole, adminInviteCode } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (mode === "register") {
    if (existingUser) {
      return res.status(409).json({ message: "This email is already registered. Please log in." });
    }

    const wantsAdmin = requestedRole === "admin";
    if (wantsAdmin && !ADMIN_INVITE_CODE) {
      return res.status(403).json({ message: "Admin registration is disabled until ADMIN_INVITE_CODE is configured on the server." });
    }

    if (wantsAdmin && adminInviteCode !== ADMIN_INVITE_CODE) {
      return res.status(403).json({ message: "A valid admin invite code is required for admin registration." });
    }

    const user = await User.create({
      name: name || "Learner",
      email: normalizedEmail,
      password: hashPassword(password),
      role: wantsAdmin ? "admin" : "user",
      lastLoginAt: new Date()
    });

    return res.status(201).json(user);
  }

  if (!existingUser || !verifyPassword(password, existingUser.password ?? undefined)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (existingUser.status && existingUser.status !== "active") {
    return res.status(403).json({ message: "This account is not allowed to log in." });
  }

  existingUser.lastLoginAt = new Date();
  await existingUser.save();

  return res.json(existingUser);
});

export default router;
