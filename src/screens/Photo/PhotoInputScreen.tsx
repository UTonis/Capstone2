/**
 * Photo Input Screen - 사진 입력 화면
 * 카메라 또는 갤러리에서 이미지를 선택하여 미리보기를 제공
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    PermissionsAndroid,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fullAnalyze, FullAnalysisResponse } from '../../services/api';

interface PhotoInputScreenProps {
    onBack: () => void;
    onNavigateToGenerate?: (data: FullAnalysisResponse) => void;
    onNavigateToLogin?: () => void;
    triggerCamera?: boolean;
    onCameraTriggered?: () => void;
}

interface PhotoItem {
    id: string;
    uri: string;
}

function PhotoInputScreen({ onBack, onNavigateToGenerate, onNavigateToLogin, triggerCamera, onCameraTriggered }: PhotoInputScreenProps) {
    const insets = useSafeAreaInsets();
    const { token, showAlert } = useAuth();
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
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

    const handleCameraOpen = async () => {
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
            const newPhoto: PhotoItem = {
                uri: result.assets[0].uri || '',
                id: `${Date.now()}_${Math.random()}`,
            };
            setPhotos([...photos, newPhoto]);
        }
    };

    const handleGalleryOpen = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 10,
            quality: 0.8,
        });

        if (result.didCancel) {
            console.log('사용자가 갤러리 선택을 취소했습니다.');
        } else if (result.errorCode) {
            showAlert('오류', '갤러리를 열 수 없습니다.');
        } else if (result.assets) {
            const newPhotos: PhotoItem[] = result.assets.map((asset: Asset) => ({
                uri: asset.uri || '',
                id: `${Date.now()}_${Math.random()}`,
            }));
            setPhotos([...photos, ...newPhotos]);
        }
    };

    const handleRemovePhoto = (id: string) => {
        setPhotos(photos.filter(photo => photo.id !== id));
    };

    const handleAnalyze = async () => {
        if (photos.length === 0) {
            showAlert('알림', '분석할 사진을 추가해주세요.');
            return;
        }

        if (!token) {
            showAlert(
                '알림',
                '로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    { text: '이동', onPress: () => onNavigateToLogin?.() },
                ]
            );
            return;
        }

        setAnalyzing(true);
        try {
            const results = await Promise.all(
                photos.map((photo: PhotoItem) => fullAnalyze(token, photo.uri))
            );

            const best = results.reduce((prev: FullAnalysisResponse, curr: FullAnalysisResponse) =>
                curr.confidence > prev.confidence ? curr : prev
            );

            const mergedSceneTypes = Array.from(new Set(
                results.flatMap((r: FullAnalysisResponse) => r.scene?.scene_type ?? [])
            ));

            const merged: FullAnalysisResponse = {
                ...best,
                scene: best.scene
                    ? { ...best.scene, scene_type: mergedSceneTypes }
                    : { scene_type: mergedSceneTypes, atmosphere: null },
                recommendations: results.flatMap((r: FullAnalysisResponse) => r.recommendations ?? []),
            };

            onNavigateToGenerate?.(merged);
        } catch (err: any) {
            showAlert('분석 실패', err.message || '사진 분석 중 오류가 발생했습니다.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleUseSample = () => {
        const samplePhotos: PhotoItem[] = [
            { id: `sample_${Date.now()}_1`, uri: 'https://picsum.photos/400/300?random=10' },
            { id: `sample_${Date.now()}_2`, uri: 'https://picsum.photos/400/300?random=11' },
            { id: `sample_${Date.now()}_3`, uri: 'https://picsum.photos/400/300?random=12' },
        ];
        setPhotos([...photos, ...samplePhotos]);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>사진 입력</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 설명 */}
                <Text style={styles.description}>
                    카메라로 사진을 찍거나 갤러리에서 선택하세요.{'\n'}
                    추가된 사진은 AI가 분석하여 장소를 파악합니다.
                </Text>

                {/* 사진 추가 버튼들 */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.photoButton} onPress={handleCameraOpen}>
                        <Text style={styles.photoButtonIcon}>📷</Text>
                        <Text style={styles.photoButtonText}>카메라</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoButton} onPress={handleGalleryOpen}>
                        <Text style={styles.photoButtonIcon}>🖼️</Text>
                        <Text style={styles.photoButtonText}>갤러리</Text>
                    </TouchableOpacity>
                </View>

                {/* 샘플 버튼 */}
                <TouchableOpacity style={styles.sampleButton} onPress={handleUseSample}>
                    <Text style={styles.sampleButtonText}>샘플 이미지 사용하기</Text>
                </TouchableOpacity>

                {/* 사진 목록 */}
                {photos.length > 0 && (
                    <View style={styles.photosSection}>
                        <Text style={styles.sectionTitle}>
                            추가된 사진 ({photos.length}장)
                        </Text>
                        <View style={styles.photosGrid}>
                            {photos.map((photo) => (
                                <View key={photo.id} style={styles.photoItem}>
                                    <Image
                                        source={{ uri: photo.uri }}
                                        style={styles.photoImage}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => handleRemovePhoto(photo.id)}
                                    >
                                        <Text style={styles.removeButtonText}>X</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 분석 버튼 */}
                {photos.length > 0 && (
                    <TouchableOpacity
                        style={[styles.analyzeButton, analyzing && { opacity: 0.7 }]}
                        onPress={handleAnalyze}
                        disabled={analyzing}
                    >
                        {analyzing
                            ? <ActivityIndicator color="#FFFFFF" />
                            : <Text style={styles.analyzeButtonText}>사진 분석하기</Text>
                        }
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontWeight: '600',
        color: '#2B2B2B',
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    photoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#5B67CA',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    photoButtonIcon: {
        fontSize: 20,
    },
    photoButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    sampleButton: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        marginBottom: 24,
    },
    sampleButtonText: {
        fontSize: 13,
        color: '#666',
    },
    photosSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 16,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    photoItem: {
        width: '48%',
        aspectRatio: 4 / 3,
        margin: '1%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F0F0F0',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    analyzeButton: {
        marginTop: 24,
        backgroundColor: '#5B67CA',
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    analyzeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PhotoInputScreen;
