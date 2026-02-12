import express from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db.js";
import { authMiddleware } from "../jwt.js";
import { sendEmail, buildInviteEmail } from "../email.js";

const router = express.Router();

// POST /teams  - create a new team (Option 1: direct team creation)
// Body: { name: string, categories?: string[], invites?: string[] }
router.post("/", authMiddleware, async (req, res) => {
  const { name, categories = [], invites = [] } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: "team_name_required" });
  }

  const ownerId = req.user.id;
  const teamId = uuidv4();

  try {
    await query(
      `
      INSERT INTO teams (id, name, created_at)
      VALUES ($1, $2, NOW())
    `,
      [teamId, name]
    );

    await query(
      `
      INSERT INTO team_members (id, team_id, user_id, role, created_at)
      VALUES ($1, $2, $3, 'admin', NOW())
    `,
      [uuidv4(), teamId, ownerId]
    );

    for (const cat of categories) {
      if (!cat) continue;
      await query(
        `
        INSERT INTO categories (id, team_id, name, created_at)
        VALUES ($1, $2, $3, NOW())
      `,
        [uuidv4(), teamId, cat]
      );
    }

    for (const email of invites) {
      if (!email) continue;
      const token = uuidv4();
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      await query(
        `
        INSERT INTO invitations (id, email, token, team_id, inviter_id, expires_at, used_at)
        VALUES ($1, $2, $3, $4, $5, $6, NULL)
      `,
        [uuidv4(), email.toLowerCase(), token, teamId, ownerId, expiresAt]
      );

      const { subject, html } = buildInviteEmail(token, name);
      await sendEmail(email, subject, html);
    }

    return res.status(201).json({ id: teamId, name });
  } catch (err) {
    console.error("Error creating team", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;

