/**
 * Turns whatever the Gemini SDK throws into something a homeowner can act on.
 *
 * The SDK rejects with the raw upstream body attached to `message`, e.g.
 *   {"error":{"code":402,"message":"Your prepayment credits are depleted..."}}
 * Putting that on screen tells the customer nothing and looks broken, so every
 * failure is mapped to plain language plus the phone number.
 */

const PHONE = '610-948-5207';

/** Fallback used whenever we can't say anything more specific. */
const GENERIC = `The visualizer is having trouble right now. Give us a call at ${PHONE} and we'll walk you through your options.`;

type Parsed = { code: number | null; text: string };

function parse(e: unknown): Parsed {
  const raw =
    e instanceof Error ? e.message : typeof e === 'string' ? e : JSON.stringify(e ?? '');

  // The SDK sometimes embeds the JSON body inside a longer string.
  const brace = raw.indexOf('{');
  if (brace !== -1) {
    try {
      const body = JSON.parse(raw.slice(brace));
      const err = body?.error ?? body;
      const code = typeof err?.code === 'number' ? err.code : null;
      return { code, text: String(err?.message ?? raw) };
    } catch {
      /* not JSON after all - fall through */
    }
  }

  const m = raw.match(/\b(400|401|402|403|404|429|500|502|503|504)\b/);
  return { code: m ? Number(m[1]) : null, text: raw };
}

export function friendlyError(e: unknown): string {
  const { code, text } = parse(e);
  const t = text.toLowerCase();

  // Problems the homeowner caused and can fix themselves.
  if (/mime type|too small to be a valid image|exceeds 20mb|missing imagebase64/.test(t)) {
    return 'That photo could not be read. Try a JPG or PNG under 20MB, taken from the street so the whole house is visible.';
  }
  if (/not a residential|no house|isresidentialhouse/.test(t)) {
    return "We couldn't find a house in that photo. Try a straight-on shot of the front of the home.";
  }
  if (/safety|blocked|prohibited/.test(t)) {
    return 'That photo was rejected by the image service. Try a different picture of the home.';
  }

  // Our problem, not theirs. Never expose billing or key details to a customer.
  if (code === 402 || /credit|billing|quota|insufficient|payment/.test(t)) {
    return `The visualizer is temporarily offline for maintenance. Call us at ${PHONE} and we'll put together your estimate by hand — same day.`;
  }
  if (code === 401 || code === 403 || /api key|permission|unauthorized|forbidden/.test(t)) {
    return `The visualizer is temporarily offline for maintenance. Call us at ${PHONE} and we'll get you taken care of.`;
  }
  if (code === 429 || /rate limit|too many requests|resource[- ]exhausted/.test(t)) {
    return `The visualizer is busy right now. Give it a minute and try again, or call us at ${PHONE}.`;
  }
  if ((code !== null && code >= 500) || /unavailable|timeout|timed out|network|failed to fetch/.test(t)) {
    return `We couldn't reach the image service just now. Try again in a moment, or call us at ${PHONE}.`;
  }

  return GENERIC;
}

/**
 * Full detail for the browser console so the real cause stays debuggable
 * even though the customer never sees it.
 */
export function logError(context: string, e: unknown): void {
  // eslint-disable-next-line no-console
  console.error(`[envision] ${context}:`, e);
}
