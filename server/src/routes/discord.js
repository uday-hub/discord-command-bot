const express = require("express");
const nacl = require("tweetnacl");

const pool = require("../config/database");

const {
  sendDiscordNotification,
  sendInteractionFollowup,
} = require("../services/discordService");

const router = express.Router();

router.post(
  "/interactions",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // -----------------------------------------
      // 1. Verify Discord signature
      // -----------------------------------------

      const signature =
        req.headers["x-signature-ed25519"];

      const timestamp =
        req.headers["x-signature-timestamp"];

      if (!signature || !timestamp) {
        return res
          .status(401)
          .send("Missing Discord signature");
      }

      const rawBody = req.body;

      const isVerified = nacl.sign.detached.verify(
        Buffer.from(
          timestamp + rawBody.toString()
        ),
        Buffer.from(signature, "hex"),
        Buffer.from(
          process.env.DISCORD_PUBLIC_KEY,
          "hex"
        )
      );

      if (!isVerified) {
        return res
          .status(401)
          .send("Invalid Discord signature");
      }

      const interaction = JSON.parse(
        rawBody.toString()
      );

      // -----------------------------------------
      // 2. Discord PING
      // -----------------------------------------

      if (interaction.type === 1) {
        return res.json({
          type: 1,
        });
      }

      // Only slash commands
      if (interaction.type !== 2) {
        return res.status(400).json({
          success: false,
          message: "Unsupported interaction type",
        });
      }

      // -----------------------------------------
      // 3. Extract interaction information
      // -----------------------------------------

      const interactionId = interaction.id;

      const interactionToken =
        interaction.token;

      const commandName =
        interaction.data?.name;

      const userId =
        interaction.member?.user?.id ||
        interaction.user?.id;

      const username =
        interaction.member?.user?.username ||
        interaction.user?.username ||
        "Unknown User";

      // -----------------------------------------
      // 4. IMPORTANT:
      // Immediately acknowledge Discord
      // -----------------------------------------

      res.json({
        type: 5,
      });

      // -----------------------------------------
      // Everything below can now take time
      // -----------------------------------------

      try {
        // ---------------------------------------
        // 5. Duplicate protection
        // ---------------------------------------

        const existing = await pool.query(
          `SELECT id
           FROM interaction_logs
           WHERE interaction_id = $1`,
          [interactionId]
        );

        if (existing.rows.length > 0) {
          await sendInteractionFollowup(
            interactionToken,
            "This command has already been processed."
          );

          return;
        }

        // ---------------------------------------
        // 6. Get command configuration
        // ---------------------------------------

        const commandResult =
          await pool.query(
            `SELECT *
             FROM commands
             WHERE name = $1`,
            [`/${commandName}`]
          );

        if (commandResult.rows.length === 0) {
          await sendInteractionFollowup(
            interactionToken,
            "This command is not configured."
          );

          return;
        }

        const command =
          commandResult.rows[0];

        // ---------------------------------------
        // 7. Check command enabled
        // ---------------------------------------

        if (!command.enabled) {
          await sendInteractionFollowup(
            interactionToken,
            "This command is currently disabled."
          );

          return;
        }

        // ---------------------------------------
        // 8. Get /report input
        // ---------------------------------------

        let inputText = null;

        if (commandName === "report") {
          inputText =
            interaction.data?.options?.find(
              (option) =>
                option.name === "text"
            )?.value || null;
        }

        // ---------------------------------------
        // 9. Save interaction
        // ---------------------------------------

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
          VALUES
          ($1, $2, $3, $4, $5, $6, $7)`,
          [
            interactionId,
            `/${commandName}`,
            userId,
            username,
            inputText,
            "received",
            "Command received and processing",
          ]
        );

        // ---------------------------------------
        // 10. Notification
        // ---------------------------------------

        let notificationFailed = false;
        let notificationErrorMessage = null;

        if (command.mirror_enabled) {
          try {
            const notificationMessage =
              `🔔 **Command Received**\n` +
              `User: ${username}\n` +
              `Command: /${commandName}` +
              (inputText
                ? `\nInput: ${inputText}`
                : "");

            await sendDiscordNotification(
              notificationMessage
            );
          } catch (error) {
            notificationFailed = true;
            notificationErrorMessage =
              error.message;

            console.error(
              "Notification failed:",
              error
            );
          }
        }

        // ---------------------------------------
        // 11. Update log
        // ---------------------------------------

        if (notificationFailed) {
          await pool.query(
            `UPDATE interaction_logs
             SET
               status = $1,
               error = $2,
               action = $3
             WHERE interaction_id = $4`,
            [
              "notification_failed",
              notificationErrorMessage,
              "Command processed but notification failed",
              interactionId,
            ]
          );
        } else {
          await pool.query(
            `UPDATE interaction_logs
             SET
               status = $1,
               action = $2
             WHERE interaction_id = $3`,
            [
              "completed",
              command.mirror_enabled
                ? "Command processed and notification sent"
                : "Command processed; notification disabled",
              interactionId,
            ]
          );
        }

        // ---------------------------------------
        // 12. Build Discord response
        // ---------------------------------------

        let responseText =
          command.response_text;

        if (
          commandName === "report" &&
          inputText
        ) {
          responseText =
            `${responseText}\n\nReport: ${inputText}`;
        }

        if (notificationFailed) {
          responseText +=
            "\n\n⚠️ Your command was processed, but the notification could not be sent.";
        }

        // ---------------------------------------
        // 13. Send follow-up response
        // ---------------------------------------

        await sendInteractionFollowup(
          interactionToken,
          responseText
        );
      } catch (processingError) {
        console.error(
          "Discord command processing error:",
          processingError
        );

        // Try to tell Discord that processing failed
        try {
          await sendInteractionFollowup(
            interactionToken,
            "⚠️ Something went wrong while processing this command."
          );
        } catch (followupError) {
          console.error(
            "Failed to send Discord error response:",
            followupError
          );
        }
      }
    } catch (error) {
      console.error(
        "Discord interaction error:",
        error
      );

      // Only send HTTP 500 if we haven't already
      // acknowledged the interaction.
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  }
);

module.exports = router;