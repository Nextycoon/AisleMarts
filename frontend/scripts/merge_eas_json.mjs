import fs from 'fs';const dst='eas.json',add='patches/eas.json.add.json';
const addObj=JSON.parse(fs.readFileSync(add,'utf8'));let base={};if(fs.existsSync(dst))base=JSON.parse(fs.readFileSync(dst,'utf8'));
base.build={...(base.build||{}),...(addObj.build||{})};base.submit={...(base.submit||{}),...(addObj.submit||{})};
fs.writeFileSync(dst,JSON.stringify(base,null,2));console.log('✓ eas.json merged');
