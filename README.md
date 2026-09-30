# CommandFlow Bot

CommandFlow is a Discord slash-command management system built as a
full-stack technical assessment.

It receives Discord slash-command interactions through a public HTTPS
endpoint, verifies Discord signatures, records command activity in
PostgreSQL, sends a response back to Discord, mirrors notifications to a
second Discord channel, and provides an authenticated admin dashboard
for logs and command configuration.

## Features

-   Discord slash commands:
    -   `/status`
    -   `/report <text>`
-   Discord Ed25519 signature verification
-   Discord PING handling
-   Interaction ID deduplication
-   PostgreSQL persistence
-   Admin login using JWT
-   Protected admin APIs
-   Live command/action log dashboard
-   Command configuration:
    -   Enable/disable command
    -   Enable/disable notification mirroring
    -   Change response text
-   Discord-to-Discord notification mirroring
-   Deferred Discord response (`type: 5`) for work that can take longer
    than the initial interaction window
-   Environment variables for secrets
-   React + Vite + Tailwind admin UI
-   Node.js + Express backend

## Architecture

``` text
Discord User
     |
     | /status or /report
     v
Discord API
     |
     | Signed HTTPS POST
     v
Public Express API
/api/discord/interactions
     |
     +--> Verify Ed25519 signature
     |
     +--> Handle PING
     |
     +--> Immediately acknowledge interaction
     |
     +--> Check duplicate interaction ID
     |
     +--> Read command configuration
     |
     +--> Save interaction log
     |
     +--> Send notification to #notifications
     |
     +--> Send Discord follow-up
     |
     v
PostgreSQL / Supabase

Admin
  |
  v
React Dashboard
  |
  +--> JWT login
  +--> View logs
  +--> Configure commands
```

## Tech Stack

### Frontend

-   React
-   Vite
-   Tailwind CSS
-   Axios
-   React Router
-   Lucide React

### Backend

-   Node.js
-   Express
-   PostgreSQL
-   `pg`
-   JWT
-   bcryptjs
-   tweetnacl
-   discord-interactions

### Deployment

-   Frontend: Vercel or equivalent static hosting
-   Backend: Render or equivalent Node.js hosting
-   Database: Supabase PostgreSQL
-   Discord: Discord Developer Portal

## Project Structure

``` text
discord-command-bot/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── createAdmin.js
│   │   ├── registerCommands.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── AI_NOTES.md
└── README.md
```

## Local Setup

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd discord-command-bot
```

### 2. Backend

``` bash
cd server
npm install
```

Create `.env`:

``` env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_PUBLIC_KEY=your_discord_public_key
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_NOTIFICATION_CHANNEL_ID=your_notification_channel_id
```

Never commit `.env`.

Run the backend:

``` bash
npm run dev
```

For production:

``` bash
npm start
```

### 3. Create the admin account

From the `server` directory:

``` bash
node src/createAdmin.js
```

Change the default credentials before final submission.

### 4. Register Discord commands

``` bash
node src/registerCommands.js
```

This registers:

``` text
/status
/report text:<report>
```

### 5. Frontend

``` bash
cd ../client
npm install
```

Create `.env`:

``` env
VITE_API_URL=http://localhost:5000/api
```

Run:

``` bash
npm run dev
```

## Database

The application uses PostgreSQL.

Required tables:

-   `admins`
-   `commands`
-   `interaction_logs`
-   `discord_servers`

Example command seed data:

``` sql
INSERT INTO commands
(name, description, enabled, mirror_enabled, response_text)
VALUES
(
    '/status',
    'Check the current system status',
    TRUE,
    TRUE,
    'System is operational ✅'
),
(
    '/report',
    'Submit a report',
    TRUE,
    TRUE,
    'Your report has been received successfully.'
);
```

## Discord Configuration

The Discord Developer Portal must contain the public HTTPS interaction
endpoint:

``` text
https://discord-command-bot-szbj.onrender.com/api/discord/interactions
```

For a final deployment, replace this with the final production backend
URL if the hosting URL changes.

The endpoint must be publicly reachable over HTTPS.

## Security

The Discord endpoint verifies:

-   `X-Signature-Ed25519`
-   `X-Signature-Timestamp`

The signature is verified against the raw request body before processing
the interaction.

Admin endpoints require:

``` text
Authorization: Bearer <JWT>
```

Secrets are stored in environment variables and are not included in the
repository.

## Interaction Flow

For a slash command:

1.  Discord sends the interaction.
2.  The server verifies the Discord signature.
3.  PING interactions receive the required PONG response.
4.  Command interactions are acknowledged immediately using a deferred
    response.
5.  The interaction ID is checked for duplicates.
6.  The command configuration is loaded from PostgreSQL.
7.  The interaction is recorded in `interaction_logs`.
8.  If mirroring is enabled, a notification is sent to the configured
    Discord channel.
9.  The command result is sent using the Discord interaction follow-up
    endpoint.
10. The admin dashboard displays the recorded action.

## Testing

### `/status`

Expected:

``` text
/status
```

Discord should return the configured response.

The notification channel should receive a message similar to:

``` text
🔔 Command Received
User: <username>
Command: /status
```

The dashboard should show a new interaction log.

### `/report`

Example:

``` text
/report text:Login page is showing an error
```

Expected:

-   Discord response
-   Database log
-   Notification message
-   Report text stored in `input_text`

### Disabled command

From the admin dashboard:

1.  Open Commands.
2.  Disable `/status`.
3.  Save.
4.  Run `/status` in Discord.

Expected:

``` text
This command is currently disabled.
```

### Changed response

Update the response text in the dashboard and run the command again.

### Mirror disabled

Disable mirroring for a command.

The command should still process, but no notification should be sent.

### Duplicate protection

The same Discord interaction ID must not create multiple log records
because `interaction_logs.interaction_id` is unique.

### Authentication

Verify that:

-   Login works with valid credentials.
-   Invalid credentials are rejected.
-   Admin APIs reject requests without a valid JWT.
-   Logout removes the local token.

## Deployment

### Backend

Create a Node.js web service on the hosting provider.

Build/start command:

``` text
npm start
```

Root directory:

``` text
server
```

Add the backend environment variables in the hosting dashboard.

### Frontend

Build command:

``` text
npm run build
```

Output directory:

``` text
dist
```

Set:

``` env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

### Discord

After the backend is deployed, configure the Discord Developer Portal
with:

``` text
https://YOUR-BACKEND-DOMAIN/api/discord/interactions
```

Do not use localhost for the Discord interaction endpoint.

## Known Deployment Note

During development, the Render deployment was investigated because
Discord displayed:

``` text
CommandFlow Bot didn't respond in time
```

The important architectural fix was to acknowledge Discord interactions
immediately with a deferred response instead of waiting for database and
notification work.

If the hosted service is sleeping, unreachable, or running an older
deployment, Discord can still time out before the application receives
the request. The final deployment should therefore be tested from the
public backend URL before submission.

## Demo Credentials

For the evaluator, provide a throwaway admin account rather than a
development password.

Example:

``` text
Email: evaluator@example.com
Password: <temporary-password>
```

Replace the values above before submission.

## Submission

Provide:

1.  GitHub repository URL
2.  Deployed frontend URL
3.  Public backend/health URL if requested
4.  Discord test server/invite
5.  Throwaway admin credentials
6.  `README.md`
7.  `AI_NOTES.md`

Do not include:

-   `.env`
-   Discord bot token
-   Discord public key if you do not want it exposed unnecessarily
-   JWT secret
-   Database password
-   Personal passwords
