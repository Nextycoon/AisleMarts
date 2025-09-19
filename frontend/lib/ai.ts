export async function parseIntent(q: string) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ai/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q })
  });
  return await res.json();
}