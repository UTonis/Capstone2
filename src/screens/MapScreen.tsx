import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { ScheduleItem } from '../data/mockData';

const KAKAO_APP_KEY = 'e47c2b77f49eebd24c9bb4c56d6d8c4a';

interface MapScreenProps {
  onBack?: () => void;
  scheduleItems?: ScheduleItem[];
}

const MapScreen = ({ onBack, scheduleItems }: MapScreenProps) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  // 기본 위치 (서울 시청) 또는 첫 번째 일정 위치
  const defaultLat = scheduleItems && scheduleItems.length > 0 ? scheduleItems[0].latitude : 37.5665;
  const defaultLng = scheduleItems && scheduleItems.length > 0 ? scheduleItems[0].longitude : 126.9780;

  // 마커 데이터를 JavaScript 배열로 변환
  const markersData = scheduleItems && scheduleItems.length > 0
    ? scheduleItems.map(item => ({
      lat: item.latitude,
      lng: item.longitude,
      place: item.place,
      time: item.time,
      day: item.day,
      note: item.note || '',
    }))
    : [{ lat: defaultLat, lng: defaultLng, place: '서울 시청', time: '', day: 0, note: '' }];

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
            center: new kakao.maps.LatLng(${defaultLat}, ${defaultLng}),
            level: ${scheduleItems && scheduleItems.length > 1 ? 8 : 3}
          };
          var map = new kakao.maps.Map(container, options);

          // Day별 색상 팔레트
          var dayColors = [
            '#5B67CA', // Day 1 - 보라
            '#FF6B6B', // Day 2 - 빨강
            '#4ECDC4', // Day 3 - 청록
            '#FFD93D', // Day 4 - 노랑
            '#95E1D3', // Day 5 - 민트
            '#F38181', // Day 6 - 핑크
            '#AA96DA', // Day 7 - 연보라
          ];

          // SVG 마커 생성 함수
          function createMarkerImage(color, day) {
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">' +
              '<path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="' + color + '" stroke="white" stroke-width="2"/>' +
              '<circle cx="20" cy="20" r="12" fill="white"/>' +
              '<text x="20" y="26" text-anchor="middle" font-size="14" font-weight="bold" fill="' + color + '">' + day + '</text>' +
              '</svg>';
            
            var encodedSvg = 'data:image/svg+xml;base64,' + btoa(svg);
            return new kakao.maps.MarkerImage(encodedSvg, new kakao.maps.Size(40, 50), {offset: new kakao.maps.Point(20, 50)});
          }

          // 마커 데이터
          var markers = ${JSON.stringify(markersData)};
          
          // 마커와 인포윈도우 생성
          var bounds = new kakao.maps.LatLngBounds();
          var infowindows = []; // 모든 인포윈도우 저장
          
          markers.forEach(function(markerData, index) {
            var position = new kakao.maps.LatLng(markerData.lat, markerData.lng);
            
            // Day별 색상 선택
            var dayColor = markerData.day > 0 ? dayColors[(markerData.day - 1) % dayColors.length] : dayColors[0];
            
            // Day별 색상 마커 이미지 생성
            var markerImage = markerData.day > 0 ? createMarkerImage(dayColor, markerData.day) : null;
            
            // 마커 생성
            var marker = new kakao.maps.Marker({
              position: position,
              map: map,
              image: markerImage
            });
            
            // 인포윈도우 내용 생성 (Day별 색상 적용)
            var content = '<div style="padding:12px;min-width:160px;border-radius:8px;">';
            if (markerData.day > 0) {
              content += '<div style="display:inline-block;background-color:' + dayColor + ';color:white;padding:4px 12px;border-radius:12px;font-weight:bold;font-size:12px;margin-bottom:8px;">Day ' + markerData.day + '</div>';
            }
            content += '<div style="font-weight:bold;font-size:15px;margin-bottom:4px;color:#2B2B2B;">' + markerData.place + '</div>';
            if (markerData.time) {
              content += '<div style="color:#666;font-size:13px;margin-bottom:3px;">🕐 ' + markerData.time + '</div>';
            }
            if (markerData.note) {
              content += '<div style="color:#888;font-size:12px;line-height:1.4;">' + markerData.note + '</div>';
            }
            content += '</div>';
            
            var infowindow = new kakao.maps.InfoWindow({
              content: content
            });
            
            infowindows.push(infowindow);
            
            // 첫 번째 마커는 기본으로 인포윈도우 표시
            if (index === 0) {
              infowindow.open(map, marker);
            }
            
            // 마커 클릭 이벤트 - 다른 인포윈도우는 모두 닫고 클릭한 것만 열기
            kakao.maps.event.addListener(marker, 'click', function() {
              // 모든 인포윈도우 닫기
              infowindows.forEach(function(iw) {
                iw.close();
              });
              // 클릭한 마커의 인포윈도우만 열기
              infowindow.open(map, marker);
            });
            
            // 지도 범위에 마커 위치 추가
            bounds.extend(position);
          });
          
          // 여러 마커가 있을 경우 모든 마커가 보이도록 지도 범위 조정
          if (markers.length > 1) {
            map.setBounds(bounds);
          }
          
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