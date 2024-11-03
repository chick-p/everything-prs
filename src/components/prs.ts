import { html } from "hono/html";

import type { HtmlEscapedString } from "hono/utils/html";
import { GitHub } from "../lib/github";

type PR = {
  owner: string;
  repo: string;
  title: string;
  html_url: string;
  user: {
    avatar_url: string;
    login?: string;
  };
};

const list = (props: { name: string; prs: Array<PR> }) => html`
  <div>
    <div class="c-prs-label">${props.name}</div>
    <ul class="c-prs-list">
      ${props.prs.map(
        (pr) =>
          html`<li>
            <img
              class="c-prs-list____item-avator-icon"
              src="${pr.user.avatar_url}"
              alt="${pr.user.login}"
            />
            <a href="${pr.html_url}">${pr.title}</a>
          </li>`,
      )}
    </ul>
  </div>
`;

export const PullRequestHtml = async (props: {
  token: string;
  repos: Record<string, string>;
}) => {
  const token = props.token;

  if (Object.keys(props.repos).length === 0) {
    return html`<div>
      <div>No wathced repositories</div>
    </div>`;
  }

  const repos = Object.entries(props.repos)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const client = new GitHub({ token });

  let allPrs: Record<string, Array<PR>> = {};

  for (const repo of repos) {
    const [owner, repoName] = repo.split("/");
    const prs =
      (await client.fetchPullRequests({ owner, repo: repoName })) || [];
    const key = `${owner}/${repoName}`;
    const converted = prs.map((pr) => {
      return {
        owner,
        repo: repoName,
        title: pr.title,
        html_url: pr.html_url,
        user: {
          avatar_url: pr.user?.avatar_url || "",
          login: pr.user?.login || "",
        },
      };
    });
    allPrs = {
      ...allPrs,
      [key]: converted,
    };
  }

  let allContent: Array<HtmlEscapedString> = [];
  for (const [key, value] of Object.entries(allPrs)) {
    if (value.length > 0) {
      const content = await list({ name: key, prs: value });
      allContent = [...allContent, content];
    }
  }

  if (allContent.length === 0) {
    return html`<div>No pull requests</div>`;
  }
  return allContent.join("");
};
