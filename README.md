# Claude App Builder: frontend

> **Archived.** Built in July 2025 as a proof of concept and kept here as a record. It ran on Vercel. It is not maintained and no longer runs: the Vercel deployment and the backend it called are gone, and the model the backend requested has been retired.

## Part of Claude App Builder

Claude App Builder was a Lovable-style prompt-to-app tool made of two repos that worked together:

| Repo | Role | Ran on |
| --- | --- | --- |
| `claude-app-builder-frontend` (this repo) | The builder UI: a chat panel that streams Claude's messages (text, tool calls with their commands and file paths, tool results, and the final turn count, duration and cost) next to an iframe with a live preview of the app being built | Vercel |
| [`claude-app-builder-backend`](https://github.com/l4j3b/claude-app-builder-backend) | The Claude Code API (FastAPI around the Claude Code SDK) and the Next.js app that Claude edits | Gitpod, then Fly.io |

A prompt typed here goes to the backend's streaming endpoint. Claude Code edits the backend's Next.js app, and the preview iframe, pointed at that app's dev server, shows the change. This repo's code calls the Gitpod version of the backend ([first commit](https://github.com/l4j3b/claude-app-builder-backend/tree/2797d56331d8b45b3c6417faafdcfbdf4d204063)) at `POST /claude/stream`.

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
