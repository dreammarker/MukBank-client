import { TouchableOpacity } from 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Text, View, Dimensions, Image, ActivityIndicator } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import Carousel from 'react-native-snap-carousel';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { MAPBOX_ACCESS_TOKEN } from '../../../../../config';

import CarouselImg from './RenderComponent/Carouselmg';
import CarouselContent from './RenderComponent/CarouselContent';
import DistancePicker from './Components/DistancePicker';
import CarouselLocation from './RenderComponent/CarouselLocation';
import DistanceOrReView from './Components/DistanceOrReView';
// import { locations } from './fakeData';
import styles from './MapStyles';
import Loader from 'react-native-modal-loader';

export default function MapScreen({ navigation, userInfo, route }) {
  let getParent = route.params.parent;
  let _carousel;
  let _map;
  let _marker;
  const [circle, setCircle] = useState(null); // location 첫 위치
  // 초기값 => 현재 위치
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0
  });
  const [datas, setDatas] = useState(null); // 식당 데이터 배열      (객체 배열)
  const [direction, setDirection] = useState([]); // 길찾기 배열     (객체 배열)
  const [lastDes, setLastDes] = useState(null); // 길찾기 목적지        (배열)
  const [distance, setDistance] = useState(0.3);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reviewOrDistance, setReviewOrDistance] = useState('review');
  const [count, setCount] = useState(false);
  const [isloading, setloading] = useState(false); //loading bar modal state 관리..
  const mapboxKey = MAPBOX_ACCESS_TOKEN;
  // 길찾기
  function getDirection() {
    axios(
      `https://api.mapbox.com/directions/v5/mapbox/walking/
      ${location.longitude},${location.latitude};${lastDes.longitude},${lastDes.latitude}
      ?geometries=geojson&access_token=${mapboxKey}`
    ).then(res => {
      const coords = res.data.routes[0].geometry.coordinates.map(item => {
        return { latitude: item[1], longitude: item[0] };
      });
      coords.push({
        latitude: Number(lastDes.latitude),
        longitude: Number(lastDes.longitude)
      });
      coords.unshift({
        latitude: Number(circle.latitude),
        longitude: Number(circle.longitude)
      });
      setDirection(coords);
    });
  }

  // 식당 및 카페 데이터
  function getMarkers() {
    axios({
      method: 'post',
      url: 'https://mukbank.xyz:5001/restaurant/distance',
      data: {
        latitude: location.latitude,
        longitude: location.longitude,
        sort: reviewOrDistance,
        distance,
        parent: getParent
      }
    }).then(res => {
      setDatas(res.data);
      setLastDes(res.data[selectedIndex]);
    });
  }
  function onMarkerPressed(index) {
    _carousel.snapToItem(selectedIndex);
  }
  // 좋아요 몇개 있는지 가져오는 함수
  function getLikeCount() {
    axios({
      method: 'post',
      url: 'https://mukbank.xyz:5001/restaurant/restlike',
      data: {
        // rest_id: datas[selectedIndex].id
      }
    }).then(res => {
      setCount(res.data);
    });
  }

  // 좋아요 올리거나 내리는 함수
  async function postLike() {
    const tokenStr = await AsyncStorage.getItem('jwt');
    const token = await JSON.parse(tokenStr).jwt;
    axios({
      method: 'post',
      url: 'https://mukbank.xyz:5001/restaurant/restlike',
      headers: { Authorization: `Bearer ${token}` },
      data: {
        rest_id: 1
      }
    }).then(res => {
      console.log(res);
    });
  }

  async function GetLocation() {
    await Geolocation.getCurrentPosition(position => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      setCircle({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    });
  }

  useEffect(() => {
    GetLocation();
  }, []);

  useEffect(() => {
    getLikeCount();
  }, [count]);

  //loading
  showLoader = () => {
    setloading(true);
  };

  // 식당 혹은 카페 정보 가져오기
  useEffect(() => {
    getMarkers();
  }, [location, distance, reviewOrDistance]);

  useEffect(() => {
    if (isloading) {
      setTimeout(() => {
        setloading(false);
      }, 300);
    }
  }, [isloading]);

  useEffect(() => {
    if (datas) {
      setLastDes(datas[selectedIndex]);
    }
  }, [selectedIndex]);

  function carouselIndexReset(selectedIndex) {
    _carousel.snapToItem(selectedIndex);
  }

  function renderItem({ item, index }) {
    return (
      <View style={styles.carouselRenderContainer}>
        <CarouselImg item={item} getLikeCount={getLikeCount} styles={styles} />
        <CarouselContent
          item={item}
          styles={styles}
          index={index}
          count={count}
        />
        <CarouselLocation
          styles={styles}
          item={item}
          navigation={navigation}
          datas={datas}
          selectedIndex={selectedIndex}
        />
      </View>
    );
  }
  //  여기 위까지가 renderItem
  if (!datas || !lastDes) {
    return (
      <>
        <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Loader loading={isloading} color="#2089dc" size="large" />
      <MapView
        showsUserLocation
        ref={map => {
          _marker = map;
        }}
        style={styles.map}
        region={{
          latitude: Number(lastDes.latitude),
          longitude: Number(lastDes.longitude),
          latitudeDelta: distance * 0.03,
          longitudeDelta: distance * 0.03
        }}
      >
        <MapView.Polyline
          coordinates={direction}
          strokeColor="red"
          fillColor="rgba(255,0,0,0.5)"
          strokeWidth={5}
        />
        <MapView.Marker
          ref={ref => (_map = ref)}
          coordinate={{
            latitude: Number(datas[selectedIndex].latitude),
            longitude: Number(datas[selectedIndex].longitude)
          }}
          onPress={() => {
            // setLastDes(datas[selectedIndex]);
            showLoader();
            getDirection();
          }}
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Image
              source={require('./marker.png')}
              style={{ width: 40, height: 40 }}
            />
            {selectedIndex > 98 ? (
              <Text style={styles.markerNum}>{selectedIndex + 1}</Text>
            ) : (
              <Text style={[styles.markerNum, { fontSize: 20 }]}>
                {selectedIndex + 1}
              </Text>
            )}
          </View>
        </MapView.Marker>
        {circle ? (
          <Circle
            radius={distance * 1000}
            center={{
              latitude: circle.latitude,
              longitude: circle.longitude
            }}
            fillColor="rgba(100, 200, 200, 0.2)"
          />
        ) : (
          <></>
        )}
      </MapView>

      <View style={styles.carousel}>
        <Carousel
          ref={c => {
            _carousel = c;
          }}
          data={datas}
          renderItem={renderItem}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={Dimensions.get('window').width * 0.85}
          firstItem={0}
          removeClippedSubviews={false}
          layout="default"
          onSnapToItem={async index => {
            setDirection([]);
            setSelectedIndex(index);
            // setLastDes(datas[index]);
          }}
        />
      </View>
      <View style={{ position: 'absolute', flexDirection: 'row' }}>
        <View style={{ position: 'absolute', flexDirection: 'row' }}>
          <DistancePicker
            carouselIndexReset={carouselIndexReset}
            setDistance={setDistance}
            distance={distance}
            setDirection={setDirection}
            setLastDes={setLastDes}
            setSelectedIndex={setSelectedIndex}
          />
          <DistanceOrReView
            carouselIndexReset={carouselIndexReset}
            setDirection={setDirection}
            setReviewOrDistance={setReviewOrDistance}
          />
        </View>
        <View
          style={[
            styles.container,
            {
              alignItems: 'flex-end',
              justifyContent: 'center',
              marginRight: 10
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setDirection([]);
              GetLocation();
              // setLastDes(circle);
            }}
          >
            <Image
              style={styles.currentLocation}
              source={require('./gps.png')}
              name="crosshairs-gps"
              size={23}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
