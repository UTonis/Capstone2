import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedPlacesScreenProps {
    onBack: () => void;
}

const SavedPlacesScreen = ({ onBack }: SavedPlacesScreenProps) => {
    // 저장한 장소 데이터
    const savedPlaces = [
        {
            id: 1,
            name: '한라산 국립공원',
            location: '제주도',
            category: '자연',
            image: 'https://picsum.photos/400/300?random=30',
        },
        {
            id: 2,
            name: '해운대 해수욕장',
            location: '부산',
            category: '해변',
            image: 'https://picsum.photos/400/300?random=31',
        },
        {
            id: 3,
            name: '경복궁',
            location: '서울',
            category: '역사',
            image: 'https://picsum.photos/400/300?random=32',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>내 저장</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>저장한 장소 ({savedPlaces.length})</Text>
                {savedPlaces.map((place) => (
                    <TouchableOpacity key={place.id} style={styles.placeCard}>
                        <Image source={{ uri: place.image }} style={styles.placeImage} />
                        <View style={styles.placeInfo}>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{place.category}</Text>
                            </View>
                            <Text style={styles.placeName}>{place.name}</Text>
                            <Text style={styles.placeLocation}>📍 {place.location}</Text>
                        </View>
                        <TouchableOpacity style={styles.heartButton}>
                            <Text style={styles.heartIcon}>❤️</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 16,
    },
    placeCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    placeImage: {
        width: 100,
        height: 100,
    },
    placeInfo: {
        flex: 1,
        padding: 12,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    placeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    placeLocation: {
        fontSize: 13,
        color: '#666666',
    },
    heartButton: {
        padding: 12,
        justifyContent: 'center',
    },
    heartIcon: {
        fontSize: 20,
    },
});

export default SavedPlacesScreen;
