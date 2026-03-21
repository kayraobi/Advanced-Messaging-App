import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  EventDetail: { eventId: string };
  ChatDetail: { chatId: string };
  GlobalChat: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  MyEvents: undefined;
  Settings: undefined;
  FAQ: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Chats: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type RootNavProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type ProfileNavProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;
