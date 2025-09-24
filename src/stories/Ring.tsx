import React from 'react';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import type { Creator } from './types';

type Props = {
  creator: Creator;
  index: number;
  viewed: boolean;
  onPress: () => void;
};

function badgeColor(tier: Creator['tier']) {
  switch (tier) {
    case 'gold': return '#D4AF37';
    case 'blue': return '#3B82F6';
    case 'grey': return '#9CA3AF';
    default: return '#6B7280';
  }
}

export const Ring: React.FC<Props> = ({ creator, index, viewed, onPress }) => {
  return (
    <TouchableOpacity testID={`creator-ring-${index}`} onPress={onPress} style={s.wrap}>
      <View style={[s.ring, { borderColor: viewed ? '#9CA3AF' : badgeColor(creator.tier) }]}>
        <Image source={{ uri: creator.avatarUrl || 'https://picsum.photos/seed/' + creator.id + '/100/100' }} style={s.avatar} />
      </View>
      <View style={s.row}>
        <View style={[s.badge, { backgroundColor: badgeColor(creator.tier) }]} />
        <Text numberOfLines={1} style={s.name}>{creator.displayName}</Text>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  wrap: { width: 84, alignItems: 'center', marginHorizontal: 8 },
  ring: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 58, height: 58, borderRadius: 29 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badge: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  name: { fontSize: 12, color: '#fff', maxWidth: 76 }
});
