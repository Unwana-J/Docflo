import express from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db.js";
import { getRedis } from "../redis.js";
import { signSession, authMiddleware } from "../jwt.js";
import { sendEmail, buildInviteEmail, buildMagicLoginEmail } from "../email.js";

const router = express.Router();

// POST /auth/invitations
// Body: { email: string, teamId: string }
router.post("/invitations", authMiddleware, async (req, res) => {
  const { email, teamId } = req.body || {};

  if (!email || !teamId) {
    return res.status(400).json({ error: "email_and_team_required" });
  }

  const inviterId = req.user.id;
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    await query(
      `
      INSERT INTO invitations (id, email, token, team_id, inviter_id, expires_at, used_at)
      VALUES ($1, $2, $3, $4, $5, $6, NULL)
    `,
      [uuidv4(), email.toLowerCase(), token, teamId, inviterId, expiresAt]
    );

    const teamResult = await query("SELECT name FROM teams WHERE id = $1", [
      teamId,
    ]);
    const teamName = teamResult.rows[0]?.name || "your team";

    const { subject, html } = buildInviteEmail(token, teamName);
    await sendEmail(email, subject, html);

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Error creating invitation", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

// GET /auth/accept-invite?token=abc
router.get("/accept-invite", async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "invalid_token" });
  }

  try {
    const result = await query(
      `
      SELECT * FROM invitations
      WHERE token = $1
    `,
      [token]
    );

    const invite = result.rows[0];
    if (!invite) {
      return res.status(400).json({ error: "invalid_invitation" });
    }
    if (invite.used_at) {
      return res.status(400).json({ error: "invitation_already_used" });
    }
    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ error: "invitation_expired" });
    }

    // Find or create user by email
    const email = invite.email.toLowerCase();
    let userResult = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    let user = userResult.rows[0];

    if (!user) {
      const userId = uuidv4();
      await query(
        `
        INSERT INTO users (id, email, status, created_at)
        VALUES ($1, $2, 'active', NOW())
      `,
        [userId, email]
      );
      userResult = await query("SELECT * FROM users WHERE id = $1", [userId]);
      user = userResult.rows[0];
    }

    // Ensure membership in the invited team
    const membershipResult = await query(
      `
      SELECT * FROM team_members
      WHERE user_id = $1 AND team_id = $2
    `,
      [user.id, invite.team_id]
    );

    if (!membershipResult.rows[0]) {
      await query(
        `
        INSERT INTO team_members (id, team_id, user_id, role, created_at)
        VALUES ($1, $2, $3, 'member', NOW())
      `,
        [uuidv4(), invite.team_id, user.id]
      );
    }

    await query(
      `
      UPDATE invitations
      SET used_at = NOW()
      WHERE id = $1
    `,
      [invite.id]
    );

    const jwt = signSession({ id: user.id, email: user.email });

    res.cookie("docuflow_session", jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true behind HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(302, `/welcome?teamId=${invite.team_id}`);
  } catch (err) {
    console.error("Error accepting invite", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

// POST /auth/login-magic-link  { email }
router.post("/login-magic-link", async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "email_required" });
  }

  try {
    const userResult = await query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    const user = userResult.rows[0];
    if (!user) {
      // Do not reveal whether user exists
      return res.status(200).json({ ok: true });
    }

    const token = uuidv4();
    const redis = await getRedis();
    const key = `magic:${token}`;
    await redis.set(key, user.id, { EX: 15 * 60 }); // 15 minutes

    const { subject, html } = buildMagicLoginEmail(token);
    await sendEmail(user.email, subject, html);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error creating magic link", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

// GET /auth/magic-login?token=abc
router.get("/magic-login", async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "invalid_token" });
  }

  try {
    const redis = await getRedis();
    const key = `magic:${token}`;
    const userId = await redis.get(key);

    if (!userId) {
      return res.status(400).json({ error: "magic_link_invalid_or_expired" });
    }

    await redis.del(key);

    const userResult = await query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json({ error: "user_not_found" });
    }

    const jwt = signSession({ id: user.id, email: user.email });

    res.cookie("docuflow_session", jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Let frontend decide which team to open
    return res.redirect(302, "/");
  } catch (err) {
    console.error("Error consuming magic link", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

// GET /auth/me - current user and teams
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userResult = await query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);
    const user = userResult.rows[0];

    const memberships = await query(
      `
      SELECT t.*, tm.role
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.user_id = $1
    `,
      [req.user.id]
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
      teams: memberships.rows.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
      })),
    });
  } catch (err) {
    console.error("Error in /auth/me", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;

