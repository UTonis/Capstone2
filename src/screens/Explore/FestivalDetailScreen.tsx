import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchFestivalDetail, FestivalDetail, Festival } from '../../services/api';

interface FestivalDetailScreenProps {
    festival: Festival | null;
    onBack: () => void;
}

const FestivalDetailScreen = ({ festival, onBack }: FestivalDetailScreenProps) => {
    const [detail, setDetail] = useState<FestivalDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDetail = async () => {
            if (!festival) return;
            try {
                const data = await fetchFestivalDetail(festival.id);
                setDetail(data);
            } catch (err: any) {
                // Ignore API detail error, we can still show basic info
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [festival]);



    if (!festival) return null;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr || dateStr.length !== 8) return '';
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    };

    const dateDisplay = detail?.event_start_date && detail?.event_end_date
        ? `${formatDate(detail.event_start_date)} ~ ${formatDate(detail.event_end_date)}`
        : festival.date || '';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} pointerEvents="none">축제 정보</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {festival.image ? (
                    <Image source={{ uri: festival.image }} style={styles.heroImage} resizeMode="cover" />
                ) : (
                    <View style={styles.heroImagePlaceholder}>
                        <Text style={styles.noImageText}>이미지 없음</Text>
                    </View>
                )}

                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{festival.name}</Text>

                    <View style={styles.basicInfoRow}>
                        <Image source={require('../../data/PIN Icon.png')} style={styles.pinIconImage} />
                        <Text style={styles.infoText}>{detail?.address || festival.location || ''}</Text>
                    </View>

                    <View style={styles.basicInfoRow}>
                        <Text style={styles.infoIcon}>📅</Text>
                        <Text style={styles.infoText}>{dateDisplay}</Text>
                    </View>

                    {/* API에서 가져온 추가 상세 정보 로딩 및 에러 */}
                    {loading && (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color="#5B67CA" />
                        </View>
                    )}

                    {detail && !loading && (
                        <>
                            {/* 소개 */}
                            {detail.description ? (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>소개</Text>
                                    <Text style={styles.sectionContent}>{detail.description.replace(/<[^>]+>/g, '')}</Text>
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
                                        <Text style={[styles.sectionContent, styles.linkText]}>📞 {detail.tel}</Text>
                                    ) : null}
                                    {detail.sponsor1 ? (
                                        <Text style={styles.sectionContent}>주최: {detail.sponsor1}</Text>
                                    ) : null}
                                    {detail.sponsor1tel ? (
                                        <Text style={[styles.sectionContent, styles.linkText]}>📞 {detail.sponsor1tel}</Text>
                                    ) : null}
                                </View>
                            ) : null}
                        </>
                    )}

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#666' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backButton: { padding: 4, zIndex: 10 },
    backButtonText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: {
        position: 'absolute', left: 0, right: 0, textAlign: 'center',
        fontSize: 18, fontWeight: '700', color: '#1A1A2E',
    },
    placeholder: { width: 40 },
    content: { flex: 1 },
    heroImage: { width: '100%', height: 250, backgroundColor: '#F5F5F5' },
    heroImagePlaceholder: { width: '100%', height: 250, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
    noImageText: { color: '#888' },
    infoContainer: { paddingHorizontal: 24, paddingTop: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#2B2B2B', marginBottom: 16 },
    basicInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoIcon: { fontSize: 16, marginRight: 8 },
    pinIconImage: { width: 16, height: 16, marginRight: 8, resizeMode: 'contain' },
    infoText: { fontSize: 15, color: '#555555', flex: 1 },
    section: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2B2B2B', marginBottom: 8 },
    sectionContent: { fontSize: 14, color: '#555555', lineHeight: 22, marginBottom: 4 },
    linkText: { color: '#5B67CA' },
});

export default FestivalDetailScreen;
