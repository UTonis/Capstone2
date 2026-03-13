import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  title?: string;
}

const MapScreen = ({ onBack, scheduleItems, title }: MapScreenProps) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');

  const extractCoord = (item: any, latOrLng: 'lat' | 'lng') => {
    const full = latOrLng === 'lat' ? 'latitude' : 'longitude';
    const val = typeof item[full] === 'number' ? item[full] : (typeof item[latOrLng] === 'number' ? item[latOrLng] : (item.place as any)?.[full] || (item.place as any)?.[latOrLng]);
    return typeof val === 'number' ? val : null;
  };

  const firstItem = scheduleItems && scheduleItems.length > 0 ? scheduleItems[0] : null;
  const defaultLat = firstItem ? (extractCoord(firstItem, 'lat') || 37.5665) : 37.5665;
  const defaultLng = firstItem ? (extractCoord(firstItem, 'lng') || 126.9780) : 126.9780;

  const days = Array.from(new Set(scheduleItems?.map(item => item.day_number || (item as any).day).filter(d => d))).sort((a, b) => (a as any) - (b as any));

  // 필터링된 마커 데이터
  const markersData = scheduleItems && scheduleItems.length > 0
    ? scheduleItems
      .filter(item => selectedDay === 'all' || (item.day_number || (item as any).day) === selectedDay)
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
    #map { width: 100%; height: 100%; }
    .zoom-ctrl {
      position: absolute;
      bottom: 40px;
      right: 25px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .zoom-btn {
      width: 54px;
      height: 54px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 400;
      color: #5B67CA;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      user-select: none;
      border: none;
      outline: none;
      -webkit-tap-highlight-color: transparent;
      backdrop-filter: blur(10px);
    }
    .zoom-btn:active { background: #F8F9FE; transform: scale(0.92); transition: transform 0.1s; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="zoom-ctrl">
    <button class="zoom-btn" onclick="zoomIn()">+</button>
    <button class="zoom-btn" onclick="zoomOut()">-</button>
  </div>
  
  <script>
    function zoomIn() { if(window.kakaoMap) window.kakaoMap.setLevel(window.kakaoMap.getLevel() - 1, {animate: true}); }
    function zoomOut() { if(window.kakaoMap) window.kakaoMap.setLevel(window.kakaoMap.getLevel() + 1, {animate: true}); }

    (function() {
      function postMessage(type, data) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...data }));
      }

      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false";
      
      script.onload = function() {
        if (typeof kakao === 'undefined' || !kakao.maps) return;

        kakao.maps.load(async function() {
          if (typeof kakao.maps.LatLng !== 'function') return;
          
          var container = document.getElementById('map');
          var options = {
            center: new kakao.maps.LatLng(${Number(defaultLat) || 37.5665}, ${Number(defaultLng) || 126.9780}),
            level: ${scheduleItems && scheduleItems.length > 1 ? 8 : 4}
          };
          
          try {
            var map = new kakao.maps.Map(container, options);
            window.kakaoMap = map;

            // Day별 색상 팔레트
            var dayColors = [
              '#5B67CA', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA'
            ];

            function createMarkerImage(color, day) {
              var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">' +
                '<path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="' + color + '" stroke="white" stroke-width="1.5"/>' +
                '<circle cx="16" cy="16" r="10" fill="white"/>' +
                '<text x="16" y="21" text-anchor="middle" font-size="11" font-weight="bold" fill="' + color + '">' + day + '</text>' +
                '</svg>';
              var encodedSvg = 'data:image/svg+xml;base64,' + btoa(svg);
              return new kakao.maps.MarkerImage(encodedSvg, new kakao.maps.Size(32, 40), {offset: new kakao.maps.Point(16, 40)});
            }

            var markers = ${JSON.stringify(markersData)};
            var bounds = new kakao.maps.LatLngBounds();
            var overlays = [];
            var linesByDay = {};

            // 1. 마커 및 오버레이 생성
            markers.forEach(function(markerData, index) {
              if (!markerData.lat || !markerData.lng) return;
              
              var position = new kakao.maps.LatLng(markerData.lat, markerData.lng);
              var day = markerData.day || 0;
              var dayColor = day > 0 ? dayColors[(day - 1) % dayColors.length] : dayColors[0];
              var markerImage = day > 0 ? createMarkerImage(dayColor, day) : null;
              
              var marker = new kakao.maps.Marker({
                position: position,
                map: map,
                image: markerImage
              });

              // 선을 긋기 위한 경로 데이터 수집
              if (day > 0) {
                if (!linesByDay[day]) linesByDay[day] = [];
                linesByDay[day].push(position);
              }
              
              var content = '<div style="padding:12px; width:200px; background:#fff; border-radius:12px; box-shadow:0 6px 16px rgba(0,0,0,0.12); border:none; position:relative; margin-bottom:30px; pointer-events: auto;">' +
                '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">' +
                  (day > 0 ? '<div style="background:' + dayColor + ';color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;letter-spacing:0.3px;">Day ' + day + '</div>' : '<div></div>') +
                  (markerData.time ? '<div style="font-size:11px;color:#5B67CA;font-weight:600;">🕐 ' + markerData.time + '</div>' : '') +
                '</div>' +
                '<div style="font-weight:800;font-size:16px;color:#1A1A2E;margin-bottom:8px;line-height:1.2; word-wrap: break-word; white-space: normal;">' + markerData.place + '</div>' +
                (markerData.note ? '<div style="font-size:12px;color:#666;line-height:1.5;background:#F8F9FE;padding:10px;border-radius:8px; word-break: keep-all; white-space: normal;">' + markerData.note + '</div>' : '') +
                /* Tail/Arrow */
                '<div style="position:absolute; bottom:-10px; left:50%; margin-left:-10px; width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-top:10px solid #FFF;"></div>' +
                '</div>';
              
              var overlay = new kakao.maps.CustomOverlay({
                content: content,
                map: null,
                position: position,
                yAnchor: 1.15,
                zIndex: 4,
                clickable: true
              });
              overlays.push(overlay);
              
              if (index === 0) overlay.setMap(map);
              
              kakao.maps.event.addListener(marker, 'click', function() {
                overlays.forEach(function(o) { o.setMap(null); });
                overlay.setMap(map);
                map.panTo(position);
              });
              
              bounds.extend(position);
            });

            // 2. 도로 기반 경로 그리기
            for (var day in linesByDay) {
              var dayPoints = linesByDay[day];
              var dayColor = dayColors[(parseInt(day) - 1) % dayColors.length];
              
              if (dayPoints.length < 2) continue;

              for (var i = 0; i < dayPoints.length - 1; i++) {
                var start = dayPoints[i];
                var end = dayPoints[i+1];
                
                try {
                  // 백엔드 /places/route API 호출
                  var response = await fetch(\`http://10.0.2.2:8000/places/route?ox=\${start.getLng()}&oy=\${start.getLat()}&dx=\${end.getLng()}&dy=\${end.getLat()}\`);
                  var data = await response.json();
                  
                  var roadPath = [];
                  if (data.paths && data.paths.length > 0) {
                    roadPath = data.paths.map(p => new kakao.maps.LatLng(p.y, p.x));
                  } else {
                    // 도로 데이터를 못찾으면 직선으로 연결
                    roadPath = [start, end];
                  }

                  var polyline = new kakao.maps.Polyline({
                    path: roadPath,
                    strokeWeight: 5,
                    strokeColor: dayColor,
                    strokeOpacity: 0.7,
                    strokeStyle: 'solid'
                  });
                  polyline.setMap(map);
                } catch (err) {
                  // 에러 발생 시 직선으로 연결 (fallback)
                  new kakao.maps.Polyline({
                    path: [start, end],
                    strokeWeight: 5,
                    strokeColor: dayColor,
                    strokeOpacity: 0.7,
                    strokeStyle: 'solid'
                  }).setMap(map);
                }
              }
            }
            
            if (markers.length > 0) {
              map.setBounds(bounds);
            }
            if (markers.length === 0) {
                map.setCenter(new kakao.maps.LatLng(${Number(defaultLat) || 37.5665}, ${Number(defaultLng) || 126.9780}));
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
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchBar}>
          {onBack && (
            <TouchableOpacity style={styles.headerIcon} onPress={onBack}>
              <Text style={styles.iconText}>〈</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {(!title || title === 'Unknown') ? '여행 일정' : title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 필터 바 */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedDay === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedDay('all')}
            >
              <Text style={[styles.filterText, selectedDay === 'all' && styles.filterTextActive]}>전체</Text>
            </TouchableOpacity>
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.filterChip, selectedDay === day && styles.filterChipActive]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.filterText, selectedDay === day && styles.filterTextActive]}>Day {day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B67CA" />
          <Text style={styles.loadingText}>지도 생성 중입니다</Text>
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
          // No-op, script handles status
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    height: 54,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
    fontWeight: '400',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  map: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    marginTop: -40, // Pull up to meet rounded corners if needed, but let's just use full size
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5B67CA',
    fontWeight: '700',
  },
  filterContainer: {
    marginTop: 12,
    marginHorizontal: -16, // Bleed out to screen edges
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterChipActive: {
    backgroundColor: '#5B67CA',
    borderColor: '#5B67CA',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default MapScreen;