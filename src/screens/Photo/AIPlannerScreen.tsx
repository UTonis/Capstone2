import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    PermissionsAndroid,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { fullAnalyze, FullAnalysisResponse, VisionRecommendedPlace, BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
interface AIPlannerScreenProps {
    onBack?: () => void;
    onPlanCreated?: () => void;
    onNavigateToGenerate?: (data: FullAnalysisResponse) => void;
    onNavigateToLogin?: () => void;
    token?: string;
    triggerCamera?: boolean;
    onCameraTriggered?: () => void;
}

interface PhotoAsset {
    uri: string;
    id: string;
}

const AIPlannerScreen = ({ onBack, onNavigateToGenerate, onNavigateToLogin, token: propToken, triggerCamera, onCameraTriggered }: AIPlannerScreenProps) => {
    const { token: contextToken, showAlert } = useAuth();
    const token = propToken || contextToken;

    const [selectedPhotos, setSelectedPhotos] = useState<PhotoAsset[]>([]);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (triggerCamera) {
            handleCameraOpen();
            onCameraTriggered?.();
        }
    }, [triggerCamera]);

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: '카메라 권한 요청',
                        message: '사진을 촬영하기 위해 카메라 권한이 필요합니다.',
                        buttonNeutral: '나중에',
                        buttonNegative: '거부',
                        buttonPositive: '허용',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handlePhotoUpload = async () => {
        if (selectedPhotos.length >= 5) {
            showAlert('알림', '최대 5장까지만 업로드할 수 있습니다.');
            return;
        }

        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 5 - selectedPhotos.length,
            quality: 0.8,
        });

        if (result.didCancel) {
            console.log('사용자가 갤러리 선택을 취소했습니다.');
        } else if (result.errorCode) {
            showAlert('오류', '갤러리를 열 수 없습니다.');
        } else if (result.assets) {
            const newPhotos: PhotoAsset[] = result.assets.map((asset: any) => ({
                uri: asset.uri || '',
                id: `${Date.now()}_${Math.random()}`,
            }));
            setSelectedPhotos([...selectedPhotos, ...newPhotos]);
        }
    };

    const handleCameraOpen = async () => {
        if (selectedPhotos.length >= 5) {
            showAlert('알림', '최대 5장까지만 업로드할 수 있습니다.');
            return;
        }

        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            showAlert('권한 필요', '카메라 권한이 필요합니다.');
            return;
        }

        const result = await launchCamera({
            mediaType: 'photo',
            quality: 0.8,
            saveToPhotos: true,
        });

        if (result.didCancel) {
            console.log('사용자가 카메라를 취소했습니다.');
        } else if (result.errorCode) {
            showAlert('오류', '카메라를 열 수 없습니다.');
        } else if (result.assets && result.assets[0]) {
            const newPhoto: PhotoAsset = {
                uri: result.assets[0].uri || '',
                id: `${Date.now()}_${Math.random()}`,
            };
            setSelectedPhotos([...selectedPhotos, newPhoto]);
        }
    };

    const handleRemovePhoto = (id: string) => {
        setSelectedPhotos(selectedPhotos.filter(photo => photo.id !== id));
    };

    const handleBack = () => {
        setSelectedPhotos([]);
        onBack?.();
    };

    const handleStartAnalysis = async () => {
        if (selectedPhotos.length === 0) {
            showAlert('알림', '사진을 추가해주세요.');
            return;
        }

        if (!token) {
            showAlert(
                '알림',
                '로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    { text: '이동', onPress: () => onNavigateToLogin?.() }
                ]
            );
            return;
        }

        setAnalyzing(true);
        try {
            console.log('Token check...', token?.substring(0, 10));

            // 모든 사진 순차 분석
            const results = await Promise.all(
                selectedPhotos.map((photo: PhotoAsset) => fullAnalyze(token, photo.uri))
            );

            // 신뢰도가 가장 높은 결과를 대표로 선택
            const best = results.reduce((prev: FullAnalysisResponse, curr: FullAnalysisResponse) =>
                curr.confidence > prev.confidence ? curr : prev
            );

            // 모든 결과에서 scene_type 합산
            const mergedSceneTypes = Array.from(new Set(
                results.flatMap((r: FullAnalysisResponse) => r.scene?.scene_type ?? [])
            ));
            const mergedRecommendations = results
                .flatMap((r: FullAnalysisResponse) => r.recommendations ?? [])
                .filter((r: VisionRecommendedPlace, i: number, arr: VisionRecommendedPlace[]) =>
                    arr.findIndex((x: VisionRecommendedPlace) => x.id === r.id) === i
                );

            const merged = {
                ...best,
                scene: best.scene
                    ? { ...best.scene, scene_type: mergedSceneTypes }
                    : { scene_type: mergedSceneTypes, atmosphere: null },
                recommendations: mergedRecommendations,
            };

            onNavigateToGenerate?.(merged);
        } catch (err: any) {
            console.error('분석 실패 (Full Error):', err);

            const isApiError = err.name === 'ApiError';
            const originPrefix = isApiError ? (err.origin === 'FE' ? '[프론트엔드 오류]' : '[백엔드 오류]') : '[기타 오류]';
            const statusSuffix = isApiError && err.status ? ` (Status: ${err.status})` : '';
            const errorMsg = err.message || '알 수 없는 오류';

            const isLocal = BASE_URL.includes('localhost') || BASE_URL.includes('10.0.2.2') || BASE_URL.includes('127.0.0.1');

            let helpMsg = '';
            if (isLocal) {
                helpMsg = '- [개발] USB 케이블이 잘 연결되어 있는지 확인해 주세요.\n- [개발] 터미널에 adb reverse 명령이 돌아가는지 확인해 주세요.';
            } else {
                helpMsg = '- 인터넷 연결 상태(Wi-Fi/데이터)를 확인해 주세요.\n- 사내/공공망 등 특정 네트워크에서 접속을 차단하고 있는지 확인해 주세요.\n- 서버 주소로 직접 접속이 가능한지 확인해 주세요.';
            }

            showAlert(
                '분석 실패',
                `${originPrefix} ${errorMsg}${statusSuffix}\n\n접속 시도: ${BASE_URL}\n\n도움말:\n${helpMsg}`,
                [{ text: '확인' }]
            );
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} pointerEvents="none">AI 여행 플래너</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 메인 설명 */}
                <View style={styles.heroSection}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.heroTextLogo}>PtoT</Text>
                    </View>
                    <Text style={styles.heroTitle}>사진으로 여행 계획 만들기</Text>
                    <Text style={styles.heroSubtitle}>
                        가고 싶은 여행지 사진을 업로드하면{'\n'}
                        AI가 맞춤 여행 일정을 만들어드려요
                    </Text>
                </View>

                {/* 사용 방법 안내 */}
                <View style={styles.guideSection}>
                    <Text style={styles.sectionTitle}>이렇게 사용하세요</Text>

                    <View style={styles.guideItem}>
                        <View style={styles.guideNumber}>
                            <Text style={styles.guideNumberText}>1</Text>
                        </View>
                        <View style={styles.guideContent}>
                            <Text style={styles.guideTitle}>여행지 사진 업로드</Text>
                            <Text style={styles.guideText}>가고 싶은 장소나 비슷한 분위기의 사진을 올려주세요</Text>
                        </View>
                    </View>

                    <View style={styles.guideItem}>
                        <View style={styles.guideNumber}>
                            <Text style={styles.guideNumberText}>2</Text>
                        </View>
                        <View style={styles.guideContent}>
                            <Text style={styles.guideTitle}>AI 분석 및 추천</Text>
                            <Text style={styles.guideText}>AI가 사진을 분석하고 유사한 국내 여행지를 찾아드려요</Text>
                        </View>
                    </View>

                    <View style={styles.guideItem}>
                        <View style={styles.guideNumber}>
                            <Text style={styles.guideNumberText}>3</Text>
                        </View>
                        <View style={styles.guideContent}>
                            <Text style={styles.guideTitle}>맞춤 일정 생성</Text>
                            <Text style={styles.guideText}>여행 기간과 선호도를 고려한 완벽한 일정을 만들어드려요</Text>
                        </View>
                    </View>
                </View>

                {/* 사진 업로드 영역 */}
                <View style={styles.uploadSection}>
                    <Text style={styles.sectionTitle}>여행지 사진 업로드</Text>

                    {selectedPhotos.length === 0 ? (
                        <View style={styles.uploadArea}>
                            <Text style={styles.uploadIcon}>🖼️</Text>
                            <Text style={styles.uploadText}>사진을 추가해주세요</Text>
                            <Text style={styles.uploadSubtext}>최대 5장까지 업로드 가능</Text>
                        </View>
                    ) : (
                        <View style={styles.photoGrid}>
                            {selectedPhotos.map((photo) => (
                                <View key={photo.id} style={styles.photoItem}>
                                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => handleRemovePhoto(photo.id)}
                                    >
                                        <Text style={styles.removeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* 업로드 버튼들 */}
                    <View style={styles.uploadButtons}>
                        <TouchableOpacity style={styles.uploadButton} onPress={handleCameraOpen}>
                            <Text style={styles.uploadButtonIcon}>📷</Text>
                            <Text style={styles.uploadButtonText}>카메라</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
                            <Text style={styles.uploadButtonIcon}>🖼️</Text>
                            <Text style={styles.uploadButtonText}>갤러리</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* 하단 시작 버튼 */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.startButton, (selectedPhotos.length === 0 || analyzing) && styles.startButtonDisabled]}
                    disabled={selectedPhotos.length === 0 || analyzing}
                    onPress={handleStartAnalysis}
                >
                    {analyzing ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.startButtonText}>
                            {selectedPhotos.length === 0 ? '사진을 추가해주세요' : 'AI 분석 시작하기'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Clean white background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        // Removed bottom border for a seamless look
    },
    backButton: {
        padding: 8,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 18, // Slightly smaller, more refined header text
        fontWeight: '700',
        color: '#1A1A2E',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F2FF', // Softer tint
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    heroTextLogo: {
        fontSize: 24,
        fontWeight: '900',
        color: '#5B67CA',
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
    },
    uploadSection: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        backgroundColor: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#C8CEF5', // Soft primary tone
        borderStyle: 'dashed',
        borderRadius: 24, // Rounder
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#F8F9FE', // Light primary tint
        marginBottom: 16,
    },
    uploadIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#5B67CA',
        marginBottom: 6,
    },
    uploadSubtext: {
        fontSize: 14,
        color: '#888888',
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    photoItem: {
        width: '30%',
        aspectRatio: 1,
        marginRight: '3.33%',
        marginBottom: 12,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    photoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF4B4B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    uploadButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    uploadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    uploadButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    uploadButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2B2B2B',
    },
    guideSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#FAFBFF', // Subtle offset background
        borderRadius: 24,
        marginHorizontal: 20,
        marginBottom: 32,
    },
    guideItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    guideNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        marginTop: 2,
    },
    guideNumberText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    guideContent: {
        flex: 1,
    },
    guideTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 4,
    },
    guideText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 22,
    },
    exampleSection: {
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    exampleCard: {
        alignItems: 'center',
        marginRight: 16,
    },
    exampleImage: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: '#F5F6F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    exampleEmoji: {
        fontSize: 32,
    },
    exampleText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
    },
    bottomContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    startButton: {
        backgroundColor: '#5B67CA',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    startButtonDisabled: {
        backgroundColor: '#E0E0E0',
        shadowOpacity: 0,
        elevation: 0,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
});

export default AIPlannerScreen;
