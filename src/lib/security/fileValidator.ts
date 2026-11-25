/**
 * BANK RECEIPT (DEKONT) & UPLOAD FILE SECURITY VALIDATOR
 * Enforces strict MIME type (PDF, JPG, PNG), max file size (5 MB),
 * magic-byte signature validation, and embedded script / XSS payload detection.
 */

export const ALLOWED_RECEIPT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type AllowedReceiptMimeType = (typeof ALLOWED_RECEIPT_MIME_TYPES)[number];

export const MAX_RECEIPT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface FileValidationInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  headerBytes: Uint8Array;
}

export interface FileValidationResult {
  valid: boolean;
  reason?: string;
  sanitizedFileName?: string;
}

function startsWithBytes(source: Uint8Array, signature: number[]): boolean {
  if (source.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (source[i] !== signature[i]) return false;
  }
  return true;
}

export function validateReceiptUpload(
  input: FileValidationInput
): FileValidationResult {
  if (input.sizeBytes <= 0) {
    return { valid: false, reason: "EMPTY_FILE" };
  }

  if (input.sizeBytes > MAX_RECEIPT_FILE_SIZE_BYTES) {
    return { valid: false, reason: "FILE_TOO_LARGE_MAX_5MB" };
  }

  if (
    !ALLOWED_RECEIPT_MIME_TYPES.includes(
      input.mimeType as AllowedReceiptMimeType
    )
  ) {
    return { valid: false, reason: "UNSUPPORTED_MIME_TYPE" };
  }

  const lowerName = input.fileName.toLowerCase().trim();
  const validExtension =
    (input.mimeType === "application/pdf" && lowerName.endsWith(".pdf")) ||
    (input.mimeType === "image/jpeg" &&
      (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg"))) ||
    (input.mimeType === "image/png" && lowerName.endsWith(".png"));

  if (!validExtension) {
    return { valid: false, reason: "MIME_EXTENSION_MISMATCH" };
  }

  // Magic-byte signature checks
  const isPdfHeader = startsWithBytes(input.headerBytes, [0x25, 0x50, 0x44, 0x46]); // %PDF
  const isJpegHeader = startsWithBytes(input.headerBytes, [0xff, 0xd8, 0xff]); // JPEG SOI
  const isPngHeader = startsWithBytes(
    input.headerBytes,
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  ); // PNG

  if (input.mimeType === "application/pdf" && !isPdfHeader) {
    return { valid: false, reason: "INVALID_PDF_MAGIC_BYTES" };
  }
  if (input.mimeType === "image/jpeg" && !isJpegHeader) {
    return { valid: false, reason: "INVALID_JPEG_MAGIC_BYTES" };
  }
  if (input.mimeType === "image/png" && !isPngHeader) {
    return { valid: false, reason: "INVALID_PNG_MAGIC_BYTES" };
  }

  // Scan initial bytes for embedded XSS / active PDF JavaScript payloads
  const textSample = new TextDecoder("utf-8", { fatal: false })
    .decode(input.headerBytes.slice(0, 4096))
    .toLowerCase();

  if (
    textSample.includes("<script") ||
    textSample.includes("javascript:") ||
    textSample.includes("/javascript") ||
    textSample.includes("/js ") ||
    textSample.includes("onload=") ||
    textSample.includes("onerror=")
  ) {
    return { valid: false, reason: "MALICIOUS_ACTIVE_CONTENT_DETECTED" };
  }

  const sanitizedFileName = input.fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".");

  return {
    valid: true,
    sanitizedFileName,
  };
}
