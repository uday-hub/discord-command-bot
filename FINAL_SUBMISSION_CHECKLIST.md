# CommandFlow Final Submission Checklist

## Before Git Push

-   [ ] Remove `.env` from Git
-   [ ] Keep `.env.example`
-   [ ] Remove personal passwords/secrets
-   [ ] Change development admin password
-   [ ] Confirm `package.json` scripts
-   [ ] Confirm `README.md`
-   [ ] Confirm `AI_NOTES.md`

## Git

``` bash
git status
git add .
git commit -m "Finalize Discord slash command bot assessment"
git push
```

## Backend Deployment

-   [ ] Render service is Live
-   [ ] Root URL responds
-   [ ] `/api/health` responds
-   [ ] Environment variables are configured
-   [ ] Latest Git commit is deployed
-   [ ] Render logs show server startup without fatal errors

## Frontend Deployment

-   [ ] Production frontend is accessible
-   [ ] `VITE_API_URL` points to production backend
-   [ ] Login works
-   [ ] Dashboard loads
-   [ ] Commands page loads
-   [ ] Logout works

## Discord

-   [ ] Bot is in test server
-   [ ] `/status` appears
-   [ ] `/report` appears
-   [ ] Interactions Endpoint URL points to production backend
-   [ ] `/status` tested
-   [ ] `/report` tested
-   [ ] Notification channel tested
-   [ ] Disabled command tested
-   [ ] Changed response tested
-   [ ] Dashboard log tested

## Evaluator Package

Give the evaluator:

-   GitHub repository
-   Frontend URL
-   Discord server/invite
-   Throwaway admin email
-   Throwaway admin password
-   Short test instructions

## Important

Never submit:

``` text
DISCORD_BOT_TOKEN
JWT_SECRET
DATABASE_URL with password
Personal account passwords
.env
```
