const dotenv = require("dotenv");

dotenv.config();

const commands = [
  {
    name: "status",
    description: "Check the current system status",
  },
  {
    name: "report",
    description: "Submit a report",
    options: [
      {
        name: "text",
        description: "Describe the issue or report",
        type: 3,
        required: true,
      },
    ],
  },
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_APPLICATION_ID}/commands`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to register commands:", data);
    process.exit(1);
  }

  console.log("Commands registered successfully:");
  console.log(data);
}

registerCommands();