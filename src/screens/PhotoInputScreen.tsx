/**
 * Photo Input Screen - 사진 입력 화면
 * URL로 이미지를 입력받아 미리보기를 제공
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    StyleSheet,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PhotoInputScreenProps {
    onBack: () => void;
}

interface PhotoItem {
    id: number;
    url: string;
}

function PhotoInputScreen({ onBack }: PhotoInputScreenProps) {
    const insets = useSafeAreaInsets();
    const [inputUrl, setInputUrl] = useState('');
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [nextId, setNextId] = useState(1);

    const handleAddPhoto = () => {
        if (!inputUrl.trim()) {
            Alert.alert('알림', '이미지 URL을 입력해주세요.');
            return;
        }

        const newPhoto: PhotoItem = {
            id: nextId,
            url: inputUrl.trim(),
        };

        setPhotos([...photos, newPhoto]);
        setNextId(nextId + 1);
        setInputUrl('');
    };

    const handleRemovePhoto = (id: number) => {
        setPhotos(photos.filter(photo => photo.id !== id));
    };

    const handleAnalyze = () => {
        if (photos.length === 0) {
            Alert.alert('알림', '분석할 사진을 추가해주세요.');
            return;
        }
        Alert.alert('분석 시작', `${photos.length}장의 사진을 분석합니다.\n(데모 기능)`);
    };

    const handleUseSample = () => {
        const samplePhotos: PhotoItem[] = [
            { id: nextId, url: 'https://picsum.photos/400/300?random=10' },
            { id: nextId + 1, url: 'https://picsum.photos/400/300?random=11' },
            { id: nextId + 2, url: 'https://picsum.photos/400/300?random=12' },
        ];
        setPhotos([...photos, ...samplePhotos]);
        setNextId(nextId + 3);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'<'}</Text>
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
                    여행 사진의 URL을 입력하여 추가하세요.{'\n'}
                    추가된 사진은 AI가 분석하여 장소를 파악합니다.
                </Text>

                {/* URL 입력 영역 */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.urlInput}
                        placeholder="이미지 URL 입력"
                        placeholderTextColor="#999"
                        value={inputUrl}
                        onChangeText={setInputUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
                        <Text style={styles.addButtonText}>추가</Text>
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
                                        source={{ uri: photo.url }}
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
                    <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
                        <Text style={styles.analyzeButtonText}>사진 분석하기</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        fontSize: 24,
        color: '#2B2B2B',
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 18,
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
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    urlInput: {
        flex: 1,
        height: 48,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#333',
        marginRight: 8,
    },
    addButton: {
        width: 64,
        height: 48,
        backgroundColor: '#5B67CA',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
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
