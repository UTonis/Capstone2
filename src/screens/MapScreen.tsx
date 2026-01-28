import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const KAKAO_APP_KEY = 'e47c2b77f49eebd24c9bb4c56d6d8c4a';

interface MapScreenProps {
    onBack?: () => void;
}

const MapScreen = ({ onBack }: MapScreenProps) => {
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Kakao Map</title>
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <script>
    (function() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false";
      
      script.onload = function() {
        kakao.maps.load(function() {
          var container = document.getElementById('map');
          var options = {
            center: new kakao.maps.LatLng(37.5665, 126.9780),
            level: 3
          };
          var map = new kakao.maps.Map(container, options);

          var markerPosition = new kakao.maps.LatLng(37.5665, 126.9780);
          var marker = new kakao.maps.Marker({
            position: markerPosition
          });
          marker.setMap(map);

          var infowindow = new kakao.maps.InfoWindow({
            content: '<div style="padding:5px;font-size:12px;width:150px;text-align:center;">서울 시청 📍</div>'
          });
          infowindow.open(map, marker);
          
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage('loaded');
        });
      };
      
      script.onerror = function() {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage('error');
      };
      
      document.head.appendChild(script);
    })();
  </script>
</body>
</html>
  `;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {onBack && (
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>← 뒤로</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>카카오 지도</Text>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FEE500" />
                    <Text style={styles.loadingText}>지도 로딩 중...</Text>
                </View>
            )}

            <WebView
                ref={webViewRef}
                source={{ html: htmlContent, baseUrl: 'http://localhost' }}
                style={styles.map}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                mixedContentMode="always"
                allowsInlineMediaPlayback={true}
                onMessage={(event) => {
                    if (event.nativeEvent.data === 'loaded') {
                        setLoading(false);
                    }
                }}
                onLoadEnd={() => {
                    setTimeout(() => setLoading(false), 2000);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 12,
    },
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
});

export default MapScreen;