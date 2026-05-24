import React from 'react';
import { View, Text, Image, StyleSheet, type ViewStyle } from 'react-native';

type Props = {
  displayUrl?: string;
  initials: string;
  size?: number;
  backgroundColor: string;
  textColor: string;
  style?: ViewStyle;
};

const ChatMessageAvatar = ({
  displayUrl,
  initials,
  size = 32,
  backgroundColor,
  textColor,
  style,
}: Props) => {
  const radius = size / 2;
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor,
        },
        style,
      ]}
    >
      {displayUrl ? (
        <Image source={{ uri: displayUrl }} style={{ width: size, height: size, borderRadius: radius }} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize: size * 0.32 }]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  text: { fontWeight: '700' },
});

export default ChatMessageAvatar;
