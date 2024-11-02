import { html } from "hono/html";

import { GitHub } from "../lib/github";

type Repository = {
  owner: string;
  repoName: string;
};

const repoItem = (props: { repo: Repository }) => {
  const label = `${props.repo.owner}/${props.repo.repoName}`;
  return html` <li class="c-repos-list__item">
    <input
      type="checkbox"
      id="${label}"
      name="${label}"
      class="js_repository_checkbox"
    />
    <label for="${label}">${label}</label>
  </li>`;
};

const content = (props: { repository: Array<Repository> }) => html`
  <div>
    <div>
      <ul class="c-repos-list">
        ${props.repository.map((repo) => repoItem({ repo }))}
      </ul>
    </div>
    <div>
      <button class="js-save">Save</button>
      <span class="js-hidden js-save-message">Saved!</span>
    </div>
  </div>
`;

export const repositoryHtml = async (props: { token: string }) => {
  const token = props.token;

  const client = new GitHub({ token });
  const results = await client.getAllRepos();

  const repos = results.sort((a, b) => {
    const owner = a.owner.localeCompare(b.owner);
    if (owner === 0) {
      return a.name.localeCompare(b.name);
    }
    return owner;
  });

  const repository = repos.map((repo) => {
    return {
      owner: repo.owner,
      repoName: repo.name,
    };
  });

  return content({ repository });
};
