import { html } from "hono/html";

import type { HtmlEscapedString } from "hono/utils/html";
import { CheckStatusState, GitHub, state } from "../lib/github";

type PR = {
  owner: string;
  repo: string;
  title: string;
  html_url: string;
  user: {
    avatar_url: string;
    login?: string;
  };
  check_status: CheckStatusState | null;
};

const list = (props: { name: string; prs: Array<PR> }) => html`
  <section>
    <h3 class="c-prs-label">${props.name}</h3>
    <ul class="c-prs-list">
      ${props.prs.map((pr) => {
        const status = pr.check_status || "EXPECTED";
        return html`<li>
          <img
            class="c-prs-list____item-avator-icon"
            src="${pr.user.avatar_url}"
            alt="${pr.user.login}"
          />
          <a href="${pr.html_url}">${pr.title}</a>
          <span class="c-prs-list__item-check">${state[status]}</span>
        </li>`;
      })}
    </ul>
  </section>
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
    const prs = (await client.fetchAllPullRequests({ owner, repoName })) || [];
    const key = `${owner}/${repoName}`;
    const converted = prs.map((pr) => {
      return {
        owner,
        repo: repoName,
        title: pr.title,
        html_url: pr.url,
        user: {
          avatar_url: pr.author.avatarUrl,
          login: pr.author.login,
        },
        check_status: pr.checkStatus,
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
  return `
    <h2>Pull Requests</h2>
    ${allContent.join("")}
    `;
};
