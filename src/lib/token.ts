const IV_LENGTH_BYTES = 12;
const FORMAT_PREFIX = "v1";

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export async function importEncryptionKey(
  base64Key: string,
  usages: KeyUsage[] = ["encrypt", "decrypt"],
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    base64ToBytes(base64Key),
    "AES-GCM",
    false,
    usages,
  );
}

export async function encryptToken(
  key: CryptoKey,
  token: string,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(token),
  );
  return `${FORMAT_PREFIX}:${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptToken(
  key: CryptoKey,
  encrypted: string,
): Promise<string> {
  const parts = encrypted.split(":");
  if (parts.length !== 3 || parts[0] !== FORMAT_PREFIX) {
    throw new Error("Invalid encrypted token format");
  }
  const [, ivPart, ciphertextPart] = parts;
  const iv = base64ToBytes(ivPart);
  const ciphertext = base64ToBytes(ciphertextPart);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}

export async function resolveToken(
  key: CryptoKey,
  encryptedToken: string | null,
): Promise<string | null> {
  if (!encryptedToken) {
    return null;
  }
  try {
    return await decryptToken(key, encryptedToken);
  } catch (error) {
    console.error(
      "Token decryption failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}
