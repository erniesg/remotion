import type { Highlight } from "./schema";

export type Segment = {
  text: string;
  /** Index into the highlights array, or null for plain text */
  highlightIndex: number | null;
};

/**
 * Split article body into plain text and highlighted segments.
 * Matches each highlight phrase (case-insensitive) in order of appearance.
 * Non-overlapping: first match wins.
 */
export function buildSegments(
  body: string,
  highlights: Highlight[],
): Segment[] {
  if (highlights.length === 0) {
    return [{ text: body, highlightIndex: null }];
  }

  // Build a list of all match positions
  type Match = { start: number; end: number; highlightIndex: number };
  const matches: Match[] = [];
  const bodyLower = body.toLowerCase();

  for (let i = 0; i < highlights.length; i++) {
    const phrase = highlights[i].phrase.toLowerCase();
    const idx = bodyLower.indexOf(phrase);
    if (idx !== -1) {
      matches.push({ start: idx, end: idx + highlights[i].phrase.length, highlightIndex: i });
    }
  }

  // Sort by position, resolve overlaps (first match wins)
  matches.sort((a, b) => a.start - b.start);
  const filtered: Match[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  // Build segments
  const segments: Segment[] = [];
  let cursor = 0;
  for (const m of filtered) {
    if (m.start > cursor) {
      segments.push({ text: body.slice(cursor, m.start), highlightIndex: null });
    }
    segments.push({
      text: body.slice(m.start, m.end),
      highlightIndex: m.highlightIndex,
    });
    cursor = m.end;
  }
  if (cursor < body.length) {
    segments.push({ text: body.slice(cursor), highlightIndex: null });
  }

  return segments;
}
