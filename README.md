# Claude App Builder: frontend

> [!WARNING]
> ⚠️ **Archived proof of concept (July 2025).** Kept here as a record. It ran on Vercel. It is not maintained and no longer runs: the Vercel deployment and the backend it called are gone, and the model the backend requested has been retired.

The website of Claude App Builder, a Lovable-style tool that built web apps from a prompt. This was the user entry point. The user workspaces, where Claude Code edited and served each user's app, ran on [`claude-app-builder-backend`](https://github.com/l4j3b/claude-app-builder-backend).

## How the two repos worked together

| Repo | Role | Ran on |
| --- | --- | --- |
| `claude-app-builder-frontend` (this repo) | The website and user entry point. Users describe the app they want in a chat panel that streams Claude's work (text, tool calls with their commands and file paths, tool results, and the final turn count, duration and cost), next to a live preview of their app | Vercel |
| [`claude-app-builder-backend`](https://github.com/l4j3b/claude-app-builder-backend) | The user workspaces. A workspace runs the Claude Code API (FastAPI around the Claude Code SDK) and the user's Next.js app, which Claude edits | Gitpod, then Fly.io |

A user types a prompt on the website. The frontend sends it to the workspace's streaming endpoint, Claude Code edits the user's app in that workspace, and the website's preview iframe, pointed at the workspace's dev server, shows the change. This repo's code calls the Gitpod version of the backend ([first commit](https://github.com/l4j3b/claude-app-builder-backend/tree/2797d56331d8b45b3c6417faafdcfbdf4d204063)) at `POST /claude/stream`.

## Original notes

This is a POC for using Claude code to generate code.

Basically a quick POC of a Lovable-like app...

- The code is generated in a Gitpod workspace and then deployed to a dev server.
- The dev server is then used to run the app.
- Claude runs through a separate API endpoint on the gitpod workspace.
- The output of the code is streamed to the app.
- The nextjs app then calls the code api to modify the code.
- The response is then streamed to the app.

## Getting Started

# Prerequisites

Set env variables in .env:

```bash
# NEXT_PUBLIC_BASE_GITPOD_URL="XXXXX-claudepoc-XXXXXXXXX.ws-eu120.gitpod.io"
NEXT_PUBLIC_BASE_GITPOD_URL="REPLACE_WITH_YOUR_GITPOD_ADDRESS_WITHOUT_HTTP"

NEXT_PUBLIC_DEV_SERVER_PORT="3000"
NEXT_PUBLIC_CODE_API_PORT="8000"
```

# Run the app

1. Clone the repository
2. Run `pnpm install`
3. Run `pnpm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser
5. Start coding!
