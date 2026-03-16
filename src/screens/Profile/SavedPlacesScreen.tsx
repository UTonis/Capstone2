import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import SearchImage from '../../components/SearchImage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedPlacesScreenProps {
    onBack: () => void;
}

const SavedPlacesScreen = ({ onBack }: SavedPlacesScreenProps) => {
    // 저장한 장소 데이터
    const savedPlaces: any[] = [];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>내 저장</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>저장한 장소 ({savedPlaces.length})</Text>
                {savedPlaces.map((place) => (
                    <TouchableOpacity key={place.id} style={styles.placeCard}>
                        <SearchImage imageUrl={place.image} style={styles.placeImage} />
                        <View style={styles.placeInfo}>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{place.category}</Text>
                            </View>
                            <Text style={styles.placeName}>{place.name}</Text>
                            <View style={styles.locationRow}>
                                <Image source={require('../../data/PIN Icon.png')} style={styles.pinIcon} />
                                <Text style={styles.placeLocation}>{place.location}</Text>
                            </View>
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
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pinIcon: {
        width: 12,
        height: 12,
        resizeMode: 'contain',
        marginRight: 4,
    },
});

export default SavedPlacesScreen;
