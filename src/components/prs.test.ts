import { describe, expect, it } from "vitest";
import type { PullRequest } from "../lib/github";
import { filterDraftPullRequests } from "./prs";

const buildPullRequest = (overrides: Partial<PullRequest>): PullRequest => ({
  id: "1",
  number: 1,
  title: "some title",
  url: "https://github.com/example/repo/pull/1",
  state: "OPEN",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  author: { login: "octocat", avatarUrl: "https://example.com/avatar.png" },
  checkStatus: null,
  isDraft: false,
  ...overrides,
});

describe("filterDraftPullRequests", () => {
  it("excludes draft pull requests when includeDraftPrs is false", () => {
    const draft = buildPullRequest({ id: "draft", isDraft: true });
    const ready = buildPullRequest({ id: "ready", isDraft: false });

    const result = filterDraftPullRequests([draft, ready], false);

    expect(result).toEqual([ready]);
  });

  it("includes draft pull requests when includeDraftPrs is true", () => {
    const draft = buildPullRequest({ id: "draft", isDraft: true });
    const ready = buildPullRequest({ id: "ready", isDraft: false });

    const result = filterDraftPullRequests([draft, ready], true);

    expect(result).toEqual([draft, ready]);
  });

  it("excludes draft pull requests when includeDraftPrs is omitted", () => {
    const draft = buildPullRequest({ id: "draft", isDraft: true });
    const ready = buildPullRequest({ id: "ready", isDraft: false });

    const result = filterDraftPullRequests([draft, ready]);

    expect(result).toEqual([ready]);
  });
});
