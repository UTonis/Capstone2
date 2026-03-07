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
import { fullAnalyze, FullAnalysisResponse } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
interface AIPlannerScreenProps {
    onBack?: () => void;
    onPlanCreated?: () => void;
    onNavigateToGenerate?: (data: FullAnalysisResponse) => void;
    token?: string;
    triggerCamera?: boolean;
    onCameraTriggered?: () => void;
}

interface PhotoAsset {
    uri: string;
    id: string;
}

const AIPlannerScreen = ({ onBack, onNavigateToGenerate, token: propToken, triggerCamera, onCameraTriggered }: AIPlannerScreenProps) => {
    const { token: contextToken } = useAuth();
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
            Alert.alert('알림', '최대 5장까지만 업로드할 수 있습니다.');
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
            Alert.alert('오류', '갤러리를 열 수 없습니다.');
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
            Alert.alert('알림', '최대 5장까지만 업로드할 수 있습니다.');
            return;
        }

        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
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
            Alert.alert('오류', '카메라를 열 수 없습니다.');
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

    const handleStartAnalysis = async () => {
        if (selectedPhotos.length === 0) {
            Alert.alert('알림', '사진을 추가해주세요.');
            return;
        }

        if (!token) {
            Alert.alert('알림', '로그인이 필요한 서비스입니다.');
            return;
        }

        setAnalyzing(true);
        try {
            // [Auth Debug] 토큰 유효성 테스트 (실제 분석 전 로그)
            console.log('Token check...', token?.substring(0, 10));

            // 첫 번째 사진으로 분석 진행
            const result = await fullAnalyze(token, selectedPhotos[0].uri);
            onNavigateToGenerate?.(result);
        } catch (err: any) {
            console.error('분석 실패 (Full Error):', err);

            const isApiError = err.name === 'ApiError';
            const originPrefix = isApiError ? (err.origin === 'FE' ? '[프론트엔드 오류]' : '[백엔드 오류]') : '[기타 오류]';
            const statusSuffix = isApiError && err.status ? ` (Status: ${err.status})` : '';
            const errorMsg = err.message || '알 수 없는 오류';
            const { BASE_URL } = require('../../services/api');

            Alert.alert(
                '분석 실패',
                `${originPrefix} ${errorMsg}${statusSuffix}\n\n접속 시도: ${BASE_URL}\n\n도움말:\n- [프론트] USB 케이블이 잘 연결되어 있는지 확인해 주세요.\n- [프론트] 터미널에 adb reverse 명령이 돌아가는지 확인해 주세요.`,
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
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI 여행 플래너</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 메인 설명 */}
                <View style={styles.heroSection}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.heroIcon}>📸</Text>
                    </View>
                    <Text style={styles.heroTitle}>사진으로 여행 계획 만들기</Text>
                    <Text style={styles.heroSubtitle}>
                        가고 싶은 여행지 사진을 업로드하면{'\n'}
                        AI가 맞춤 여행 일정을 만들어드려요
                    </Text>
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

                {/* 예시 사진 */}
                <View style={styles.exampleSection}>
                    <Text style={styles.sectionTitle}>이런 사진을 올려보세요</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.exampleCard}>
                            <View style={styles.exampleImage}>
                                <Text style={styles.exampleEmoji}>🏖️</Text>
                            </View>
                            <Text style={styles.exampleText}>해변 풍경</Text>
                        </View>
                        <View style={styles.exampleCard}>
                            <View style={styles.exampleImage}>
                                <Text style={styles.exampleEmoji}>🏔️</Text>
                            </View>
                            <Text style={styles.exampleText}>산 풍경</Text>
                        </View>
                        <View style={styles.exampleCard}>
                            <View style={styles.exampleImage}>
                                <Text style={styles.exampleEmoji}>🌃</Text>
                            </View>
                            <Text style={styles.exampleText}>도시 야경</Text>
                        </View>
                        <View style={styles.exampleCard}>
                            <View style={styles.exampleImage}>
                                <Text style={styles.exampleEmoji}>🏛️</Text>
                            </View>
                            <Text style={styles.exampleText}>역사 유적</Text>
                        </View>
                    </ScrollView>
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
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    heroIcon: {
        fontSize: 40,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 12,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
    },
    uploadSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 16,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    uploadIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 4,
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
    },
    photoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
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
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    uploadButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    uploadButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2B2B2B',
    },
    guideSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
    },
    guideItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    guideNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    guideNumberText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    guideContent: {
        flex: 1,
    },
    guideTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    guideText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    exampleSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
        marginBottom: 20,
    },
    exampleCard: {
        alignItems: 'center',
        marginRight: 16,
    },
    exampleImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    exampleEmoji: {
        fontSize: 32,
    },
    exampleText: {
        fontSize: 13,
        color: '#666666',
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    startButton: {
        backgroundColor: '#5B67CA',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    startButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AIPlannerScreen;
