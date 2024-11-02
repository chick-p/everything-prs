import { Octokit } from "@octokit/rest";
import { Endpoints } from "@octokit/types";

export type UserResponse = Endpoints["GET /user"]["response"];
export type RepositoryResponse = keyof Endpoints["GET /user/repos"]["response"];
export type PullRequestResponse =
  keyof Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"];

type Repository = {
  owner: string;
  name: string;
};

export class GitHub {
  private client: Octokit;

  constructor({ token }: { token: string }) {
    const octokit = new Octokit({
      auth: token,
    });
    this.client = octokit;
  }

  async getMe() {
    const resp = await this.client.users.getAuthenticated();
    return resp.data;
  }

  async fetchRepos(params: { page: number }): Promise<Array<Repository>> {
    const { page } = params;
    const resp =
      await this.client.activity.listWatchedReposForAuthenticatedUser({
        per_page: 100,
        page,
      });
    return resp.data.map((repo) => {
      return {
        owner: repo.owner.login,
        name: repo.name,
      };
    });
  }

  async fetchReposRecursive(params: {
    results: Repository[];
    page: number;
  }): Promise<Array<Repository>> {
    const { results, page } = params;
    let allRepos: Array<Repository> = [];
    const result = await this.fetchRepos({ page });
    allRepos = results.concat(result);
    if (result.length === 0) {
      return allRepos;
    }
    return this.fetchReposRecursive({ results: allRepos, page: page + 1 });
  }

  async getAllRepos(): Promise<Array<Repository>> {
    const results = await this.fetchReposRecursive({ results: [], page: 1 });
    return results;
  }

  async fetchPullRequests({ owner, repo }: { owner: string; repo: string }) {
    try {
      const resp = await this.client.pulls.list({
        owner,
        repo,
        direction: "desc",
      });
      const data = resp.data;
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}
