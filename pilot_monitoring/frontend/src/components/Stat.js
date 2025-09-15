export default function Stat({label, value, sub}){
  return (<div style={{display:'flex', flexDirection:'column', marginRight:24, marginBottom:12}}>
    <div style={{color:'#8aa0b3', fontSize:12}}>{label}</div>
    <div style={{fontWeight:800, fontSize:22}}>{value}</div>
    {sub ? <div style={{color:'#65a4ff', fontSize:12}}>{sub}</div> : null}
  </div>);
}