/**
 * SSRF (Server-Side Request Forgery) & Prompt Injection Protection
 * Validates external brand URLs before analysis and sanitizes user inputs before LLM calls.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "169.254.169.254",
  "metadata.google.internal",
  "metadata",
]);

const PRIVATE_IPV4_PATTERNS = [
  /^127\./,
  /^10\./,
  /^0\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./,
];

export interface UrlValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  reason?: string;
}

export function validateExternalBrandUrl(rawUrl: string): UrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { valid: false, reason: "INVALID_URL_FORMAT" };
  }

  if (parsed.protocol !== "https:") {
    return {
      valid: false,
      reason: "HTTPS_REQUIRED",
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      reason: "CREDENTIALS_IN_URL_FORBIDDEN",
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost") ||
    !hostname.includes(".")
  ) {
    return {
      valid: false,
      reason: "SSRF_INTERNAL_HOST_BLOCKED",
    };
  }

  for (const pattern of PRIVATE_IPV4_PATTERNS) {
    if (pattern.test(hostname)) {
      return {
        valid: false,
        reason: "SSRF_PRIVATE_IP_BLOCKED",
      };
    }
  }

  if (hostname.includes(":")) {
    return {
      valid: false,
      reason: "SSRF_IPV6_LITERAL_BLOCKED",
    };
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
  };
}

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/gi,
  /system\s*prompt/gi,
  /you\s+are\s+now\s+in\s+developer\s+mode/gi,
  /reveal\s+(your\s+)?(api\s+key|secret|instructions)/gi,
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
];

export function sanitizeForAiPrompt(input: string, maxLength = 800): string {
  let cleaned = input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .trim();

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[REDACTED_INSTRUCTION]");
  }

  return cleaned.slice(0, maxLength);
}
