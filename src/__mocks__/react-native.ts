import { jest } from '@jest/globals';

export const Platform = { OS: 'ios', select: jest.fn((obj: Record<string, unknown>) => obj.ios ?? obj.default) };
export const Alert = { alert: jest.fn() };
export const Animated = {
  Value: jest.fn().mockImplementation((v: number) => ({ _value: v })),
  timing: jest.fn().mockReturnValue({ start: jest.fn() }),
  sequence: jest.fn().mockReturnValue({ start: jest.fn() }),
  View: 'Animated.View',
};
export const StyleSheet = {
  create: jest.fn((styles: unknown) => styles),
  absoluteFillObject: {},
  flatten: jest.fn((s: unknown) => s),
};
export const View = 'View';
export const Text = 'Text';
export const TouchableOpacity = 'TouchableOpacity';
export const ScrollView = 'ScrollView';
export const TextInput = 'TextInput';
export const Image = 'Image';
export const FlatList = 'FlatList';
export const Modal = 'Modal';
export const ActivityIndicator = 'ActivityIndicator';
export const PanResponder = { create: jest.fn().mockReturnValue({ panHandlers: {} }) };
export const Keyboard = { dismiss: jest.fn() };
export const Linking = { openURL: jest.fn() };
export const Dimensions = { get: jest.fn().mockReturnValue({ width: 390, height: 844 }) };
export const KeyboardAvoidingView = 'KeyboardAvoidingView';
