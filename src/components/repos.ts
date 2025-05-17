import { html } from "hono/html";

import { GitHub } from "../lib/github";

type Owner = {
  name: string;
  avatar_url: string;
  repos: Array<string>;
};

const repoItem = (props: { repo: string }) => {
  const repoName = props.repo;
  return html` <li class="c-repos-list__item">
    <input
      type="checkbox"
      id="${repoName}"
      name="${repoName}"
      class="js_repository_checkbox"
    />
    <label for="${repoName}">${repoName}</label>
  </li>`;
};

const content = (props: { repository: Array<Owner> }) => html`
  <div>
    ${props.repository.map((owner) => {
      return html`<section>
        <fieldset>
          <legend>
            <img
              class="c-repos-list__item-avator-icon"
              src="${owner.avatar_url}"
              alt=""
            />
            ${owner.name}
          </legend>
          <ul class="c-repos-list">
            ${owner.repos.map((repo) => repoItem({ repo }))}
          </ul>
        </fieldset>
      </section>`;
    })}
    <div class="c-sticky-bottom-menu">
      <button class="js-save">Save</button>
      <span class="js-hidden js-save-message">Saved!</span>
    </div>
  </div>
`;

const findOwner = (owner: string, tree: Array<Owner>) =>
  tree.find((item) => item.name === owner);

export const repositoryHtml = async (props: { token: string }) => {
  const token = props.token;

  const client = new GitHub({ token });
  const results = await client.fetchAllRepos();

  const tree = results
    .filter((repo) => !repo.archived)
    .reduce((acc: Array<Owner>, repo) => {
      const owner = findOwner(repo.owner, acc);
      const fullname = `${repo.owner}/${repo.name}`;
      if (!owner) {
        acc = acc.concat({
          name: repo.owner,
          avatar_url: repo.owner_avatar_url,
          repos: [fullname],
        });
        return acc;
      }
      owner.repos = owner.repos.concat(fullname);
      return acc;
    }, []);

  const repos = tree
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((owner) => {
      owner.repos.sort();
      return owner;
    });

  return content({ repository: repos });
};
