import { afterEach, describe, expect, it, vi } from "vitest";
import { GitHub, state, type CheckStatusState } from "./github";

describe("state", () => {
  it("has an emoji for every CheckStatusState", () => {
    const statuses: CheckStatusState[] = [
      "SUCCESS",
      "ERROR",
      "FAILURE",
      "PENDING",
      "EXPECTED",
    ];

    for (const status of statuses) {
      expect(state[status]).toBeTypeOf("string");
      expect(state[status].length).toBeGreaterThan(0);
    }
  });
});

describe("GitHub#fetchRepos", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips nodes with a null owner instead of dropping the whole page", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          viewer: {
            watching: {
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [
                { owner: null, name: "inaccessible-repo", isArchived: false },
                {
                  owner: {
                    login: "octocat",
                    avatarUrl: "https://example.com/a.png",
                    __typename: "User",
                  },
                  name: "hello-world",
                  isArchived: false,
                },
              ],
            },
          },
        },
      }),
    } as Response);

    const client = new GitHub({ token: "test-token" });
    const result = await client.fetchRepos();

    expect(result.repositories).toEqual([
      {
        owner: "octocat",
        name: "hello-world",
        archived: false,
        owner_avatar_url: "https://example.com/a.png",
      },
    ]);
  });
});
