const c=require('crypto');
const [ts,body,secret]=process.argv.slice(2);
if (!secret) {
  console.error("HMAC_SECRET required");
  process.exit(1);
}
process.stdout.write(c.createHmac('sha256',secret).update(`${ts}.${body}`).digest('hex'));
