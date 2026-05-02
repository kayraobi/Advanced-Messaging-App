/**
 * Merkezi ekran kaydı.
 * Tüm ekranlar burada tanımlanır; navigasyon ve diğer dosyalar
 * doğrudan dosya yolunu değil, bu modülü import eder.
 *
 * Not: lazy() kaldırıldı — React Navigation native stack, lazy React
 * bileşenleriyle uyumlu değil. Navigator zaten ekranları lazy olarak yükler.
 */

export { default as SplashScreen } from './SplashScreen';
export { default as AuthScreen } from './AuthScreen';
export { default as HomeScreen } from './HomeScreen';
export { default as CalendarScreen } from './CalendarScreen';
export { default as ExploreScreen } from './ExploreScreen';
export { default as ChatsScreen } from './ChatsScreen';
export { default as ChatDetailScreen } from './ChatDetailScreen';
export { default as GlobalChatScreen } from './GlobalChatScreen';
export { default as EventDetailScreen } from './EventDetailScreen';
export { default as NewsDetailScreen } from './NewsDetailScreen';
export { default as PlaceDetailScreen } from './PlaceDetailScreen';
export { default as RealEstateDetailScreen } from './RealEstateDetailScreen';
export { default as ServiceDetailScreen } from './ServiceDetailScreen';
export { default as TripDetailScreen } from './TripDetailScreen';
export { default as ProfileScreen } from './ProfileScreen';
export { default as SettingsScreen } from './SettingsScreen';
export { default as MyEventsScreen } from './MyEventsScreen';
export { default as QaasScreen } from './QaasScreen';
export { default as UserProfileScreen } from './UserProfileScreen';
export { default as SubmitPlaceScreen } from './SubmitPlaceScreen';
export { default as SubmitRealEstateScreen } from './SubmitRealEstateScreen';
export { default as SponsorDetailScreen } from './SponsorDetailScreen';
export { default as BusinessPartnershipScreen } from './BusinessPartnershipScreen';
export { default as GmAdminScreen } from './GmAdminScreen';
