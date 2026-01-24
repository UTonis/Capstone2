/**
 * MainScreen Styles - 메인 화면 스타일
 */

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = (width - 48) / 2;
export const SIDEBAR_WIDTH = width * 0.75;

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 10,
    },
    sidebar: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: '#FFFFFF',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 20,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
    },
    sidebarUserName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 13,
        color: '#888888',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 20,
    },
    menuContainer: {
        flex: 1,
        paddingTop: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    menuIcon: {
        fontSize: 22,
        marginRight: 16,
    },
    menuLabel: {
        fontSize: 16,
        color: '#333333',
    },
    bottomSection: {
        paddingBottom: 30,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    logoutText: {
        fontSize: 16,
        color: '#E74C3C',
    },
    loginButton: {
        backgroundColor: '#5B67CA',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 24,
        marginTop: 12,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    loginBottomButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    loginBottomText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    sidebarActionButton: {
        backgroundColor: '#5B67CA',
        borderRadius: 25,
        paddingVertical: 14,
        marginHorizontal: 20,
        marginTop: 16,
        alignItems: 'center',
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sidebarActionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    userNameHighlight: {
        color: '#5B67CA',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        letterSpacing: 2,
    },
    headerIcon: {
        padding: 8,
    },
    headerIconText: {
        fontSize: 22,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    searchIcon: {
        fontSize: 20,
        color: '#888888',
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333333',
        padding: 0,
    },
    scrollView: {
        flex: 1,
    },
    greetingSection: {
        paddingHorizontal: 16,
        paddingTop: 28,
        paddingBottom: 20,
    },
    greetingText: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    userName: {
        color: '#5B67CA',
        fontWeight: '600',
    },
    greetingSubtext: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    travelCard: {
        width: CARD_WIDTH,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    cardImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#E0E0E0',
    },
    cardOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
    },
    authorBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    authorText: {
        fontSize: 12,
        color: '#333333',
        fontWeight: '500',
    },
    listBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    listBadgeText: {
        fontSize: 12,
        color: '#333333',
        fontWeight: '500',
    },
    cardContent: {
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    cardLocation: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    promoBanner: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
        backgroundColor: '#FFF9E6',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    promoContent: {
        flex: 1,
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    promoSubtitle: {
        fontSize: 12,
        color: '#888888',
    },
    promoImageContainer: {
        marginLeft: 16,
    },
    promoEmoji: {
        fontSize: 40,
    },
    planButton: {
        marginHorizontal: 16,
        marginBottom: 24,
        backgroundColor: '#5B67CA',
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    planButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    recommendSection: {
        paddingTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    citiesContainer: {
        paddingHorizontal: 16,
    },
    cityCard: {
        marginRight: 12,
        alignItems: 'center',
    },
    cityImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
        backgroundColor: '#E0E0E0',
    },
    cityName: {
        fontSize: 13,
        color: '#333333',
        fontWeight: '500',
    },
});

export default styles;
