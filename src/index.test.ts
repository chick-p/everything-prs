import { describe, expect, it } from "vitest";
import app from "./index";

const testEnv = {
  TZ: "Asia/Tokyo",
  TOKEN_ENCRYPTION_KEY: "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
};

describe("POST /api/token/encrypt", () => {
  it.each([
    ["missing", {}],
    ["not a string", { token: 123 }],
  ])("returns 400 when token is %s", async (_label, body) => {
    const res = await app.request(
      "/api/token/encrypt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify(body),
      },
      testEnv,
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when the request body is not valid JSON", async () => {
    const res = await app.request(
      "/api/token/encrypt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: "{not valid json",
      },
      testEnv,
    );

    expect(res.status).toBe(400);
  });

  it("returns 403 when the Origin header is missing", async () => {
    const res = await app.request(
      "/api/token/encrypt",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "ghp_example" }),
      },
      testEnv,
    );

    expect(res.status).toBe(403);
  });

  it("returns 403 when the Origin header does not match the request origin", async () => {
    const res = await app.request(
      "/api/token/encrypt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://evil.example.com",
        },
        body: JSON.stringify({ token: "ghp_example" }),
      },
      testEnv,
    );

    expect(res.status).toBe(403);
  });

  it("returns 200 when the Origin header matches the request origin", async () => {
    const res = await app.request(
      "/api/token/encrypt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ token: "ghp_example" }),
      },
      testEnv,
    );

    expect(res.status).toBe(200);
  });
});
