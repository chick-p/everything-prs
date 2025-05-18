import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import manifest from "__STATIC_CONTENT_MANIFEST";

import { Home, Settings, Repositories } from "./pages/index";
import { PullRequestHtml } from "./components/prs";
import { repositoryHtml } from "./components/repos";
import { TodayContributionHtml } from "./components/contribution";
import { html } from "hono/html";

const app = new Hono();

app.get("/static/*", serveStatic({ root: "./", manifest }));

app.get("/", (c) => {
  return c.html(<Home />);
});

app.post("/prs", async (c) => {
  const token = c.req.raw.headers.get("everything-prs-token");
  const body = await c.req.json();
  let htmlContent;
  if (token) {
    const pullRequestHtml = await PullRequestHtml({ token, repos: body.repos });
    const contributionHtml = await TodayContributionHtml({ token });
    htmlContent = contributionHtml + pullRequestHtml;
  } else {
    htmlContent = `<div>Unauthorized</div>`;
  }
  return c.html(htmlContent);
});

app.get("/settings", (c) => {
  return c.html(<Settings />);
});

app.get("/repos", (c) => {
  return c.html(<Repositories />);
});

app.post("/repos", async (c) => {
  const token = c.req.raw.headers.get("everything-prs-token");
  let htmlContent;
  if (token) {
    htmlContent = repositoryHtml({ token });
  } else {
    htmlContent = `<div>Unauthorized</div>`;
  }

  return c.html(htmlContent);
});

export default app;
