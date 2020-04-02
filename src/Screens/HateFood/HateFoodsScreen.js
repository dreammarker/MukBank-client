import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import HateFoodsList from './HateFoodsList';
import { Col, Row, Grid } from 'react-native-easy-grid';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

// import { FlatList } from 'react-native-gesture-handler';
// import { fakeData } from './fakeData';

export default function HateFoodsScreen({ navigation, userInfo }) {
  const [foodCategory, setFoodCategory] = useState([]);
  const [hateList, setHateList] = useState({
    한식: false,
    일식: false,
    양식: false,
    남미음식: false,
    치킨: false,
    중식: false,
    술집: false,
    분식: false,
    동남아음식: false,
    인도음식: false,
    아시아음식: false,
    퓨전음식: false
  });

  async function getHateList() {
    try {
      const tokenStr = await AsyncStorage.getItem('jwt');
      const token = JSON.parse(tokenStr).jwt;
      const res = await axios('https://mukbank.xyz:5001/user/hatefoodSelect', {
        headers: { Authorization: `Bearer ${token}` }
      });
      //* res.data ==> Obj {"fd_category": "일식,중식"}
      //* fdArr ==> [일식, 중식]
      //* fdObj ==> {일식: true, 중식: true}
      const fdArr = res.data.fd_category.split(',');
      const fdObj = fdArr.reduce((acc, cur) => {
        acc[cur] = true;
        return acc;
      }, {});
      setHateList({ ...hateList, ...fdObj });
      // console.log('gethatelist  : ', fdObj);
    } catch (err) {
      console.log(err);
    }
  }

  async function postHateList() {
    // tokenStr = String {"jwt": "eyfDFE..."}
    try {
      // console.log('postHateList clik~!!!!');
      const tokenStr = await AsyncStorage.getItem('jwt');
      const token = JSON.parse(tokenStr).jwt;
      // console.log('token~~~', token);
      const res = await axios({
        method: 'post',
        url: 'https://mukbank.xyz:5001/user/hatefoodUpdate',
        headers: { Authorization: `Bearer ${token}` },
        data: {
          hatefd: hateList
        }
      });
      // console.log('hf res.data~~~', res.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    axios.get('https://mukbank.xyz:5001/restaurant/category').then(res => {
      // console.log(res.data, '51번째줄');
      setFoodCategory(res.data);
    });
    // axios.get('http://10.0.2.2:5001/hello').then(res => console.log(res.data));
    getHateList();
  }, []);
  // console.log(foodCategory, '53번째줄');

  return (
    <View style={{ backgroundColor: 'white' }}>
      <SafeAreaView>
        <ScrollView>
          <View>
            <Text
              style={[
                styles.titleText,
                { marginTop: '5%', marginBottom: '5%' }
              ]}
            >
              오늘은 별로..
            </Text>
          </View>
          <HateFoodsList
            foodCategory={foodCategory}
            hateList={hateList}
            setHateList={setHateList}
          />
          <View style={{ marginTop: '5%', marginBottom: '5%' }}>
            <Grid>
              <Col size={3} />
              <Col size={2.4}>
                <Button
                  raised
                  title="선택 완료"
                  style={styles.completeBtn}
                  titleStyle={{
                    fontFamily: 'NanumGothic-Bold',
                    color: 'black',
                    fontSize: 23
                  }}
                  containerStyle={{ height: 77 }}
                  buttonStyle={{
                    height: '100%',
                    backgroundColor: '#feee7d',
                    borderRadius: 10
                  }}
                  onPress={() => {
                    postHateList();
                    navigation.navigate('Map', { parent: '음식점' });
                  }}
                />
              </Col>
              <Col size={3} />
            </Grid>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'NanumGothic-ExtraBold',
    textAlign: 'center',
    fontSize: 35,
    color: 'black'
  },
  completeBtn: {
    backgroundColor: '#feee7d',
    borderRadius: 10
  }
});
