export type Tier = 'gold' | 'blue' | 'grey' | 'unverified';
export type Creator = { id:string; displayName:string; tier:Tier; avatarUrl?:string; popularity?:number };
export type StoryType = 'moment' | 'product' | 'bts';
export type Story = { id:string; creatorId:string; type:StoryType; mediaUrl:string; productId?:string; expiresAt:number };
