# NEXUS AI desktop

Native Electron shell plus the local agent bridge. The bridge is the only
component with access to the real machine; the web front end calls it over
`http://127.0.0.1:17872/rpc` with the per-install token shown in the app.

## Run it

```bash
cd desktop
npm install
npm start                 # shell + bridge
npm run bridge            # bridge only (headless)
```

Point the shell at a different front end with `NEXUS_APP_URL`.

## Package installers

```bash
npm run dist:win     # NEXUS-AI-Setup-<version>.exe (NSIS)
npm run dist:mac     # .dmg
npm run dist:linux   # AppImage + .deb
```

## Bridge RPC

`POST /rpc` with `{ "method": string, "params": object }` and the header
`x-nexus-bridge-token`. `GET /health` is unauthenticated.

Methods: `health`, `grants.list|add|remove`, `fs.list|read|write|delete|rename|search`,
`terminal.exec|kill`, `git.status|diff|commit|branches|checkout|log`,
`roblox.status|sync|inspect`, `mcp.call`, `os.reveal`.

## Security

- Binds `127.0.0.1` only; every authenticated call checks the token.
- Every path is resolved and must sit inside a granted folder; grants are made
  through the native folder picker and stored in `~/.nexus-ai/bridge.json` (0600).
- Destructive shell commands are rejected unless the caller passes `approved`.
- Renderer runs with `contextIsolation`, `sandbox`, and no Node integration; the
  preload exposes a narrow IPC surface only.
