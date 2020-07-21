import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { ApiErrorState } from '@covid/core/api/ApiServiceErrors';
import { ScreenParamList } from '@covid/features/ScreenParamList';

import { Loading } from '../Loading';
import { NewProfileCard } from '../NewProfileCard';

export type Profile = {
  id: string;
  name?: string;
  avatar_name?: string;
  reported_by_another?: boolean;
  report_count?: number;
  last_reported_at?: Date;
  created_at?: Date;
};

interface Props extends ApiErrorState {
  profiles: Profile[];
  isLoaded: boolean;
  addProfile?: VoidFunction;
  onProfileSelected: (profile: string, index: number) => void;
  navigation: DrawerNavigationProp<ScreenParamList, 'SelectProfile'>;
  renderItem: (profile: Profile, index: number) => React.ReactNode;
  renderCreateItem?: () => React.ReactNode;
}

export const ProfileList: React.FC<Props> = ({
  status,
  error,
  isLoaded,
  profiles,
  addProfile,
  onProfileSelected,
  onRetry,
  renderItem,
  renderCreateItem = () => <NewProfileCard />,
}) => {
  if (!isLoaded) {
    return <Loading status={status} error={error} style={{ borderColor: 'green', borderWidth: 1 }} onRetry={onRetry} />;
  }
  const opacity = { start: 0, end: 1 };
  const positionY = { start: 75, end: 0 };

  const fadeAnimations = profiles
    .map((o) => o.id)
    .concat(['add profile'])
    .map(() => useRef(new Animated.Value(opacity.start)).current);
  const animations = profiles
    .map((o) => o.id)
    .concat(['add profile'])
    .map(() => useRef(new Animated.Value(positionY.start)).current);

  useEffect(() => {
    const run = (fn: any, index: number, final: number) => {
      const duration = 220;
      const delay = index * 40 + 150;
      Animated.timing(fn, {
        toValue: final,
        duration,
        delay,
        easing: Easing.inOut(Easing.cubic),
      }).start();
    };
    fadeAnimations.forEach((item, index) => run(item, index, opacity.end));
    animations.forEach((item, index) => run(item, index, positionY.end));
  }, [fadeAnimations, animations]);

  return (
    <View style={styles.profileList}>
      {profiles.map((profile, i) => {
        return (
          <View style={styles.cardContainer} key={profile.id}>
            <Animated.View
              style={{
                opacity: fadeAnimations[i],
                transform: [{ translateY: animations[i] }],
              }}>
              <TouchableOpacity onPress={() => onProfileSelected(profile.id, i)}>
                {renderItem(profile, i)}
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      })}
      {addProfile && (
        <View style={styles.cardContainer} key="new">
          <Animated.View
            style={{
              opacity: fadeAnimations[profiles.length],
              transform: [{ translateY: animations[profiles.length] }],
            }}>
            <TouchableOpacity onPress={addProfile}>{renderCreateItem()}</TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    width: '100%',
    alignContent: 'stretch',
  },

  cardContainer: {
    width: '45%',
    marginHorizontal: 8,
    marginVertical: 4,
  },
});
