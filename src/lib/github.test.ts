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

  it("reports hasError instead of silently ending pagination on failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const client = new GitHub({ token: "test-token" });
    const result = await client.fetchRepos();

    expect(result.hasError).toBe(true);
  });
});

describe("GitHub#fetchAllRepos", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("propagates hasError when a page fails mid-pagination", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          viewer: {
            watching: {
              pageInfo: { hasNextPage: true, endCursor: "cursor-1" },
              nodes: [
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
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    const client = new GitHub({ token: "test-token" });
    const result = await client.fetchAllRepos();

    expect(result.repositories).toHaveLength(1);
    expect(result.hasError).toBe(true);
  });
});
