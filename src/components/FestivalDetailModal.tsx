/**
 * FestivalDetailModal - 축제 상세 정보 모달
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Dimensions,
    Linking,
} from 'react-native';
import { Festival } from '../data/mockData';
import { fetchFestivalDetail, FestivalDetail } from '../services/api';
import FestivalImage from './FestivalImage';

const { width, height } = Dimensions.get('window');

interface FestivalDetailModalProps {
    visible: boolean;
    festival: Festival | null;
    onClose: () => void;
}

function FestivalDetailModal({ visible, festival, onClose }: FestivalDetailModalProps) {
    const [detail, setDetail] = useState<FestivalDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && festival) {
            loadDetail(festival.id);
        } else {
            setDetail(null);
            setError(null);
        }
    }, [visible, festival]);

    const loadDetail = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchFestivalDetail(id);
            setDetail(data);
        } catch (err: any) {
            setError(err.message || '상세 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr || dateStr.length !== 8) return '';
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    };

    const dateDisplay = detail
        ? `${formatDate(detail.event_start_date)} ~ ${formatDate(detail.event_end_date)}`
        : festival?.date || '';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.modalContainer}>
                    {/* 상단 이미지 */}
                    {festival && (
                        <FestivalImage
                            uri={festival.image}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    )}

                    {/* 닫기 버튼 */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    {/* 콘텐츠 */}
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {/* 기본 정보 (Festival 객체에서) */}
                        <Text style={styles.title}>{festival?.name || ''}</Text>

                        <View style={styles.basicInfoRow}>
                            <Image source={require('../data/PIN Icon.png')} style={styles.pinIconImage} />
                            <Text style={styles.infoText}>{detail?.address || festival?.location || ''}</Text>
                        </View>

                        <View style={styles.basicInfoRow}>
                            <Text style={styles.infoIcon}>📅</Text>
                            <Text style={styles.infoText}>{dateDisplay}</Text>
                        </View>

                        {festival?.rating !== undefined && (
                            <View style={styles.basicInfoRow}>
                                <Text style={styles.infoIcon}>⭐</Text>
                                <Text style={styles.infoText}>{festival.rating}</Text>
                            </View>
                        )}

                        {/* API에서 가져온 상세 정보 */}
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#5B67CA" />
                                <Text style={styles.loadingText}>상세 정보 불러오는 중...</Text>
                            </View>
                        )}

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() => festival && loadDetail(festival.id)}
                                >
                                    <Text style={styles.retryButtonText}>다시 시도</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {detail && !loading && (
                            <>
                                {/* 소개 */}
                                {detail.description ? (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>소개</Text>
                                        <Text style={styles.sectionContent}>{detail.description}</Text>
                                    </View>
                                ) : null}

                                {/* 행사 장소 */}
                                {detail.event_place ? (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>행사 장소</Text>
                                        <Text style={styles.sectionContent}>{detail.event_place}</Text>
                                    </View>
                                ) : null}

                                {/* 행사 시간 */}
                                {detail.playtime ? (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>행사 시간</Text>
                                        <Text style={styles.sectionContent}>{detail.playtime}</Text>
                                    </View>
                                ) : null}

                                {/* 프로그램 */}
                                {detail.program ? (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>프로그램</Text>
                                        <Text style={styles.sectionContent}>{detail.program}</Text>
                                    </View>
                                ) : null}

                                {/* 이용 요금 */}
                                {detail.usetimefestival ? (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>이용 요금</Text>
                                        <Text style={styles.sectionContent}>{detail.usetimefestival}</Text>
                                    </View>
                                ) : null}

                                {/* 연락처 */}
                                {(detail.tel || detail.sponsor1tel) ? (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>연락처</Text>
                                        {detail.tel ? (
                                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${detail.tel.replace(/[^0-9-]/g, '')}`)}>
                                                <Text style={[styles.sectionContent, styles.linkText]}>📞 {detail.tel}</Text>
                                            </TouchableOpacity>
                                        ) : null}
                                        {detail.sponsor1 ? (
                                            <Text style={styles.sectionContent}>주최: {detail.sponsor1}</Text>
                                        ) : null}
                                        {detail.sponsor1tel ? (
                                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${detail.sponsor1tel.replace(/[^0-9-]/g, '')}`)}>
                                                <Text style={[styles.sectionContent, styles.linkText]}>📞 {detail.sponsor1tel}</Text>
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                ) : null}
                            </>
                        )}

                        {/* 하단 여백 */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.85,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: 200,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 16,
    },
    basicInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    pinIconImage: {
        width: 16,
        height: 16,
        marginRight: 8,
        resizeMode: 'contain',
    },
    infoText: {
        fontSize: 15,
        color: '#555555',
        flex: 1,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    loadingText: {
        fontSize: 14,
        color: '#888888',
        marginLeft: 8,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    errorText: {
        fontSize: 14,
        color: '#E74C3C',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#5B67CA',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 14,
        color: '#555555',
        lineHeight: 22,
        marginBottom: 4,
    },
    linkText: {
        color: '#5B67CA',
    },
});

export default FestivalDetailModal;
