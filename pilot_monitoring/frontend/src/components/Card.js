export default function Card({title, children}){
  return (<div style={{background:'#0b1220', border:'1px solid #17223a', borderRadius:12, padding:16, color:'#e6edf3'}}>
    <div style={{fontWeight:800, marginBottom:8}}>{title}</div>{children}
  </div>);
}