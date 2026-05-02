import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ---------------------------------------------------------------------------
// Root stack — Auth / Main / all detail screens
// ---------------------------------------------------------------------------
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Detail screens pushable from any tab
  EventDetail: { eventId: string };
  NewsDetail: { newsId: string };
  ChatDetail: { chatId: string };
  PlaceDetail: { placeId: string };
  RealEstateDetail: { realEstateId: string };
  ServiceDetail: { serviceId: string };
  TripDetail: { tripId: string };
  SponsorDetail: { sponsorId: string };
  UserProfile: { userId: string };
  GlobalChat: undefined;
  SubmitPlace: undefined;
  SubmitRealEstate: undefined;
  BusinessPartnership: undefined;
  MyEvents: undefined;
  GmAdmin: undefined;
  Settings: undefined;
  Qaas: undefined;
};

// ---------------------------------------------------------------------------
// Bottom-tab param list
// ---------------------------------------------------------------------------
export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Explore: undefined;
  Chats: undefined;
  Profile: undefined;
};

// ---------------------------------------------------------------------------
// Screen-prop helpers
// ---------------------------------------------------------------------------

/** Props for screens directly in the RootStack */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/** Props for screens inside a tab that may also navigate to RootStack screens */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// React Navigation global type registration
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
