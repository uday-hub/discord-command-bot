const express = require("express");
const nacl = require("tweetnacl");

const pool = require("../config/database");

const {
  sendDiscordNotification,
} = require("../services/discordService");

const router = express.Router();

router.post(
  "/interactions",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-signature-ed25519"];
      const timestamp = req.headers["x-signature-timestamp"];

      if (!signature || !timestamp) {
        return res.status(401).send("Missing Discord signature");
      }

      const rawBody = req.body;

      const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody.toString()),
        Buffer.from(signature, "hex"),
        Buffer.from(process.env.DISCORD_PUBLIC_KEY, "hex")
      );

      if (!isVerified) {
        return res.status(401).send("Invalid Discord signature");
      }

      const interaction = JSON.parse(rawBody.toString());

      // Discord PING
      if (interaction.type === 1) {
        return res.json({
          type: 1,
        });
      }

      // Only process application commands
      if (interaction.type !== 2) {
        return res.status(400).json({
          success: false,
          message: "Unsupported interaction type",
        });
      }

      const interactionId = interaction.id;
      const commandName = interaction.data?.name;
      const userId = interaction.member?.user?.id;
      const username =
        interaction.member?.user?.username ||
        interaction.user?.username ||
        "Unknown User";

      // Prevent duplicate interaction processing
      const existing = await pool.query(
        "SELECT id FROM interaction_logs WHERE interaction_id = $1",
        [interactionId]
      );

      if (existing.rows.length > 0) {
        return res.json({
          type: 4,
          data: {
            content: "This command has already been processed.",
          },
        });
      }

      // Get command configuration
      const commandResult = await pool.query(
        "SELECT * FROM commands WHERE name = $1",
        [`/${commandName}`]
      );

      if (commandResult.rows.length === 0) {
        return res.json({
          type: 4,
          data: {
            content: "This command is not configured.",
          },
        });
      }

      const command = commandResult.rows[0];

      // Check whether command is enabled
      if (!command.enabled) {
        return res.json({
          type: 4,
          data: {
            content: "This command is currently disabled.",
          },
        });
      }

      // Get /report text
      let inputText = null;

      if (commandName === "report") {
        inputText =
          interaction.data?.options?.find(
            (option) => option.name === "text"
          )?.value || null;
      }

      // Save interaction log
      await pool.query(
        `INSERT INTO interaction_logs
        (
          interaction_id,
          command_name,
          discord_user_id,
          discord_username,
          input_text,
          status,
          action
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          interactionId,
          `/${commandName}`,
          userId,
          username,
          inputText,
          "received",
          "Command processed successfully",
        ]
      );

      // Mirror command to notification channel
if (command.mirror_enabled) {
  try {
    const notificationMessage =
      `🔔 **Command Received**\n` +
      `User: ${username}\n` +
      `Command: /${commandName}` +
      (inputText ? `\nInput: ${inputText}` : "");

    await sendDiscordNotification(
      notificationMessage
    );

    await pool.query(
      `UPDATE interaction_logs
       SET status = $1, action = $2
       WHERE interaction_id = $3`,
      [
        "completed",
        "Command processed and notification sent",
        interactionId,
      ]
    );
  } catch (notificationError) {
    console.error(
      "Notification failed:",
      notificationError
    );

    await pool.query(
      `UPDATE interaction_logs
       SET status = $1, error = $2, action = $3
       WHERE interaction_id = $4`,
      [
        "notification_failed",
        notificationError.message,
        "Command processed but notification failed",
        interactionId,
      ]
    );
  }
} else {
  await pool.query(
    `UPDATE interaction_logs
     SET status = $1, action = $2
     WHERE interaction_id = $3`,
    [
      "completed",
      "Command processed; notification disabled",
      interactionId,
    ]
  );
}

      // Build response
      let responseText = command.response_text;

      if (commandName === "report" && inputText) {
        responseText = `${responseText}\n\nReport: ${inputText}`;
      }

      return res.json({
        type: 4,
        data: {
          content: responseText,
        },
      });
    } catch (error) {
      console.error("Discord interaction error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;