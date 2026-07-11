import { Context, Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import manifest from "__STATIC_CONTENT_MANIFEST";

import { Home, Settings, Repositories } from "./pages/index";
import { PullRequestHtml } from "./components/prs";
import { repositoryHtml } from "./components/repos";
import { TodayContributionHtml } from "./components/contribution";
import { html } from "hono/html";
import { importEncryptionKey, encryptToken, resolveToken } from "./lib/token";

type Bindings = {
  TZ: string;
  TOKEN_ENCRYPTION_KEY: string;
};

type AppContext = Context<{ Bindings: Bindings }>;

const UNAUTHORIZED_HTML = `<div>Unauthorized</div>`;

function getTokenKey(c: AppContext, usage: KeyUsage): Promise<CryptoKey> {
  return importEncryptionKey(c.env.TOKEN_ENCRYPTION_KEY, [usage]);
}

async function resolveTokenFromRequest(c: AppContext): Promise<string | null> {
  const encryptedToken = c.req.raw.headers.get("everything-prs-token");
  const key = await getTokenKey(c, "decrypt");
  return resolveToken(key, encryptedToken);
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/static/*", serveStatic({ root: "./", manifest }));

app.get("/", (c) => {
  return c.html(<Home />);
});

app.post("/api/token/encrypt", async (c) => {
  const origin = c.req.header("origin");
  if (!origin || origin !== new URL(c.req.url).origin) {
    return c.json({ error: "origin not allowed" }, 403);
  }
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid json" }, 400);
  }
  if (typeof body.token !== "string") {
    return c.json({ error: "token must be a string" }, 400);
  }
  const key = await getTokenKey(c, "encrypt");
  const encrypted = await encryptToken(key, body.token);
  return c.json({ encrypted });
});

app.post("/prs", async (c) => {
  const token = await resolveTokenFromRequest(c);
  if (!token) {
    return c.html(UNAUTHORIZED_HTML);
  }
  const body = await c.req.json();
  const pullRequestHtml = await PullRequestHtml({ token, repos: body.repos });
  const contributionHtml = await TodayContributionHtml({
    token,
    tz: c.env.TZ,
  });
  return c.html(contributionHtml + pullRequestHtml);
});

app.get("/settings", (c) => {
  return c.html(<Settings />);
});

app.get("/repos", (c) => {
  return c.html(<Repositories />);
});

app.post("/repos", async (c) => {
  const token = await resolveTokenFromRequest(c);
  if (!token) {
    return c.html(UNAUTHORIZED_HTML);
  }
  const includeOrgs =
    c.req.raw.headers.get("everything-prs-include-orgs") === "1";
  return c.html(repositoryHtml({ token, includeOrgs }));
});

export default app;
