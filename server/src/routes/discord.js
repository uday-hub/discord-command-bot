const express = require("express");
const nacl = require("tweetnacl");

const router = express.Router();

router.post("/interactions", express.raw({ type: "application/json" }), (req, res) => {
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

    // Discord PING verification
    if (interaction.type === 1) {
      return res.json({
        type: 1,
      });
    }

    console.log("Discord interaction received:");
    console.log(interaction);

    return res.json({
      type: 4,
      data: {
        content: "Command received successfully! ✅",
      },
    });
  } catch (error) {
    console.error("Discord interaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;