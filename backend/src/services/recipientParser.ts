import { parse } from "csv-parse/sync";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractCandidates(fileContent: string): string[] {
  const trimmed = fileContent.trim();
  if (!trimmed) return [];

  // Try CSV parsing first (handles multi-column files, picks any cell that looks like an email).
  try {
    const rows: string[][] = parse(trimmed, {
      relax_column_count: true,
      skip_empty_lines: true,
    });
    const candidates: string[] = [];
    for (const row of rows) {
      for (const cell of row) {
        candidates.push(cell.trim());
      }
    }
    if (candidates.length > 0) return candidates;
  } catch {
    // Fall through to plain-text splitting below.
  }

  return trimmed.split(/[\r\n,;]+/).map((s) => s.trim());
}

export interface ParsedRecipients {
  count: number;
  recipients: string[];
  invalidCount: number;
}

export function parseRecipientsFile(fileContent: string): ParsedRecipients {
  const candidates = extractCandidates(fileContent);
  const seen = new Set<string>();
  const valid: string[] = [];
  let invalidCount = 0;

  for (const candidate of candidates) {
    if (!candidate) continue;
    const email = candidate.toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      invalidCount += 1;
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    valid.push(email);
  }

  return { count: valid.length, recipients: valid, invalidCount };
}
