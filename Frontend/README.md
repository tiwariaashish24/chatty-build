# Chatty frontend

The frontend is a React single-page app built with Vite. It uses React Router for navigation, guarded chat routes, and responsive layouts for direct conversations and rooms.

## Development

From this directory:

```sh
npm ci
npm run dev
```

The Vite development server proxies `/api` and `/socket.io` to `http://localhost:8080` by default. Set `VITE_API_PROXY_TARGET` or `VITE_SOCKET_PROXY_TARGET` to use a different development backend. For deployments where the API is not served through the same origin, configure `VITE_API_URL` and `VITE_SOCKET_URL`.

## Routes

| Path | Behavior |
| --- | --- |
| `/` | Redirects to `/chat` when authenticated, otherwise `/login` |
| `/login` | Sign in |
| `/signup` | Create an account |
| `/chat` | Protected direct conversations |
| `/rooms` | Protected room conversations |

## Validation

```sh
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

The Playwright tests exercise signup/login and access control, direct-message send/read-back, and room creation/message/delete flows at mobile and desktop viewport sizes. API routes are stubbed with stateful in-memory fixtures in these browser tests; they verify the frontend journey and request behavior, not MongoDB persistence. See [runtime-validation-report.md](./runtime-validation-report.md) for the validation boundary and results.
