export default function TrendTable({rows, columns}){
  return (<table style={{width:'100%', color:'#b8c2cc', fontSize:13}}>
    <thead><tr>{columns.map(c=> <th key={c.key} style={{textAlign:'left', padding:'6px 8px', color:'#8aa0b3'}}>{c.title}</th>)}</tr></thead>
    <tbody>{rows.map((r,i)=>(<tr key={i}>{columns.map(c=> <td key={c.key} style={{padding:'6px 8px', borderTop:'1px solid #17223a'}}>{r[c.key]}</td>)}</tr>))}</tbody>
  </table>);
}