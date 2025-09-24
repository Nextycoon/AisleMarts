import React, { useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { Ring } from './Ring';
import type { Creator } from './types';

type Props = {
  creators: Creator[];
  viewedMap: Record<string, boolean>;
  onPressCreator: (creator: Creator, index: number) => void;
};

export const VirtualizedRings: React.FC<Props> = ({ creators, viewedMap, onPressCreator }) => {
  const data = creators;
  const renderItem = ({ item, index }: { item: Creator; index: number }) => (
    <Ring creator={item} index={index} viewed={!!viewedMap[item.id]} onPress={() => onPressCreator(item, index)} />
  );
  const keyExtractor = (item: Creator) => item.id;

  return (
    <View testID="story-tray">
      <FlatList
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews
        initialNumToRender={12}
        maxToRenderPerBatch={16}
        windowSize={5}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
