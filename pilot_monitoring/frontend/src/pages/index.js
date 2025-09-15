import React, {useEffect, useState} from 'react';
import {fetchJSON} from '../utils/api';
import Card from '../components/Card';
import Stat from '../components/Stat';
import TrendTable from '../components/TrendTable';

export default function Dashboard(){
  const [orders, setOrders] = useState(null);
  const [mpesa, setMpesa] = useState(null);
  const [comm, setComm] = useState(null);
  const [err, setErr] = useState(null);

  const load = async()=>{
    try{
      const [o, m, c] = await Promise.all([
        fetchJSON('/admin/metrics/orders'),
        fetchJSON('/admin/metrics/mpesa'),
        fetchJSON('/admin/metrics/commissions')
      ]);
      setOrders(o); setMpesa(m); setComm(c);
    }catch(e){ setErr(e.message); }
  };

  useEffect(()=>{ load(); const t=setInterval(load, 15000); return ()=>clearInterval(t); }, []);

  return (
    <div style={{minHeight:'100vh', background:'#050a17', padding:16}}>
      <div style={{color:'#e6edf3', fontWeight:900, fontSize:22, marginBottom:8}}>AisleMarts — Pilot Command (Kenya)</div>
      <div style={{color:'#8aa0b3', marginBottom:16}}>Real-time orders, M-Pesa health, and 1% commission — refreshed every 15s</div>
      {err ? <div style={{color:'#fca5a5', marginBottom:12}}>Error: {err}</div> : null}

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:16}}>
        <Card title="📦 Orders Overview (30d)">
          {!orders ? 'Loading...' : (
            <div>
              <div style={{display:'flex', flexWrap:'wrap'}}>
                <Stat label="Total Orders" value={orders.orders} />
                <Stat label="Gross (KES)" value={Math.round(orders.gross)} />
                <Stat label="AOV (KES)" value={Math.round(orders.aov)} />
              </div>
              <div style={{display:'flex', gap:12, marginTop:8, flexWrap:'wrap'}}>
                {Object.entries(orders.status || {}).map(([k,v])=> <Stat key={k} label={k} value={v} />)}
              </div>
              <div style={{marginTop:10}}>
                <TrendTable columns={[{key:'t',title:'Date'},{key:'orders',title:'Orders'},{key:'gross',title:'Gross (KES)'}]}
                            rows={(orders.trend||[])} />
              </div>
            </div>
          )}
        </Card>

        <Card title="💸 M-Pesa STK Health (30d)">
          {!mpesa ? 'Loading...' : (
            <div>
              <div style={{display:'flex', flexWrap:'wrap'}}>
                <Stat label="Success Rate" value={mpesa.successRate.toFixed(1)+'%'} />
                <Stat label="Success" value={mpesa.success} />
                <Stat label="Fail" value={mpesa.fail} />
                <Stat label="Volume (KES)" value={Math.round(mpesa.amount)} />
                <Stat label="Avg Latency" value={Math.round(mpesa.avgLatencyMs)+' ms'} />
              </div>
              <div style={{marginTop:10}}>
                <TrendTable columns={[{key:'t',title:'Date'},{key:'success',title:'Success'},{key:'fail',title:'Fail'},{key:'amount',title:'KES'}]}
                            rows={(mpesa.trend||[])} />
              </div>
            </div>
          )}
        </Card>

        <Card title="🏦 Commission Tracker (1%)">
          {!comm ? 'Loading...' : (
            <div>
              <div style={{display:'flex', flexWrap:'wrap'}}>
                <Stat label="Gross (KES)" value={Math.round(comm.gross)} />
                <Stat label="Commission (1%)" value={comm.commission.toFixed(2)} />
                <Stat label="Net Payout" value={Math.round(comm.net)} />
                <Stat label="Orders" value={comm.orders} />
                <Stat label="AOV (KES)" value={Math.round(comm.aov)} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
