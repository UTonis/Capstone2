import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
    ScrollView,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    searchPlacesDb,
    searchFestivals,
    fetchPosts,
    SearchDbPlace,
    Festival,
    BoardPostSummary,
    BoardPostListResponse
} from '../../services/api';

const { width } = Dimensions.get('window');

interface SearchResultsScreenProps {
    searchQuery: string;
    onBack: () => void;
    onSelectPlace?: (place: SearchDbPlace) => void;
    onSelectFestival?: (festival: Festival) => void;
    onSelectPost?: (id: number) => void;
}

type SearchCategory = 'all' | 'place' | 'festival' | 'board';

const SearchResultsScreen = ({ searchQuery, onBack, onSelectPlace, onSelectFestival, onSelectPost }: SearchResultsScreenProps) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<SearchCategory>('all');
    const [loading, setLoading] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchQuery);

    const [places, setPlaces] = useState<SearchDbPlace[]>([]);
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [posts, setPosts] = useState<BoardPostSummary[]>([]);

    useEffect(() => {
        if (searchQuery) {
            setLocalQuery(searchQuery);
            fetchAllResults(searchQuery);
        }
    }, [searchQuery]);

    const handleSearch = () => {
        if (!localQuery.trim()) return;
        fetchAllResults(localQuery.trim());
    };

    const fetchAllResults = async (query: string) => {
        setLoading(true);

        // 후기: 전체 불러온 뒤 클라이언트 키워드 필터링
        let boardItems: BoardPostSummary[] = [];
        try {
            const boardRes: BoardPostListResponse = await fetchPosts(1, 50, undefined, undefined);
            const lowerQuery = query.toLowerCase();
            boardItems = (boardRes.items || []).filter(p =>
                p.title.toLowerCase().includes(lowerQuery) ||
                (p.content_preview && p.content_preview.toLowerCase().includes(lowerQuery)) ||
                (p.region && p.region.toLowerCase().includes(lowerQuery)) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(lowerQuery)))
            );
        } catch (e) {
            console.log('Board search failed:', e);
        }

        // 장소 검색 (독립)
        let placeItems: SearchDbPlace[] = [];
        try {
            const placeRes = await searchPlacesDb(query, 20);
            placeItems = placeRes.places || [];
        } catch (e) {
            console.log('Place search failed:', e);
        }

        // 축제 검색 (독립)
        let festivalItems: Festival[] = [];
        try {
            const festivalRes = await searchFestivals({ keyword: query, max_items: 20 });
            festivalItems = festivalRes.festivals || [];
        } catch (e) {
            console.log('Festival search failed:', e);
        }

        setPlaces(placeItems);
        setFestivals(festivalItems);
        setPosts(boardItems);
        setLoading(false);
    };

    const renderPlaceItem = ({ item }: { item: SearchDbPlace }) => (
        <TouchableOpacity style={styles.card} onPress={() => onSelectPlace?.(item)}>
            <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
                <Text style={styles.categoryText}>{item.category || '장소'}</Text>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardAddress} numberOfLines={1}>📍 {item.address}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderFestivalItem = ({ item }: { item: Festival }) => (
        <TouchableOpacity style={styles.card} onPress={() => onSelectFestival?.(item)}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
                <Text style={[styles.categoryText, { color: '#FF6B6B' }]}>축제</Text>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardAddress} numberOfLines={1}>📅 {item.date}</Text>
                <Text style={styles.cardAddress} numberOfLines={1}>📍 {item.location}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderPostItem = ({ item }: { item: BoardPostSummary }) => (
        <TouchableOpacity style={styles.card} onPress={() => onSelectPost?.(item.id)}>
            <Image source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
                <Text style={[styles.categoryText, { color: '#4CAF50' }]}>여행 후기</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardAddress} numberOfLines={1}>👤 {item.author.nickname || '익명'}</Text>
                <Text style={styles.cardAddress} numberOfLines={1}>💬 {item.comment_count}  ❤️ {item.like_count}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderAllView = () => {
        const hasResults = places.length > 0 || festivals.length > 0 || posts.length > 0;

        if (!hasResults) {
            return (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                </View>
            );
        }

        return (
            <ScrollView contentContainerStyle={styles.list}>
                {places.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>장소 ({places.length})</Text>
                            <TouchableOpacity onPress={() => setActiveTab('place')}>
                                <Text style={styles.moreBtn}>더보기 ›</Text>
                            </TouchableOpacity>
                        </View>
                        {places.slice(0, 3).map(item => (
                            <View key={item.id}>{renderPlaceItem({ item })}</View>
                        ))}
                    </View>
                )}

                {festivals.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>축제 ({festivals.length})</Text>
                            <TouchableOpacity onPress={() => setActiveTab('festival')}>
                                <Text style={styles.moreBtn}>더보기 ›</Text>
                            </TouchableOpacity>
                        </View>
                        {festivals.slice(0, 3).map(item => (
                            <View key={item.id}>{renderFestivalItem({ item })}</View>
                        ))}
                    </View>
                )}

                {posts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>후기 ({posts.length})</Text>
                            <TouchableOpacity onPress={() => setActiveTab('board')}>
                                <Text style={styles.moreBtn}>더보기 ›</Text>
                            </TouchableOpacity>
                        </View>
                        {posts.slice(0, 3).map(item => (
                            <View key={item.id}>{renderPostItem({ item })}</View>
                        ))}
                    </View>
                )}
            </ScrollView>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <View style={styles.searchBarWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="전체 검색 (장소, 축제, 후기)"
                        value={localQuery}
                        onChangeText={setLocalQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoFocus={!searchQuery}
                    />
                    <TouchableOpacity onPress={handleSearch} style={styles.searchIconBtn}>
                        <Text style={styles.searchIcon}>⌕</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.hintContainer}>
                <Text style={styles.hintText}>💡 통합 검색은 장소, 축제, 후기를 모두 찾아드립니다.</Text>
            </View>

            <View style={styles.tabBar}>
                {[
                    { key: 'all', label: '전체', count: (places?.length || 0) + (festivals?.length || 0) + (posts?.length || 0) },
                    { key: 'place', label: '장소', count: places?.length || 0 },
                    { key: 'festival', label: '축제', count: festivals?.length || 0 },
                    { key: 'board', label: '후기', count: posts?.length || 0 }
                ].map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                        onPress={() => setActiveTab(tab.key as SearchCategory)}
                    >
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
                            {tab.label}
                        </Text>
                        <Text style={[styles.tabCount, activeTab === tab.key && styles.activeTabCount]}>
                            {tab.count}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#5B67CA" />
                </View>
            ) : activeTab === 'all' ? (
                renderAllView()
            ) : (
                <FlatList
                    data={activeTab === 'place' ? places : activeTab === 'festival' ? festivals : posts}
                    renderItem={activeTab === 'place' ? renderPlaceItem as any : activeTab === 'festival' ? renderFestivalItem as any : renderPostItem as any}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    searchBarWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F6FA', borderRadius: 12, paddingHorizontal: 12, height: 44, marginLeft: 4 },
    searchInput: { flex: 1, fontSize: 15, color: '#1A1A2E', paddingVertical: 8 },
    searchIconBtn: { padding: 4 },
    searchIcon: { fontSize: 22, color: '#5B67CA', fontWeight: 'bold' },
    hintContainer: { backgroundColor: '#F0F2FF', paddingVertical: 8, paddingHorizontal: 16 },
    hintText: { fontSize: 12, color: '#5B67CA', textAlign: 'center' },
    tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#5B67CA' },
    tabLabel: { fontSize: 14, color: '#999', fontWeight: '600' },
    activeTabLabel: { color: '#5B67CA' },
    tabCount: { fontSize: 11, color: '#BBB' },
    activeTabCount: { color: '#5B67CA', fontWeight: '700' },
    list: { padding: 16 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
    moreBtn: { fontSize: 14, color: '#5B67CA', fontWeight: '600' },
    card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardImage: { width: 100, height: 100 },
    cardInfo: { flex: 1, padding: 12, justifyContent: 'center' },
    categoryText: { fontSize: 12, fontWeight: '700', color: '#5B67CA', marginBottom: 4 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
    cardAddress: { fontSize: 13, color: '#666', marginBottom: 2 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999' },
});

export default SearchResultsScreen;
