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
