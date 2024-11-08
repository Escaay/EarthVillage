import { MapView, MapType, Marker } from 'react-native-amap3d';
import { AMapSdk } from 'react-native-amap3d';
import { Platform, Text } from 'react-native';
import { useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';

export default function GDMap() {
  const MapViewRef = useRef<any>();
  return (
    <WebView
      // ref={MapViewRef}
      // javaScriptEnabled
      // scalesPageToFit
      source={{ uri: `https://escaay.github.io/mapView.html` }} //网络地址，放在本地会导致postmessage失效
      // source={{ uri: `https://m.amap.com/picker/?keywords=小区,写字楼,学校&key=f61c8702241fe5e1eaef005bc2d202ac` }} //网络地址，放在本地会导致postmessage失效
      onMessage={nativeEvent => {
        const { data } = nativeEvent.nativeEvent;
        console.log(data);
      }}
    />
  );
  //   AMapSdk.init(
  //     Platform.select({
  //       android: "f61c8702241fe5e1eaef005bc2d202ac",
  //       // ios: "186d3464209b74effa4d8391f441f14d",
  //     })
  //   );

  //   return  <MapView
  //   mapType={MapType.Standard}
  //   onPress={({ nativeEvent }) => console.log(nativeEvent)}
  //   onCameraIdle={({ nativeEvent }) => console.log(nativeEvent)}
  //   initialCameraPosition={{
  //     target: {
  //       latitude: 39.91095,
  //       longitude: 116.37296,
  //     },
  //     zoom: 8,
  //   }}
  // >
  // <Marker
  //     position={{ latitude: 39.806901, longitude: 116.397972 }}
  //     // onPress={() => alert("onPress")}
  //   />
  //   <Marker
  //     position={{ latitude: 39.806901, longitude: 116.297972 }}
  //     icon={{
  //       uri: "https://reactnative.dev/img/pwa/manifest-icon-512.png",
  //       width: 64,
  //       height: 64,
  //     }}
  //   />
  //   <Marker position={{ latitude: 39.906901, longitude: 116.397972 }}>
  //     <Text
  //       style={{
  //         color: "#fff",
  //         backgroundColor: "#009688",
  //         alignItems: "center",
  //         borderRadius: 5,
  //         padding: 5,
  //       }}
  //     >
  //       {new Date().toLocaleString()}
  //     </Text>
  //   </Marker>
  // </MapView>
}
