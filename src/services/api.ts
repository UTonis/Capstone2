/**
 * API Service Layer
 * 백엔드 API 연동 서비스
 */

import type { Festival } from '../data/mockData';
export type { Festival };
import { Platform } from 'react-native';

// Android 에뮬레이터에서는 10.0.2.2, iOS 시뮬레이터/실디바이스에서는 localhost
export const BASE_URL = Platform.OS === 'android'
    ? 'http://localhost:8000'
    : 'http://localhost:8000';

/** 서버 상태 확인 (연결 테스트용) */
export async function checkConnection(): Promise<{ status: string }> {
    try {
        const res = await fetch(`${BASE_URL}/docs`, { method: 'HEAD' });
        return { status: res.ok ? 'OK' : 'FAIL' };
    } catch (err: any) {
        throw new ApiError(err.message || '연결 실패', 'FE');
    }
}

/** API 오류 구분 및 상세 정보 전달을 위한 클래스 */
export class ApiError extends Error {
    origin: 'FE' | 'BE';
    status?: number;

    constructor(message: string, origin: 'FE' | 'BE', status?: number) {
        super(message);
        this.name = 'ApiError';
        this.origin = origin;
        this.status = status;
    }
}

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
        latitude: api.latitude || undefined,
        longitude: api.longitude || undefined,
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
    try {
        const response = await fetch(`${BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new ApiError(error.detail || '사용자 정보를 가져올 수 없습니다.', 'BE', response.status);
        }

        return response.json();
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.message || '네트워크 오류', 'FE');
    }
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
    festivals: Festival[];
    total_count: number;
    filters_applied: Record<string, any>;
    message: string;
}

/**
 * 축제 검색
 */
export async function searchFestivals(params: SearchFestivalRequest): Promise<SearchFestivalResponse> {
    try {
        const response = await fetch(`${BASE_URL}/festivals/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new ApiError(error.detail || '축제 검색 실패', 'BE', response.status);
        }

        const data = await response.json();
        return {
            ...data,
            festivals: data.festivals.map((f: any) => mapApiToFestival(f))
        };
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.message || '축제 검색 네트워크 오류', 'FE');
    }
}

// ============================================
// Trip CRUD API
// ============================================

export interface TripSummary {
    id: number;
    title: string;
    start_date: string;   // YYYY-MM-DD
    end_date: string;     // YYYY-MM-DD
    created_at: string;
    itinerary_count: number;
}

export interface PlaceInfo {
    id: number;
    name: string;
    category: string | null;
    address: string | null;
    latitude: number;
    longitude: number;
    image_url: string | null;
    tags: string[] | null;
}

export interface ItineraryItem {
    id: number;
    trip_id: number;
    day_number: number;
    place_id: number;
    place: PlaceInfo;
    order_index: number;
    arrival_time: string | null;
    stay_duration: number | null;
    memo: string | null;
    transport_mode: string | null;
}

export interface TripDetail extends TripSummary {
    itineraries: ItineraryItem[];
    itineraries_by_day?: Record<number, ItineraryItem[]>;
}

const authHeader = (token: string) => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

/** 여행 목록 조회 */
export async function getMyTrips(token: string): Promise<TripSummary[]> {
    const res = await fetch(`${BASE_URL}/trips`, { headers: authHeader(token) });
    if (!res.ok) throw new Error('여행 목록을 불러올 수 없습니다.');
    const data = await res.json();
    return data.trips ?? data;
}

/** 여행 생성 */
export async function createTrip(
    token: string,
    body: { title: string; start_date: string; end_date: string }
): Promise<TripSummary> {
    const res = await fetch(`${BASE_URL}/trips`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '여행을 생성할 수 없습니다.');
    }
    return res.json();
}

/** 여행 삭제 */
export async function deleteTrip(token: string, tripId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/trips/${tripId}`, {
        method: 'DELETE',
        headers: authHeader(token),
    });
    if (!res.ok) throw new Error('여행을 삭제할 수 없습니다.');
}

/** 여행 상세 조회 (일정 목록 포함) */
export async function getTripDetail(token: string, tripId: number): Promise<TripDetail> {
    const res = await fetch(`${BASE_URL}/trips/${tripId}`, {
        headers: authHeader(token),
    });
    if (!res.ok) throw new Error('여행 상세를 불러올 수 없습니다.');
    return res.json();
}

/** 일정 항목 수정 */
export async function updateItinerary(
    token: string,
    tripId: number,
    itineraryId: number,
    body: { day_number?: number; place_name?: string; visit_time?: string; note?: string; order_index?: number }
): Promise<ItineraryItem> {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/itineraries/${itineraryId}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '일정을 수정할 수 없습니다.');
    }
    return res.json();
}

// ============================================
// Planner AI Chat/Optimize API
// ============================================

export interface PlannerChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface PlannerChatResponse {
    success: boolean;
    message: string;
    assistant_message: string;
    updated_itineraries?: ItineraryItem[];
}

/** AI 일정 채팅 수정 (POST /planner/chat) */
export async function plannerChat(
    token: string,
    tripId: number,
    userMessage: string,
    chatHistory?: PlannerChatMessage[]
): Promise<PlannerChatResponse> {
    const res = await fetch(`${BASE_URL}/planner/chat`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
            trip_id: tripId,
            message: userMessage,
            chat_history: chatHistory ?? [],
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'AI 채팅에 실패했습니다.');
    }
    return res.json();
}

export interface OptimizeResponse {
    success: boolean;
    message: string;
    optimized_itineraries: ItineraryItem[];
    total_distance_km?: number;
}

/** 동선 최적화 (POST /planner/optimize) */
export async function plannerOptimize(
    token: string,
    tripId: number
): Promise<OptimizeResponse> {
    const res = await fetch(`${BASE_URL}/planner/optimize`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({ trip_id: tripId }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '동선 최적화에 실패했습니다.');
    }
    return res.json();
}


/** 일정 항목 추가 */
export async function addItinerary(
    token: string,
    tripId: number,
    body: { day_number: number; place_name: string; visit_time?: string; note?: string; order_index?: number }
): Promise<ItineraryItem> {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/itineraries`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '일정을 추가할 수 없습니다.');
    }
    return res.json();
}

/** 일정 항목 삭제 */
export async function deleteItinerary(
    token: string,
    tripId: number,
    itineraryId: number
): Promise<void> {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/itineraries/${itineraryId}`, {
        method: 'DELETE',
        headers: authHeader(token),
    });
    if (!res.ok) throw new Error('일정을 삭제할 수 없습니다.');
}

// ============================================
// User Profile API
// ============================================

/** 닉네임 수정 */
export async function updateProfile(token: string, nickname: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/users/me`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({ nickname }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '프로필을 수정할 수 없습니다.');
    }
}

/** 비밀번호 변경 */
export async function changePassword(
    token: string,
    currentPassword: string,
    newPassword: string
): Promise<void> {
    const res = await fetch(`${BASE_URL}/users/me/password`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '비밀번호를 변경할 수 없습니다.');
    }
}

/** 회원 탈퇴 */
export async function deleteAccount(token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: authHeader(token),
    });
    if (!res.ok) throw new Error('탈퇴에 실패했습니다.');
}

// ============================================
// Vision AI API
// ============================================

export interface VisionRecommendedPlace {
    id: number;
    name: string;
    category: string;
    address: string;
    image_url: string | null;
    tags: string[];
    similarity_score?: number;
}

export interface VisionAnalysisResult {
    success: boolean;
    analysis_type: string;        // 'A' | 'B' | 'C'
    landmark?: string;
    description?: string;
    recommended_places: VisionRecommendedPlace[];
    message: string;
}

/** 이미지 업로드 + GPT Vision 분석 + 유사 여행지 추천 통합 */
export async function analyzeImage(
    token: string,
    imageUri: string
): Promise<VisionAnalysisResult> {
    const formData = new FormData();
    formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
    } as any);

    try {
        const res = await fetch(`${BASE_URL}/vision/full-analyze`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new ApiError(err.detail || '백엔드 분석 처리 실패', 'BE', res.status);
        }

        return res.json();
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.message || '네트워크 연결 또는 프론트엔드 오류', 'FE');
    }
}

// ============================================
// Recommend API
// ============================================

export interface PopularPlace {
    id: number;
    name: string;
    category: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    image_url: string | null;
    tags: string[] | null;
    reason?: string; // 추천 사유 (조건 추천 시 포함될 수 있음)
}

/** 인기 여행지 목록 (로그인 불필요) */
export async function fetchPopularPlaces(
    region?: string,
    limit: number = 20,
): Promise<PopularPlace[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (region) params.append('region', region);
    const res = await fetch(`${BASE_URL}/recommend/popular?${params}`);
    if (!res.ok) throw new Error('인기 여행지를 불러올 수 없습니다.');
    const data = await res.json();
    return data.places ?? [];
}

export interface PreferenceSurvey {
    category_weights?: Record<string, number>; // e.g. { "자연": 5, "역사": 3 }
    preferred_themes?: string[];
    travel_pace?: 'relaxed' | 'moderate' | 'packed';
    budget_level?: 'low' | 'medium' | 'high';
    preferred_start_time?: string; // "HH:MM"
    preferred_end_time?: string;
}

export interface PreferenceResponse extends PreferenceSurvey {
    id: number;
    user_id: number;
}

/** 선호도 저장 */
export async function savePreference(token: string, survey: PreferenceSurvey): Promise<PreferenceResponse> {
    const res = await fetch(`${BASE_URL}/recommend/preference`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(survey),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '선호도 저장에 실패했습니다.');
    }
    return res.json();
}

/** 선호도 조회 */
export async function getPreference(token: string): Promise<PreferenceResponse | null> {
    const res = await fetch(`${BASE_URL}/recommend/preference`, {
        headers: authHeader(token),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('선호도를 불러올 수 없습니다.');
    return res.json();
}

export interface RecommendCondition {
    region?: string;
    themes?: string[];
    categories?: string[];
    budget_level?: 'low' | 'medium' | 'high';
    travel_date?: string; // YYYY-MM-DD
    duration?: string;    // 예: '당일치기', '1박2일' 등
    limit?: number;
}

export interface ConditionRecommendResponse {
    success: boolean;
    places: PopularPlace[];
    total_count: number;
    applied_filters: Record<string, any>;
    message: string;
}

/** 조건 기반 여행지 추천 */
export async function recommendByCondition(
    token: string,
    condition: RecommendCondition,
): Promise<ConditionRecommendResponse> {
    const res = await fetch(`${BASE_URL}/recommend/condition`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(condition),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '추천에 실패했습니다.');
    }
    return res.json();
}

// ============================================
// Planner AI API
// ============================================

export interface GenerateRequest {
    title: string;
    region: string;
    start_date: string;   // YYYY-MM-DD
    end_date: string;
    budget_level?: 'low' | 'medium' | 'high';
    themes?: string[];
    must_visit_places?: number[]; // 특정 장소 포함 요청 시
}

export interface GenerateResponse {
    success: boolean;
    trip_id: number;
    message: string;
    itinerary_count: number;
    travel_days: number;
}

/** AI 여행 일정 자동 생성 */
export async function generateItinerary(
    token: string,
    request: GenerateRequest,
): Promise<GenerateResponse> {
    const res = await fetch(`${BASE_URL}/planner/generate`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(request),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'AI 일정 생성에 실패했습니다.');
    }
    return res.json();
}

// ============================================
// Board (게시판) API
// ============================================

export interface BoardAuthor {
    id: number;
    nickname: string | null;
}

export interface BoardPostSummary {
    id: number;
    title: string;
    content_preview: string;
    region: string | null;
    tags: string[] | null;
    thumbnail_url: string | null;
    view_count: number;
    like_count: number;
    comment_count: number;
    author: BoardAuthor;
    created_at: string | null;
}

export interface BoardPostDetail extends BoardPostSummary {
    content: string;
    travel_start_date: string | null;
    travel_end_date: string | null;
    trip_id: number | null;
    images: { id: number; image_url: string; order_index: number }[];
    comments: BoardComment[];
    is_liked: boolean;
    updated_at: string | null;
}

export interface BoardComment {
    id: number;
    user_id: number;
    author: BoardAuthor;
    content: string;
    parent_id: number | null;
    created_at: string | null;
    replies: BoardComment[];
}

export interface BoardPostListResponse {
    posts: BoardPostSummary[];
    total: number;
    page: number;
    page_size: number;
}

/** 게시글 목록 조회 (로그인 불필요) */
export async function fetchPosts(
    page: number = 1,
    pageSize: number = 10,
    region?: string,
    keyword?: string,
): Promise<BoardPostListResponse> {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (region) params.append('region', region);
    if (keyword) params.append('keyword', keyword);
    try {
        const res = await fetch(`${BASE_URL}/board?${params}`);
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new ApiError(error.detail || '게시글 목록 로드 실패', 'BE', res.status);
        }
        return res.json();
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.message || '게시글 목록 네트워크 오류', 'FE');
    }
}

/** 게시글 상세 조회 */
export async function fetchPostDetail(
    postId: number,
    token?: string,
): Promise<BoardPostDetail> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}/board/${postId}`, { headers });
    if (!res.ok) throw new Error('게시글을 불러올 수 없습니다.');
    return res.json();
}

/** 게시글 작성 (인증 필요) */
export async function createPost(
    token: string,
    body: { title: string; content: string; region?: string; tags?: string[]; trip_id?: number },
): Promise<BoardPostDetail> {
    const res = await fetch(`${BASE_URL}/board`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '게시글 작성에 실패했습니다.');
    }
    return res.json();
}

/** 게시글 삭제 (본인만) */
export async function deletePost(token: string, postId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/board/${postId}`, {
        method: 'DELETE',
        headers: authHeader(token),
    });
    if (!res.ok) throw new Error('게시글을 삭제할 수 없습니다.');
}

/** 좋아요 토글 */
export async function togglePostLike(
    token: string,
    postId: number,
): Promise<{ liked: boolean }> {
    const res = await fetch(`${BASE_URL}/board/${postId}/like`, {
        method: 'POST',
        headers: authHeader(token),
    });
    if (!res.ok) throw new Error('좋아요 처리에 실패했습니다.');
    return res.json();
}

/** 댓글 작성 */
export async function createComment(
    token: string,
    postId: number,
    body: { content: string; parent_id?: number },
): Promise<BoardComment> {
    const res = await fetch(`${BASE_URL}/board/${postId}/comments`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '댓글 작성에 실패했습니다.');
    }
    return res.json();
}

/** 댓글 삭제 */
export async function deleteComment(token: string, commentId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/board/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeader(token),
    });
    if (!res.ok) throw new Error('댓글을 삭제할 수 없습니다.');
}

// ============================================
// Unified Search & Vision AI (New)
// ============================================

export interface SearchDbPlace {
    id: number;
    name: string;
    category: string | null;
    address: string | null;
    latitude: number;
    longitude: number;
    image_url: string | null;
    tags: string[] | null;
    description: string | null;
}

/** DB 기반 장소 검색 */
export async function searchPlacesDb(keyword: string, limit: number = 10): Promise<{ success: boolean, places: SearchDbPlace[] }> {
    try {
        const res = await fetch(`${BASE_URL}/places/search/db?keyword=${encodeURIComponent(keyword)}&limit=${limit}`);
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new ApiError(error.detail || '장소 검색 실패', 'BE', res.status);
        }
        return res.json();
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.message || '장소 검색 네트워크 오류', 'FE');
    }
}

export interface FullAnalysisResponse {
    type: 'A' | 'B' | 'C';
    location: {
        landmark: string | null;
        city: string | null;
        address: string | null;
    };
    scene: {
        scene_type: string[] | null;
        atmosphere: string | null;
    };
    confidence: number;
    explanation: string;
    image_path: string;
    recommendations: any[]; // RecommendedPlace[] if needed
}

/** 사진 통합 분석 */
export async function fullAnalyze(token: string, photoUri: string): Promise<FullAnalysisResponse> {
    const formData = new FormData();
    // React Native FormData handled differently, but fetch supports it
    formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
    } as any);

    try {
        const cleanToken = token.trim();
        console.log('fullAnalyze 시도 - Token:', `${cleanToken.substring(0, 10)}...`);

        const res = await fetch(`${BASE_URL}/vision/full-analyze`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cleanToken}`,
                // 'Content-Type': 'multipart/form-data' <- 절대 수동으로 넣지 않음 (Boundary 자동 생성 방해)
            },
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new ApiError(err.detail || '백엔드 사진 통합 분석 실패', 'BE', res.status);
        }
        return res.json();
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.message || '네트워크 연결 또는 프론트엔드 오류', 'FE');
    }
}
