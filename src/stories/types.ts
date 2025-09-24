export type Tier = 'gold' | 'blue' | 'grey' | 'unverified';

export type Creator = {
  id: string;
  displayName: string;
  tier: Tier;
  avatarUrl?: string;
  popularity?: number; // 0..1
};

export type StoryType = 'moment' | 'product' | 'bts';

export type Story = {
  id: string;
  creatorId: string;
  type: StoryType;
  mediaUrl: string;
  productId?: string;
  expiresAt: number; // epoch ms
};

export type Paged<T> = {
  data: T[];
  cursor?: string | null;
};
