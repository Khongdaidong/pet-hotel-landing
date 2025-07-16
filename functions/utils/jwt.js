// functions/utils/jwt.js
// Simple HMAC-SHA256 JWT util for Cloudflare Workers

const ENC = new TextEncoder();
+ // Cloudflare injects secrets via env. We'll read from globalThis if present.
+ const SECRET = globalThis.JWT_SECRET || "dev-secret";

async function hmac(data) {
  const key = await crypto.subtle.importKey(
    "raw",
    ENC.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, ENC.encode(data));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function sign(payload, expMin = 30) {
  const head = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + expMin * 60_000 }));
  const raw  = `${head}.${body}`;
  return `${raw}.${await hmac(raw)}`;
}

export async function verify(token) {
  if (!token) return null;
  const [head, body, sig] = token.split(".");
  const valid = (await hmac(`${head}.${body}`)) === sig;
  if (!valid) return null;
  const data = JSON.parse(atob(body));
  return Date.now() < data.exp ? data : null;
}
