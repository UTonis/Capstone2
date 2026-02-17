/**
 * API Service Layer
 * 백엔드 API 연동 서비스
 */

import { Festival } from '../data/mockData';
import { Platform } from 'react-native';

// Android 에뮬레이터에서는 10.0.2.2, iOS 시뮬레이터/실디바이스에서는 localhost
const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://localhost:8000';

/**
 * 백엔드 FestivalInfo 응답 타입
 */
interface ApiFestivalInfo {
    id: number;
    title: string;
    address: string | null;
    region: string | null;
    event_start_date: string | null; // YYYYMMDD
    event_end_date: string | null;   // YYYYMMDD
    latitude: number | null;
    longitude: number | null;
    description: string | null;
    image_url: string | null;
    tel: string | null;
    homepage: string | null;
    event_place: string | null;
    is_ongoing: boolean;
    is_upcoming: boolean;
    days_until_start: number | null;
    days_until_end: number | null;
}

interface PopularFestivalsResponse {
    success: boolean;
    festivals: ApiFestivalInfo[];
    total_count: number;
    message: string;
}

/**
 * YYYYMMDD → "X월 Y일" 형식으로 변환
 */
function formatDateKorean(dateStr: string | null): string {
    if (!dateStr || dateStr.length !== 8) return '';
    const month = parseInt(dateStr.substring(4, 6), 10);
    const day = parseInt(dateStr.substring(6, 8), 10);
    return `${month}월 ${day}일`;
}

/**
 * API 축제 데이터 → 프론트 Festival 타입으로 변환
 */
function mapApiToFestival(api: ApiFestivalInfo): Festival {
    const startStr = formatDateKorean(api.event_start_date);
    const endStr = formatDateKorean(api.event_end_date);

    let dateDisplay = '';
    if (startStr && endStr && startStr !== endStr) {
        dateDisplay = `${startStr} ~ ${endStr}`;
    } else if (startStr) {
        dateDisplay = startStr;
    }

    // 시작월 추출
    const month = api.event_start_date
        ? parseInt(api.event_start_date.substring(4, 6), 10)
        : new Date().getMonth() + 1;

    return {
        id: api.id,
        name: api.title,
        location: api.region || api.address || '대한민국',
        date: dateDisplay,
        month,
        image: api.image_url || `https://picsum.photos/400/300?random=${api.id}`,
        description: api.description || '',
        rating: api.is_ongoing ? 4.9 : api.is_upcoming ? 4.7 : 4.5,
    };
}

/**
 * 인기 축제 목록 조회
 */
export async function fetchPopularFestivals(
    limit: number = 10,
    region?: string,
): Promise<Festival[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (region) params.append('region', region);

    const response = await fetch(`${BASE_URL}/festivals/popular?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: PopularFestivalsResponse = await response.json();

    if (!data.success || !data.festivals) {
        throw new Error('Invalid API response');
    }

    return data.festivals.map(mapApiToFestival);
}

interface CalendarResponse {
    success: boolean;
    year: number;
    month: number;
    festivals_by_date: { [date: string]: ApiFestivalInfo[] };
    total_count: number;
}

/**
 * 월별 축제 캘린더 조회
 */
export async function fetchMonthlyFestivals(
    year: number,
    month: number,
    region?: string,
): Promise<Festival[]> {
    let url = `${BASE_URL}/festivals/calendar/${year}/${month}`;
    if (region) url += `?region=${encodeURIComponent(region)}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: CalendarResponse = await response.json();

    if (!data.success) {
        throw new Error('Invalid API response');
    }

    // festivals_by_date에서 중복 제거하여 고유 축제 리스트 추출
    const festivalMap = new Map<number, ApiFestivalInfo>();
    for (const dateKey of Object.keys(data.festivals_by_date)) {
        for (const festival of data.festivals_by_date[dateKey]) {
            if (!festivalMap.has(festival.id)) {
                festivalMap.set(festival.id, festival);
            }
        }
    }

    return Array.from(festivalMap.values()).map(mapApiToFestival);
}

// ============================================
// Auth API
// ============================================

interface RegisterRequest {
    email: string;
    password: string;
    nickname?: string;
}

interface RegisterResponse {
    id: number;
    email: string;
    nickname: string | null;
    created_at: string;
}

interface LoginResponse {
    access_token: string;
    token_type: string;
}

interface UserMeResponse {
    id: number;
    email: string;
    nickname: string | null;
    created_at: string;
}

/**
 * 회원가입
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || '회원가입에 실패했습니다.');
    }

    return response.json();
}

/**
 * 로그인 → JWT 토큰 반환
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return response.json();
}

/**
 * 내 정보 조회 (토큰 필요)
 */
export async function fetchCurrentUser(token: string): Promise<UserMeResponse> {
    const response = await fetch(`${BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
    }

    return response.json();
}

// ============================================
// Festival Detail API
// ============================================

export interface FestivalDetail {
    id: number;
    title: string;
    description: string;
    address: string;
    tel: string;
    homepage: string;
    event_start_date: string | null;
    event_end_date: string | null;
    event_place: string;
    playtime: string;
    program: string;
    usetimefestival: string;
    sponsor1: string;
    sponsor1tel: string;
}

/**
 * 축제 상세 정보 조회
 */
export async function fetchFestivalDetail(festivalId: number): Promise<FestivalDetail> {
    const response = await fetch(`${BASE_URL}/festivals/${festivalId}/detail`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || '축제 상세 정보를 가져올 수 없습니다.');
    }

    const data = await response.json();
    return data.festival;
}

// ============================================
// Festival Search API
// ============================================

export interface SearchFestivalRequest {
    region?: string;
    start_date?: string;   // YYYY-MM-DD
    end_date?: string;     // YYYY-MM-DD
    keyword?: string;
    max_items?: number;
}

export interface SearchFestivalInfo {
    id: number;
    title: string;
    address: string | null;
    region: string | null;
    event_start_date: string | null;
    event_end_date: string | null;
    latitude: number | null;
    longitude: number | null;
    description: string | null;
    image_url: string | null;
    tel: string | null;
    homepage: string | null;
    event_place: string | null;
    playtime: string | null;
    program: string | null;
    usetimefestival: string | null;
    is_ongoing: boolean;
    is_upcoming: boolean;
    days_until_start: number | null;
    days_until_end: number | null;
}

export interface SearchFestivalResponse {
    success: boolean;
    festivals: SearchFestivalInfo[];
    total_count: number;
    filters_applied: Record<string, any>;
    message: string;
}

/**
 * 축제 검색
 */
export async function searchFestivals(params: SearchFestivalRequest): Promise<SearchFestivalResponse> {
    const response = await fetch(`${BASE_URL}/festivals/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || '축제 검색에 실패했습니다.');
    }

    return response.json();
}
