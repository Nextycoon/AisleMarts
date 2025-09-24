// src/lib/http.ts
export type HttpOptions = {
  method?: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
  headers?: Record<string,string>;
  body?: any;
  timeoutMs?: number;
  retries?: number;
  idemKey?: string;
};

const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export async function http(url:string, opts:HttpOptions = {}) {
  const {
    method='GET',
    headers={},
    body,
    timeoutMs=8000,
    retries=1,
    idemKey,
  } = opts;

  const controller = new AbortController();
  const t = setTimeout(()=>controller.abort(), timeoutMs);

  const finalHeaders: Record<string,string> = {
    'content-type': 'application/json',
    ...headers,
  };
  if (idemKey) finalHeaders['Idempotency-Key'] = idemKey;

  const request = () => fetch(url, {
    method,
    headers: finalHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
    signal: controller.signal,
  });

  let lastErr:any;
  for (let i=0; i<=retries; i++) {
    try {
      const res = await request();
      clearTimeout(t);
      if (!res.ok) return { ok:false, status:res.status, data: await safeJson(res) };
      return { ok:true, status:res.status, data: await safeJson(res) };
    } catch (e:any) {
      lastErr = e;
      if (i < retries) await sleep(250 * (i+1));
    }
  }
  return { ok:false, error:lastErr };
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}