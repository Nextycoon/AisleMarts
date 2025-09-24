import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const creators = [
  {id:'mira.moda',displayName:'Mira Moda',tier:'blue',commissionPct:0.10,popularity:0.7},
  {id:'techtarek',displayName:'Tech Tarek',tier:'gold',commissionPct:0.12,popularity:0.9},
  {id:'linafit',displayName:'Lina Fit',tier:'blue',commissionPct:0.08,popularity:0.65},
  {id:'chefzey',displayName:'Chef Zey',tier:'unverified',commissionPct:0.05,popularity:0.4},
  {id:'nomadnour',displayName:'Nomad Nour',tier:'grey',commissionPct:0.06,popularity:0.5},
  {id:'beautyberil',displayName:'Beauty Beril',tier:'blue',commissionPct:0.09,popularity:0.6},
  {id:'fixwithfaris',displayName:'Fix with Faris',tier:'grey',commissionPct:0.07,popularity:0.45},
  {id:'greenayla',displayName:'Green Ayla',tier:'blue',commissionPct:0.08,popularity:0.55},
  {id:'gamerkaan',displayName:'Gamer Kaan',tier:'grey',commissionPct:0.06,popularity:0.52},
  {id:'styleelif',displayName:'Style Elif',tier:'gold',commissionPct:0.13,popularity:0.88},
  {id:'soundcem',displayName:'Sound Cem',tier:'blue',commissionPct:0.10,popularity:0.58},
  {id:'runwithdeniz',displayName:'Run with Deniz',tier:'grey',commissionPct:0.07,popularity:0.49}
];
const products = [
  {id:'yoga-mat',title:'Pro Yoga Mat',price:49.9,currency:'USD',imageUrl:'https://picsum.photos/seed/yogamat/600/800'},
  {id:'silk-scarf',title:'Silk Scarf',price:89.0,currency:'USD',imageUrl:'https://picsum.photos/seed/scarf/600/800'},
  {id:'buds-x',title:'Buds X',price:129.0,currency:'USD',imageUrl:'https://picsum.photos/seed/buds/600/800'}
];
const media = [
  'https://picsum.photos/seed/a/720/1280',
  'https://picsum.photos/seed/b/720/1280',
  'https://picsum.photos/seed/c/720/1280',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4'
];
function rand(a){ return a[Math.floor(Math.random()*a.length)]; }

async function main(){
  console.log('Seeding…');
  await prisma.storyCTA.deleteMany();
  await prisma.storyImpression.deleteMany();
  await prisma.story.deleteMany();
  await prisma.creatorProduct.deleteMany();
  await prisma.affiliateContract.deleteMany();
  await prisma.product.deleteMany();
  await prisma.creator.deleteMany();

  await prisma.product.createMany({ data: products });
  await prisma.creator.createMany({ data: creators });

  const now = Date.now();
  for (const c of creators) {
    for (let i=0;i<4;i++) {
      const type = ['moment','bts','product'][i%3];
      const productId = type==='product' ? rand(products).id : null;
      await prisma.story.create({
        data: { id:`${c.id}-s${i+1}`, creatorId:c.id, type, mediaUrl: rand(media),
                productId, expiresAt: new Date(now + 23*3600*1000) }
      });
    }
  }
  console.log('Seed complete.');
}
main().finally(()=>prisma.$disconnect());
