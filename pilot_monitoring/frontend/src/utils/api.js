export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
export async function fetchJSON(path){
  const res = await fetch(`${API_BASE}${path}`);
  if(!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}
