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

interface MyTripsScreenProps {
    onBack: () => void;
}

const MyTripsScreen = ({ onBack }: MyTripsScreenProps) => {
    // 내 여행 목록 데이터
    const trips = [
        {
            id: 1,
            destination: '제주도',
            dates: '2024.02.15 - 02.18',
            status: '예정',
            image: 'https://picsum.photos/400/300?random=20',
        },
        {
            id: 2,
            destination: '부산',
            dates: '2024.01.10 - 01.12',
            status: '완료',
            image: 'https://picsum.photos/400/300?random=21',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>내 여행</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {trips.map((trip) => (
                    <TouchableOpacity key={trip.id} style={styles.tripCard}>
                        <Image source={{ uri: trip.image }} style={styles.tripImage} />
                        <View style={styles.tripInfo}>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{trip.status}</Text>
                            </View>
                            <Text style={styles.destination}>{trip.destination}</Text>
                            <Text style={styles.dates}>{trip.dates}</Text>
                        </View>
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
    tripCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tripImage: {
        width: '100%',
        height: 180,
    },
    tripInfo: {
        padding: 16,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    destination: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    dates: {
        fontSize: 14,
        color: '#888888',
    },
});

export default MyTripsScreen;
