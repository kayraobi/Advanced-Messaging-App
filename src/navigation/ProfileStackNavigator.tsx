import React from 'react';
import { NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyEventsScreen from '../screens/MyEventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FAQScreen from '../screens/FAQScreen';
import RootScreenLayout from './RootScreenLayout';
import {
  ProfileNavProps,
  ProfileStackParamList,
  RootStackParamList,
} from './types';

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileMainRoute = ({
  navigation,
  onLogout,
}: ProfileNavProps<'ProfileMain'> & { onLogout: () => void }) => (
  <RootScreenLayout showHeader>
    <ProfileScreen
      onMyEvents={() => navigation.navigate('MyEvents')}
      onSettings={() => navigation.navigate('Settings')}
      onFAQ={() => navigation.navigate('FAQ')}
      onLogout={onLogout}
    />
  </RootScreenLayout>
);

const MyEventsRoute = ({ navigation }: ProfileNavProps<'MyEvents'>) => {
  const rootNavigation =
    navigation.getParent<NavigationProp<RootStackParamList>>();

  return (
    <RootScreenLayout>
      <MyEventsScreen
        onBack={() => navigation.goBack()}
        onEventPress={(eventId) =>
          rootNavigation?.navigate('EventDetail', { eventId })
        }
      />
    </RootScreenLayout>
  );
};

const SettingsRoute = ({ navigation }: ProfileNavProps<'Settings'>) => (
  <RootScreenLayout>
    <SettingsScreen onBack={() => navigation.goBack()} />
  </RootScreenLayout>
);

const FAQRoute = ({ navigation }: ProfileNavProps<'FAQ'>) => (
  <RootScreenLayout>
    <FAQScreen onBack={() => navigation.goBack()} />
  </RootScreenLayout>
);

export default function ProfileStackNavigator({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain">
        {(props) => <ProfileMainRoute {...props} onLogout={onLogout} />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="MyEvents" component={MyEventsRoute} />
      <ProfileStack.Screen name="Settings" component={SettingsRoute} />
      <ProfileStack.Screen name="FAQ" component={FAQRoute} />
    </ProfileStack.Navigator>
  );
}
