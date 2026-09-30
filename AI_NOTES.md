# AI Notes --- CommandFlow Bot

## AI tools/models used

AI assistance was used during development for:

-   Project architecture planning
-   Express/React implementation guidance
-   Discord interaction handling
-   Discord Ed25519 signature verification guidance
-   PostgreSQL schema design
-   JWT authentication structure
-   React dashboard UI implementation
-   Debugging and deployment troubleshooting
-   README and submission documentation

The final implementation was reviewed and tested by the developer rather
than blindly accepting generated code.

## Key implementation decisions

### 1. Discord-to-Discord mirroring

The requirement allowed either Slack Incoming Webhook or a second
Discord channel.

A second Discord channel was selected for the MVP because it removes an
unnecessary external integration and keeps the demonstration inside
Discord.

Flow:

``` text
Discord command
      |
      +--> command response
      |
      +--> notification channel
```

### 2. Deferred Discord interaction response

The initial implementation performed database and notification work
before responding to Discord.

That created a timeout risk because Discord requires an initial
interaction response quickly.

The implementation was changed to acknowledge the interaction first:

``` js
res.json({
  type: 5,
});
```

Longer processing then happens asynchronously and the result is returned
through the interaction follow-up endpoint.

This was one of the most important reliability decisions in the project.

### 3. Database-level duplicate protection

Discord interaction IDs are stored as unique values:

``` sql
interaction_id VARCHAR(255) UNIQUE NOT NULL
```

The server also checks for an existing interaction before processing it.

This provides both application-level and database-level protection
against duplicate processing.

## Hardest AI-caused / AI-assisted bug

The main difficult issue was the Discord timeout.

The first implementation waited for:

-   PostgreSQL queries
-   notification delivery
-   command processing

before returning the Discord response.

Discord therefore displayed:

``` text
CommandFlow Bot didn't respond in time
```

The solution was to separate:

``` text
Initial Discord acknowledgement
```

from:

``` text
Background command processing
```

The server now sends the deferred interaction response first and uses a
Discord webhook follow-up for the final result.

A second deployment-related issue was that Discord calls the public
hosted endpoint, not the developer's local machine. Therefore local code
changes only affect Discord after the backend deployment is updated.

## What could be improved

### 1. Better production observability

A production version should include:

-   Structured logs
-   Request correlation IDs
-   Error monitoring
-   Deployment health checks
-   Metrics for Discord interaction latency
-   Notification failure monitoring

### 2. Better background processing

For larger workloads, command processing could use a queue such as:

``` text
Discord
  |
  v
API
  |
  v
Queue
  |
  +--> Database
  +--> Notification
  +--> Other actions
```

This would make the system more resilient under load.

### 3. Better command management

A production version could support:

-   Creating commands from the dashboard
-   Editing command descriptions
-   Discord command synchronization
-   Per-server configuration
-   Permission/role restrictions
-   Command execution history
-   Search/filter/export of logs

### 4. Stronger authentication

The MVP uses JWT authentication.

A production system should additionally consider:

-   Refresh tokens
-   Password reset
-   Rate limiting
-   Account lockout
-   MFA
-   Audit logs for admin changes

### 5. Better notification reliability

Notification delivery currently records failures in the interaction log.

A production version could retry transient failures and use a
queue/dead-letter strategy.

## Development principle

The implementation prioritized the assessment's core requirements first:

1.  Public Discord endpoint
2.  Signature verification
3.  Slash commands
4.  Database logging
5.  Bot response
6.  Notification mirroring
7.  Admin authentication
8.  Dashboard
9.  Configuration
10. Deployment documentation

Stretch features were intentionally left until the core workflow was
stable.

## Final self-review checklist

-   [ ] Discord endpoint is public HTTPS
-   [ ] Ed25519 signature verification enabled
-   [ ] PING handled
-   [ ] `/status` registered
-   [ ] `/report` registered
-   [ ] Interaction logs stored
-   [ ] Duplicate interaction IDs prevented
-   [ ] Bot response implemented
-   [ ] Notification mirroring implemented
-   [ ] Admin login implemented
-   [ ] Protected admin APIs implemented
-   [ ] Dashboard displays logs
-   [ ] Command configuration works
-   [ ] Secrets removed from Git
-   [ ] `.env.example` included
-   [ ] README included
-   [ ] AI_NOTES included
-   [ ] Production URLs updated
-   [ ] Throwaway evaluator credentials created
