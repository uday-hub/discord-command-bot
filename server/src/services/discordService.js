const DISCORD_API = "https://discord.com/api/v10";

async function sendDiscordNotification(message) {
  const channelId = process.env.DISCORD_NOTIFICATION_CHANNEL_ID;

  if (!channelId) {
    throw new Error("DISCORD_NOTIFICATION_CHANNEL_ID is not configured");
  }

  const response = await fetch(
    `${DISCORD_API}/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Discord notification failed: ${JSON.stringify(data)}`
    );
  }

  return data;
}

module.exports = {
  sendDiscordNotification,
};