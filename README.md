# Claude POC

> **Archived.** Built in July 2025 as a proof of concept and kept here as a record. It is not maintained and does not run as-is today: the Gitpod workspace it pointed at is gone and the model the API requested has been retired.
>
> This is the UI half. A chat panel on the left sends prompts to the Claude Code API in [`claude-poc`](https://github.com/l4j3b/claude-poc) (`POST /claude/stream`) and renders the streamed messages: text, tool calls with their commands and file paths, tool results, and the final turn count, duration and cost. An iframe on the right shows the Next.js dev server that Claude is editing. [`loveable-hack-backend`](https://github.com/l4j3b/loveable-hack-backend) later moved the API to Fly.io.

This is a POC for using Claude code to generate code.

Basically a quick POC of a loveable.ai like app...

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
