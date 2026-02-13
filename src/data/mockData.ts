/**
 * Mock Data for Travel App
 * 목업 데이터 관리 파일
 */

// 여행 카드 데이터
export const travelCards = [
    {
        id: 1,
        title: "'아오이이케' 리뷰",
        location: '삿포로',
        image: 'https://picsum.photos/400/300?random=1',
        type: 'review',
        author: '이건희',
    },
    {
        id: 2,
        title: '도쿄의 독특한 전문 박물관 BEST 3',
        location: '도쿄',
        image: 'https://picsum.photos/400/300?random=2',
        type: 'list',
        count: '오케 외 10명',
    },
];

// 추천 도시 데이터
export const recommendedCities = [
    { id: 1, name: '오사카', image: 'https://picsum.photos/200/200?random=3' },
    { id: 2, name: '후쿠오카', image: 'https://picsum.photos/200/200?random=4' },
    { id: 3, name: '방콕', image: 'https://picsum.photos/200/200?random=5' },
];

// 타입 정의
export interface TravelCard {
    id: number;
    title: string;
    location: string;
    image: string;
    type: string;
    author?: string;
    count?: string;
}

export interface City {
    id: number;
    name: string;
    image: string;
}

// 축제 데이터 타입
export interface Festival {
    id: number;
    name: string;
    location: string;
    date: string;
    month: number;
    image: string;
    description: string;
    rating: number;
}

// 월별 축제 정보
export const monthlyFestivals: { [key: number]: Festival[] } = {
    1: [
        { id: 101, name: '화천 산천어축제', location: '강원 화천', date: '1월 6일 ~ 1월 28일', month: 1, image: 'https://picsum.photos/400/300?random=101', description: '겨울 대표 축제, 얼음낚시 체험', rating: 4.8 },
    ],
    2: [
        { id: 201, name: '대관령 눈꽃축제', location: '강원 평창', date: '2월 1일 ~ 2월 11일', month: 2, image: 'https://picsum.photos/400/300?random=201', description: '환상적인 눈꽃 터널과 설경', rating: 4.7 },
    ],
    3: [
        { id: 301, name: '진해 군항제', location: '경남 창원', date: '3월 25일 ~ 4월 3일', month: 3, image: 'https://picsum.photos/400/300?random=301', description: '벚꽃 명소, 군항제 퍼레이드', rating: 4.9 },
    ],
    4: [
        { id: 401, name: '여의도 봄꽃축제', location: '서울 여의도', date: '4월 5일 ~ 4월 14일', month: 4, image: 'https://picsum.photos/400/300?random=401', description: '도심 속 벚꽃 명소', rating: 4.6 },
        { id: 402, name: '경주 벚꽃마라톤', location: '경북 경주', date: '4월 13일', month: 4, image: 'https://picsum.photos/400/300?random=402', description: '벚꽃길을 달리는 마라톤', rating: 4.5 },
    ],
    5: [
        { id: 501, name: '보령 머드축제', location: '충남 보령', date: '5월 17일 ~ 5월 26일', month: 5, image: 'https://picsum.photos/400/300?random=501', description: '세계적인 머드 체험 축제', rating: 4.8 },
    ],
    6: [
        { id: 601, name: '단오제', location: '강원 강릉', date: '6월 2일 ~ 6월 8일', month: 6, image: 'https://picsum.photos/400/300?random=601', description: '전통 단오 문화 축제', rating: 4.4 },
    ],
    7: [
        { id: 701, name: '보령 머드축제', location: '충남 보령', date: '7월 19일 ~ 7월 28일', month: 7, image: 'https://picsum.photos/400/300?random=701', description: '여름 대표 머드 축제', rating: 4.9 },
    ],
    8: [
        { id: 801, name: '부산 바다축제', location: '부산 해운대', date: '8월 1일 ~ 8월 4일', month: 8, image: 'https://picsum.photos/400/300?random=801', description: '해변에서 즐기는 여름 축제', rating: 4.7 },
    ],
    9: [
        { id: 901, name: '안동 국제탈춤페스티벌', location: '경북 안동', date: '9월 27일 ~ 10월 6일', month: 9, image: 'https://picsum.photos/400/300?random=901', description: '전통 탈춤 공연과 체험', rating: 4.5 },
    ],
    10: [
        { id: 1001, name: '자라섬 재즈페스티벌', location: '경기 가평', date: '10월 4일 ~ 10월 6일', month: 10, image: 'https://picsum.photos/400/300?random=1001', description: '가을 감성 재즈 페스티벌', rating: 4.9 },
        { id: 1002, name: '부산 불꽃축제', location: '부산 광안리', date: '10월 26일', month: 10, image: 'https://picsum.photos/400/300?random=1002', description: '화려한 불꽃쇼', rating: 4.8 },
    ],
    11: [
        { id: 1101, name: '김장축제', location: '서울 광화문', date: '11월 2일 ~ 11월 3일', month: 11, image: 'https://picsum.photos/400/300?random=1101', description: '전통 김장 문화 체험', rating: 4.3 },
    ],
    12: [
        { id: 1201, name: '빛축제', location: '서울 청계천', date: '12월 13일 ~ 12월 31일', month: 12, image: 'https://picsum.photos/400/300?random=1201', description: '겨울밤 빛의 향연', rating: 4.6 },
    ],
};

// 인기 축제 (평점 높은 순)
export const popularFestivals: Festival[] = [
    { id: 301, name: '진해 군항제', location: '경남 창원', date: '3월 25일 ~ 4월 3일', month: 3, image: 'https://picsum.photos/400/300?random=301', description: '벚꽃 명소, 군항제 퍼레이드', rating: 4.9 },
    { id: 701, name: '보령 머드축제', location: '충남 보령', date: '7월 19일 ~ 7월 28일', month: 7, image: 'https://picsum.photos/400/300?random=701', description: '여름 대표 머드 축제', rating: 4.9 },
    { id: 1001, name: '자라섬 재즈페스티벌', location: '경기 가평', date: '10월 4일 ~ 10월 6일', month: 10, image: 'https://picsum.photos/400/300?random=1001', description: '가을 감성 재즈 페스티벌', rating: 4.9 },
    { id: 101, name: '화천 산천어축제', location: '강원 화천', date: '1월 6일 ~ 1월 28일', month: 1, image: 'https://picsum.photos/400/300?random=101', description: '겨울 대표 축제, 얼음낚시 체험', rating: 4.8 },
    { id: 1002, name: '부산 불꽃축제', location: '부산 광안리', date: '10월 26일', month: 10, image: 'https://picsum.photos/400/300?random=1002', description: '화려한 불꽃쇼', rating: 4.8 },
    { id: 501, name: '보령 머드축제', location: '충남 보령', date: '5월 17일 ~ 5월 26일', month: 5, image: 'https://picsum.photos/400/300?random=501', description: '세계적인 머드 체험 축제', rating: 4.8 },
];

// 여행 일정 데이터 타입
export interface ScheduleItem {
    id: number;
    day: number;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    note?: string;
}

export interface TravelSchedule {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    items: ScheduleItem[];
}

// 저장된 여행 일정 목록
export const savedSchedules: TravelSchedule[] = [
    {
        id: 1,
        title: '제주도 힐링 여행',
        startDate: '2026-03-15',
        endDate: '2026-03-17',
        items: [
            // Day 1
            {
                id: 101,
                day: 1,
                time: '09:00',
                place: '제주국제공항',
                latitude: 33.5067,
                longitude: 126.4929,
                note: '제주 도착, 렌터카 픽업',
            },
            {
                id: 102,
                day: 1,
                time: '11:00',
                place: '성산일출봉',
                latitude: 33.4586,
                longitude: 126.9426,
                note: '유네스코 세계자연유산',
            },
            {
                id: 103,
                day: 1,
                time: '13:00',
                place: '섭지코지',
                latitude: 33.4242,
                longitude: 126.9293,
                note: '점심 식사 및 해안 산책',
            },
            {
                id: 104,
                day: 1,
                time: '16:00',
                place: '만장굴',
                latitude: 33.5267,
                longitude: 126.7714,
                note: '천연 용암동굴 탐험',
            },
            {
                id: 105,
                day: 1,
                time: '19:00',
                place: '제주시 동문시장',
                latitude: 33.5131,
                longitude: 126.5289,
                note: '저녁 식사 및 야시장 구경',
            },
            // Day 2
            {
                id: 201,
                day: 2,
                time: '09:00',
                place: '한라산 어리목 탐방로',
                latitude: 33.3886,
                longitude: 126.4983,
                note: '트레킹 (왕복 4시간)',
            },
            {
                id: 202,
                day: 2,
                time: '14:00',
                place: '천지연폭포',
                latitude: 33.2469,
                longitude: 126.5569,
                note: '폭포 감상',
            },
            {
                id: 203,
                day: 2,
                time: '16:00',
                place: '중문 색달해변',
                latitude: 33.2394,
                longitude: 126.4167,
                note: '해변 산책',
            },
            {
                id: 204,
                day: 2,
                time: '18:00',
                place: '서귀포 매일올레시장',
                latitude: 33.2531,
                longitude: 126.5619,
                note: '저녁 식사',
            },
            // Day 3
            {
                id: 301,
                day: 3,
                time: '09:00',
                place: '카멜리아힐',
                latitude: 33.2886,
                longitude: 126.3783,
                note: '동백꽃 정원 관람',
            },
            {
                id: 302,
                day: 3,
                time: '11:00',
                place: '오설록 티뮤지엄',
                latitude: 33.3061,
                longitude: 126.2903,
                note: '녹차 체험',
            },
            {
                id: 303,
                day: 3,
                time: '13:00',
                place: '협재해수욕장',
                latitude: 33.3942,
                longitude: 126.2397,
                note: '점심 및 해변 휴식',
            },
            {
                id: 304,
                day: 3,
                time: '16:00',
                place: '제주국제공항',
                latitude: 33.5067,
                longitude: 126.4929,
                note: '렌터카 반납 및 출발',
            },
        ],
    },
    {
        id: 2,
        title: '서울 도심 탐방',
        startDate: '2026-04-05',
        endDate: '2026-04-06',
        items: [
            // Day 1
            {
                id: 401,
                day: 1,
                time: '10:00',
                place: '경복궁',
                latitude: 37.5796,
                longitude: 126.9770,
                note: '왕궁 관람 및 수문장 교대식',
            },
            {
                id: 402,
                day: 1,
                time: '12:00',
                place: '북촌 한옥마을',
                latitude: 37.5825,
                longitude: 126.9833,
                note: '전통 한옥 거리 산책',
            },
            {
                id: 403,
                day: 1,
                time: '14:00',
                place: '인사동',
                latitude: 37.5719,
                longitude: 126.9858,
                note: '전통 문화거리 쇼핑',
            },
            {
                id: 404,
                day: 1,
                time: '17:00',
                place: '청계천',
                latitude: 37.5694,
                longitude: 126.9783,
                note: '도심 산책',
            },
            {
                id: 405,
                day: 1,
                time: '19:00',
                place: '명동',
                latitude: 37.5636,
                longitude: 126.9836,
                note: '저녁 식사 및 쇼핑',
            },
            // Day 2
            {
                id: 501,
                day: 2,
                time: '10:00',
                place: 'N서울타워',
                latitude: 37.5512,
                longitude: 126.9882,
                note: '전망대에서 서울 전경 감상',
            },
            {
                id: 502,
                day: 2,
                time: '13:00',
                place: '이태원',
                latitude: 37.5347,
                longitude: 126.9945,
                note: '점심 및 이국적인 거리 탐방',
            },
            {
                id: 503,
                day: 2,
                time: '16:00',
                place: '한강공원 (여의도)',
                latitude: 37.5285,
                longitude: 126.9328,
                note: '한강 자전거 라이딩',
            },
            {
                id: 504,
                day: 2,
                time: '19:00',
                place: '홍대',
                latitude: 37.5563,
                longitude: 126.9236,
                note: '저녁 식사 및 거리 공연 관람',
            },
        ],
    },
];
