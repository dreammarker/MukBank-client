import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IntroScreen({
  navigation,
  isLogin,
  authCheck,
  userInfo
}) {
  // isLogin이 false면 Login으로 넘어가기 아닐시 hateFoods로 넘어가기
  if (authCheck === true && isLogin === false) {
    setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
  } else if (authCheck === true && isLogin === true) {
    setTimeout(() => {
      navigation.replace('SelectFoodOrCafe');
    }, 2000);
  }

  // else {
  //   setTimeout(() => {
  //     navigation.replace('HateFoods');
  //   }, 2000);
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.size}>MukBank</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  size: {
    fontSize: 40,
    fontWeight: 'bold'
  }
});
