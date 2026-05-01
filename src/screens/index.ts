/**
 * Merkezi ekran lazy-loading kaydı.
 * Tüm ekranlar burada tanımlanır; App.tsx ve diğer dosyalar
 * doğrudan dosya yolunu değil, bu modülü import eder.
 *
 * SplashScreen ve AuthScreen uygulama açılışında hemen gerekli
 * olduğundan statik import olarak kalır.
 */
import { lazy } from 'react';

export { default as SplashScreen } from './SplashScreen';
export { default as AuthScreen }   from './AuthScreen';

export const HomeScreen             = lazy(() => import('./HomeScreen'));
export const CalendarScreen         = lazy(() => import('./CalendarScreen'));
export const ExploreScreen          = lazy(() => import('./ExploreScreen'));
export const ChatsScreen            = lazy(() => import('./ChatsScreen'));
export const ChatDetailScreen       = lazy(() => import('./ChatDetailScreen'));
export const GlobalChatScreen       = lazy(() => import('./GlobalChatScreen'));
export const EventDetailScreen      = lazy(() => import('./EventDetailScreen'));
export const NewsDetailScreen       = lazy(() => import('./NewsDetailScreen'));
export const PlaceDetailScreen      = lazy(() => import('./PlaceDetailScreen'));
export const RealEstateDetailScreen = lazy(() => import('./RealEstateDetailScreen'));
export const ServiceDetailScreen    = lazy(() => import('./ServiceDetailScreen'));
export const TripDetailScreen       = lazy(() => import('./TripDetailScreen'));
export const ProfileScreen          = lazy(() => import('./ProfileScreen'));
export const SettingsScreen         = lazy(() => import('./SettingsScreen'));
export const MyEventsScreen         = lazy(() => import('./MyEventsScreen'));
export const QaasScreen             = lazy(() => import('./QaasScreen'));
export const UserProfileScreen      = lazy(() => import('./UserProfileScreen'));
export const SubmitPlaceScreen      = lazy(() => import('./SubmitPlaceScreen'));
export const SubmitRealEstateScreen = lazy(() => import('./SubmitRealEstateScreen'));
export const SponsorDetailScreen = lazy(() => import('./SponsorDetailScreen'));
export const BusinessPartnershipScreen = lazy(() => import('./BusinessPartnershipScreen'));
export const GmAdminScreen = lazy(() => import('./GmAdminScreen'));
