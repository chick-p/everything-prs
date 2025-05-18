type Repository = {
  owner: string;
  name: string;
  archived: boolean;
  owner_avatar_url: string;
};

export type UserData = {
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type PullRequest = {
  id: string;
  number: number;
  title: string;
  url: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
};

export type ContributionsCollection = {
  contributionCalendar: {
    totalContributions: number;
    weeks: Array<{
      contributionDays: Array<{
        contributionCount: number;
        date: string;
      }>;
    }>;
  };
};

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}

export class GitHub {
  private token: string;
  private endpoint = "https://api.github.com/graphql";

  constructor({ token }: { token: string }) {
    this.token = token;
  }

  private async sendQuery<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "User-Agent": "everything-prs",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(
        `GraphQL request failed (${response.status}): ${response.statusText}`,
      );
    }

    const json: GraphQLResponse<T> = await response.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    }
    return json.data;
  }

  async getMe(): Promise<UserData> {
    const query = `
      query {
        viewer {
          login
          name
          email
          avatarUrl
        }
      }
    `;

    const data = await this.sendQuery<{ viewer: UserData }>(query);
    return data.viewer;
  }

  async fetchRepos(
    cursor: string | null = null,
    perPage = 100,
  ): Promise<{
    repositories: Repository[];
    hasNextPage: boolean;
    endCursor: string | null;
  }> {
    try {
      const query = `
        query getWatchedRepos($perPage: Int!, $cursor: String) {
          viewer {
            watching(first: $perPage, after: $cursor) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                owner {
                  login
                  avatarUrl
                }
                name
                isArchived
              }
            }
          }
        }
      `;

      const variables = {
        perPage,
        cursor,
      };

      const data = await this.sendQuery<{
        viewer: {
          watching: {
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
            nodes: Array<{
              owner: { login: string; avatarUrl: string };
              name: string;
              isArchived: boolean;
            }>;
          };
        };
      }>(query, variables);

      const repositories = data.viewer.watching.nodes.map((repo) => ({
        owner: repo.owner.login,
        name: repo.name,
        archived: repo.isArchived,
        owner_avatar_url: repo.owner.avatarUrl,
      }));

      return {
        repositories,
        hasNextPage: data.viewer.watching.pageInfo.hasNextPage,
        endCursor: data.viewer.watching.pageInfo.endCursor,
      };
    } catch (error) {
      console.error("Error fetching watched repositories:", error);
      return {
        repositories: [],
        hasNextPage: false,
        endCursor: null,
      };
    }
  }

  async fetchAllRepos(): Promise<Repository[]> {
    let allRepositories: Repository[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
      const result = await this.fetchRepos(endCursor);
      allRepositories = [...allRepositories, ...result.repositories];
      hasNextPage = result.hasNextPage;
      endCursor = result.endCursor;

      if (!endCursor) {
        break;
      }
    }

    return allRepositories;
  }

  async fetchPullRequests({
    owner,
    repoName,
    cursor = null,
    perPage = 100,
    state = "OPEN",
  }: {
    owner: string;
    repoName: string;
    cursor?: string | null;
    perPage?: number;
    state?: "OPEN" | "CLOSED" | "MERGED";
  }): Promise<{
    pullRequests: PullRequest[];
    hasNextPage: boolean;
    endCursor: string | null;
  }> {
    try {
      const query = `
        query fetchPullRequests($owner: String!, $name: String!, $perPage: Int!, $cursor: String, $state: [PullRequestState!]) {
          repository(owner: $owner, name: $name) {
            pullRequests(first: $perPage, after: $cursor, states: $state, orderBy: {field: CREATED_AT, direction: DESC}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                number
                title
                url
                state
                createdAt
                updatedAt
                author {
                  login
                  avatarUrl
                }
              }
            }
          }
        }
      `;

      const variables = {
        owner,
        name: repoName,
        perPage,
        cursor,
        state: [state],
      };

      const data = await this.sendQuery<{
        repository: {
          pullRequests: {
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
            nodes: PullRequest[];
          };
        };
      }>(query, variables);

      return {
        pullRequests: data.repository.pullRequests.nodes,
        hasNextPage: data.repository.pullRequests.pageInfo.hasNextPage,
        endCursor: data.repository.pullRequests.pageInfo.endCursor,
      };
    } catch (error) {
      console.error(
        `Error fetching pull requests for ${owner}/${repoName}:`,
        error,
      );
      return {
        pullRequests: [],
        hasNextPage: false,
        endCursor: null,
      };
    }
  }

  async fetchAllPullRequests({
    owner,
    repoName,
    state = "OPEN",
  }: {
    owner: string;
    repoName: string;
    state?: "OPEN" | "CLOSED" | "MERGED";
  }): Promise<PullRequest[]> {
    let allPullRequests: PullRequest[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
      const result = await this.fetchPullRequests({
        owner,
        repoName,
        cursor: endCursor,
        state,
      });

      allPullRequests = [...allPullRequests, ...result.pullRequests];
      hasNextPage = result.hasNextPage;
      endCursor = result.endCursor;

      if (!endCursor) {
        break;
      }
    }

    return allPullRequests;
  }

  async fetchContributes(params: {
    username: string;
    today: string;
  }): Promise<ContributionsCollection> {
    const { username, today } = params;
    try {
      const query = `
      query($username:String!, $from:DateTime!, $to:DateTime!) {
          user(login: $username) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }
      `;

      const variables = {
        username,
        from: `${today}T00:00:00`,
        to: `${today}T23:59:59`,
      };

      const data = await this.sendQuery<{
        user: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: number;
              weeks: Array<{
                contributionDays: Array<{
                  contributionCount: number;
                  date: string;
                }>;
              }>;
            };
          };
        };
      }>(query, variables);

      return data.user.contributionsCollection;
    } catch (error) {
      console.error(
        `Error fetching contributions for user ${username}:`,
        error,
      );
      return {
        contributionCalendar: {
          totalContributions: 0,
          weeks: [],
        },
      };
    }
  }
}
