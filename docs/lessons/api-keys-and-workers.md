---
title: "Keep API keys in a Worker"
section: "Workflow"
source_url: ""
source: community-notes
last_synced: 2026-10-24
---
# Keep API keys in a Worker

A community note for apps that call a paid API (for example an AI model) from a website.

- Never put an API key in front-end code or commit it to a repository. Anyone can read it from the browser.
- Put the key in a server-side environment variable, such as a Cloudflare Worker secret or a Vercel environment variable.
- Make the browser call your own endpoint. The endpoint adds the key, calls the provider and streams the answer back.
- Lock CORS to your own domain and add a simple rate limit per IP.
- Do not log users' questions.
