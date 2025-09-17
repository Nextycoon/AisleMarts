// src/state/user.ts
import { create } from 'zustand';
import type { Role, Tier } from '../theme/tokens';

type State = {
  name: string;
  role: Role;
  tier: Tier;
  setName: (v: string) => void;
  setRole: (r: Role) => void;
  setTier: (t: Tier) => void;
};

export const useUser = create<State>((set) => ({
  name: 'Alex',
  role: 'hybrid',
  tier: 'premium',
  setName: (name) => set({ name }),
  setRole: (role) => set({ role }),
  setTier: (tier) => set({ tier })
}));