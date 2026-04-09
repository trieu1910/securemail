/** Extract display name from "Name <email>" format.
 *  Falls back to the local part of the email address. */
export function extractName(addr: string): string {
  const match = addr.match(/^"?([^"<]+)"?\s*</)
  return match ? match[1].trim() : addr.split('@')[0]
}

/** Extract email address from "Name <email>" format.
 *  Returns the raw string if no angle-bracket pattern is found. */
export function extractEmail(addr: string): string {
  const match = addr.match(/<([^>]+)>/)
  return match ? match[1] : addr
}
