import { StyleSheet, Text } from 'react-native';

import { POST_TAGS, PostTag } from '@/services/api';

export function PostTagBadge({ tag }: { tag: PostTag }) {
  const info = POST_TAGS.find((t) => t.id === tag);
  return <Text style={[styles.badge, { backgroundColor: info?.color ?? '#6b7f66' }]}>{info?.label ?? tag}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
