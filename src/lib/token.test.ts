import { describe, expect, it, vi } from "vitest";
import {
  importEncryptionKey,
  encryptToken,
  decryptToken,
  resolveToken,
} from "./token";

const testBase64Key = "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=";

describe("encryptToken / decryptToken", () => {
  it("round-trips a token back to its original value", async () => {
    const key = await importEncryptionKey(testBase64Key);
    const token = "ghp_exampletoken1234567890";

    const encrypted = await encryptToken(key, token);
    const decrypted = await decryptToken(key, encrypted);

    expect(decrypted).toBe(token);
  });

  it("produces ciphertext in the v1:<iv>:<ciphertext> format", async () => {
    const key = await importEncryptionKey(testBase64Key);
    const encrypted = await encryptToken(key, "ghp_exampletoken1234567890");

    expect(encrypted).toMatch(/^v1:[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/);
  });

  it("produces a different ciphertext each time for the same token", async () => {
    const key = await importEncryptionKey(testBase64Key);
    const token = "ghp_exampletoken1234567890";

    const first = await encryptToken(key, token);
    const second = await encryptToken(key, token);

    expect(first).not.toBe(second);
  });

  it("throws when the encrypted string has an invalid format", async () => {
    const key = await importEncryptionKey(testBase64Key);

    await expect(decryptToken(key, "not-a-valid-format")).rejects.toThrow();
  });

  it("throws when decrypting with a different key (tamper/auth-tag check)", async () => {
    const key = await importEncryptionKey(testBase64Key);
    const otherKey = await importEncryptionKey(
      "ZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoM=",
    );
    const encrypted = await encryptToken(key, "ghp_exampletoken1234567890");

    await expect(decryptToken(otherKey, encrypted)).rejects.toThrow();
  });

  it("round-trips an empty string token", async () => {
    const key = await importEncryptionKey(testBase64Key);

    const encrypted = await encryptToken(key, "");
    const decrypted = await decryptToken(key, encrypted);

    expect(decrypted).toBe("");
  });
});

describe("resolveToken", () => {
  it("returns the decrypted token for a valid encrypted token", async () => {
    const key = await importEncryptionKey(testBase64Key);
    const encrypted = await encryptToken(key, "ghp_exampletoken1234567890");

    const result = await resolveToken(key, encrypted);

    expect(result).toBe("ghp_exampletoken1234567890");
  });

  it("returns null when the encrypted token is null", async () => {
    const key = await importEncryptionKey(testBase64Key);

    const result = await resolveToken(key, null);

    expect(result).toBeNull();
  });

  it("returns null when decryption fails", async () => {
    const key = await importEncryptionKey(testBase64Key);

    const result = await resolveToken(key, "not-a-valid-format");

    expect(result).toBeNull();
  });

  it("logs a reason when decryption fails, without leaking the encrypted or decrypted token", async () => {
    const key = await importEncryptionKey(testBase64Key);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const badEncrypted = "v1:not-a-valid-iv:not-a-valid-ciphertext";

    await resolveToken(key, badEncrypted);

    expect(errorSpy).toHaveBeenCalled();
    const loggedText = errorSpy.mock.calls.flat().join(" ");
    expect(loggedText).not.toContain(badEncrypted);

    errorSpy.mockRestore();
  });
});
