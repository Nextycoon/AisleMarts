// lib/api.ts
const BASE = "http://localhost:8000"; // Update with your API URL
async function j(r: Response){ if(!r.ok) throw new Error(await r.text()); return r.json(); }

export const api = {
  health: () => fetch(`${BASE}/health`).then(j),
  collections: () => fetch(`${BASE}/products/collections`).then(j),
  search: (q:string,badge?:string) =>
    fetch(`${BASE}/products/search?q=${encodeURIComponent(q)}${badge?`&badge=${badge}`:""}`).then(j),
  recs: (mood:string, opts?:{brand?:string;max_price?:number;user_id?:string}) => {
    const p = new URLSearchParams();
    if(mood) p.set("mood", mood);
    if(opts?.brand) p.set("brand", opts.brand);
    if(typeof opts?.max_price==="number") p.set("max_price", String(opts.max_price));
    if(opts?.user_id) p.set("user_id", opts.user_id);
    return fetch(`${BASE}/ai/recommend?${p}`).then(j);
  },
  cart: {
    get: (userId:string)=> fetch(`${BASE}/cart?user_id=${userId}`).then(j),
    add: (userId:string,pid:string,qty=1)=> fetch(`${BASE}/cart/add?user_id=${userId}&pid=${pid}&qty=${qty}`,{method:"POST"}).then(j),
    remove: (userId:string,pid:string)=> fetch(`${BASE}/cart/remove?user_id=${userId}&pid=${pid}`,{method:"DELETE"}).then(j),
    clear: (userId:string)=> fetch(`${BASE}/cart/clear?user_id=${userId}`,{method:"POST"}).then(j),
    preview: (userId:string)=> fetch(`${BASE}/cart/checkout/preview?user_id=${userId}`,{method:"POST"}).then(j),
    confirm: (userId:string)=> fetch(`${BASE}/cart/checkout/confirm?user_id=${userId}`,{method:"POST"}).then(j),
  }
};