import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const KAKAO_APP_KEY = 'e47c2b77f49eebd24c9bb4c56d6d8c4a';

interface MapScheduleItem {
  id: number;
  latitude?: number;
  longitude?: number;
  place: string | { name: string; latitude: number; longitude: number };
  day_number?: number;
  arrival_time?: string;
  memo?: string;
  [key: string]: any;
}

interface MapScreenProps {
  onBack?: () => void;
  scheduleItems?: MapScheduleItem[];
}

const MapScreen = ({ onBack, scheduleItems }: MapScreenProps) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  // 기본 위치 (서울 시청) 또는 첫 번째 일정 위치
  const firstItem = scheduleItems && scheduleItems.length > 0 ? scheduleItems[0] : null;
  const extractCoord = (item: any, latOrLng: 'lat' | 'lng') => {
    const full = latOrLng === 'lat' ? 'latitude' : 'longitude';
    const val = typeof item[full] === 'number' ? item[full] : (typeof item[latOrLng] === 'number' ? item[latOrLng] : (item.place as any)?.[full] || (item.place as any)?.[latOrLng]);
    return typeof val === 'number' ? val : null;
  };

  const defaultLat = firstItem ? (extractCoord(firstItem, 'lat') || 37.5665) : 37.5665;
  const defaultLng = firstItem ? (extractCoord(firstItem, 'lng') || 126.9780) : 126.9780;

  // 마커 데이터를 JavaScript 배열로 변환
  const markersData = scheduleItems && scheduleItems.length > 0
    ? scheduleItems
      .map(item => {
        const lat = extractCoord(item, 'lat');
        const lng = extractCoord(item, 'lng');
        const placeName = typeof item.place === 'string' ? item.place : (item.place as any)?.name || '알 수 없는 장소';

        return {
          lat,
          lng,
          place: placeName,
          time: item.arrival_time || (item as any).time || '',
          day: item.day_number || (item as any).day || 0,
          note: item.memo || (item as any).note || '',
        };
      })
      .filter(m => m.lat !== null && m.lng !== null)
    : [];

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
    #map { width: 100%; height: 100%; background-color: #eee; }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <script>
    (function() {
      // WebView와 통신을 위한 함수
      function postMessage(type, data) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...data }));
      }

      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false";
      
      script.onload = function() {
        if (typeof kakao === 'undefined' || !kakao.maps) return;

        kakao.maps.load(function() {
          if (typeof kakao.maps.LatLng !== 'function') return;
          
          var container = document.getElementById('map');
          var options = {
            center: new kakao.maps.LatLng(${Number(defaultLat) || 37.5665}, ${Number(defaultLng) || 126.9780}),
            level: ${scheduleItems && scheduleItems.length > 1 ? 8 : 3}
          };
          
          try {
            var map = new kakao.maps.Map(container, options);

            // Day별 색상 팔레트
            var dayColors = [
              '#5B67CA', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA'
            ];

            function createMarkerImage(color, day) {
              var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">' +
                '<path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="' + color + '" stroke="white" stroke-width="2"/>' +
                '<circle cx="20" cy="20" r="12" fill="white"/>' +
                '<text x="20" y="26" text-anchor="middle" font-size="14" font-weight="bold" fill="' + color + '">' + day + '</text>' +
                '</svg>';
              var encodedSvg = 'data:image/svg+xml;base64,' + btoa(svg);
              return new kakao.maps.MarkerImage(encodedSvg, new kakao.maps.Size(40, 50), {offset: new kakao.maps.Point(20, 50)});
            }

            var markers = ${JSON.stringify(markersData)};
            var bounds = new kakao.maps.LatLngBounds();
            var infowindows = [];
            
            markers.forEach(function(markerData, index) {
              if (!markerData.lat || !markerData.lng) return;
              
              var position = new kakao.maps.LatLng(markerData.lat, markerData.lng);
              var dayColor = markerData.day > 0 ? dayColors[(markerData.day - 1) % dayColors.length] : dayColors[0];
              var markerImage = markerData.day > 0 ? createMarkerImage(dayColor, markerData.day) : null;
              
              var marker = new kakao.maps.Marker({
                position: position,
                map: map,
                image: markerImage
              });
              
              var content = '<div style="padding:16px; min-width:180px; background:#fff; border-radius:20px; box-shadow:0 4px 12px rgba(0,0,0,0.1); border:none;">' +
                (markerData.day > 0 ? '<div style="background:' + dayColor + ';color:white;padding:4px 10px;border-radius:12px;display:inline-block;font-size:10px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Day ' + markerData.day + '</div>' : '') +
                '<div style="font-weight:700;font-size:15px;color:#1A1A2E;margin-bottom:4px;">' + markerData.place + '</div>' +
                (markerData.time ? '<div style="font-size:12px;color:#5B67CA;margin-top:4px;font-weight:500;">🕐 ' + markerData.time + '</div>' : '') +
                (markerData.note ? '<div style="font-size:12px;color:#666;margin-top:6px;line-height:1.4;">' + markerData.note + '</div>' : '') +
                '</div>';
              
              var infowindow = new kakao.maps.InfoWindow({ 
                content: content,
                removable: true,
                zIndex: 10
              });
              infowindows.push(infowindow);
              
              if (index === 0) infowindow.open(map, marker);
              
              kakao.maps.event.addListener(marker, 'click', function() {
                infowindows.forEach(function(iw) { iw.close(); });
                infowindow.open(map, marker);
              });
              
              bounds.extend(position);
            });
            
            if (markers.length > 1) {
              map.setBounds(bounds);
            }
            
            postMessage('status', { value: 'loaded' });
          } catch (e) {
            console.error('Map init error:', e);
          }
        });
      };
      
      script.onerror = function() {
        postMessage('status', { value: 'error' });
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
            <Text style={styles.backButtonText}>뒤로</Text>
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
        userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36"
        source={{
          html: htmlContent,
          baseUrl: 'https://localhost',
          headers: { 'Referer': 'https://localhost' }
        }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'log') {
              console.log('[WebView Log]', data.message);
            } else if (data.type === 'status') {
              if (data.value === 'loaded') setLoading(false);
            }
          } catch (err) {
            // Fallback for non-JSON messages
            if (event.nativeEvent.data === 'loaded') {
              setLoading(false);
            } else if (event.nativeEvent.data === 'error') {
              console.error('[WebView Error] Failed to load Kakao Map');
            }
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
    top: '40%',
    left: '20%',
    right: '20%',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#1A1A2E',
    fontWeight: '600',
  },
});

export default MapScreen;