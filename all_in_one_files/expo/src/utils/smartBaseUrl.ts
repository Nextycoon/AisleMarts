import { Platform } from 'react-native';
const CANDIDATES = [ process.env.EXPO_PUBLIC_API_URL, 'https://YOUR-RAILWAY.up.railway.app', 'http://10.0.2.2:3000' ];
async function ok(u?:string){ if(!u) return false; try{ const r=await fetch(u.replace(/\/$/,'')+'/health'); return r.ok;}catch{ return false;} }
let memo: string | null = null;
export async function getApiBaseUrl(){ if(memo) return memo; for(const u of CANDIDATES){ if(!u) continue; if(Platform.OS==='android'&&u.startsWith('http://')) continue; if(await ok(u)){ memo=u; break; } } if(!memo) throw new Error('No healthy API'); return memo; }
