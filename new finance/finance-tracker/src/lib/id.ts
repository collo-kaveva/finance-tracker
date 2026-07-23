import { randomBytes } from "crypto";

/** Generates a short, URL-safe unique id (no external dependency needed). */
export function createId(): string {
  return randomBytes(12).toString("base64url");
}
