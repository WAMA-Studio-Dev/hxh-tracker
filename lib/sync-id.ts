const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous 0/O/1/l/I
const LENGTH = 6;

export function generateSyncId(): string {
  const bytes = new Uint8Array(LENGTH);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < LENGTH; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let id = "";
  for (let i = 0; i < LENGTH; i++) {
    id += ALPHABET[(bytes[i] ?? 0) % ALPHABET.length];
  }
  return id;
}

export function isValidSyncId(value: string): boolean {
  return /^[a-z2-9]{4,12}$/.test(value);
}
