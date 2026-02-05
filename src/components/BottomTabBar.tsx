/**
 * Bottom Tab Bar Component - 하단 네비게이션
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 아이콘 이미지 import
const HomeIcon = require('../data/Home.png');
const RecommandIcon = require('../data/Recommand.png');
const CameraIcon = require('../data/Cammera.png');
const CalendarIcon = require('../data/callender.png');
const HumanIcon = require('../data/Human.png');

type TabName = 'home' | 'recommend' | 'photos' | 'schedule' | 'profile';

interface BottomTabBarProps {
    activeTab: TabName;
    onTabPress: (tab: TabName) => void;
}

interface TabItemProps {
    icon: any;
    label: string;
    isActive: boolean;
    onPress: () => void;
    isCenter?: boolean;
}

function TabItem({ icon, label, isActive, onPress, isCenter }: TabItemProps) {
    return (
        <TouchableOpacity
            style={[styles.tabItem, isCenter && styles.centerTabItem]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {isCenter ? (
                <View style={styles.centerIconContainer}>
                    <Image
                        source={icon}
                        style={styles.centerIcon}
                        resizeMode="contain"
                    />
                </View>
            ) : (
                <Image
                    source={icon}
                    style={[styles.tabIcon, isActive && styles.tabIconActive]}
                    resizeMode="contain"
                />
            )}
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <View style={styles.tabsWrapper}>
                <TabItem
                    icon={HomeIcon}
                    label="홈"
                    isActive={activeTab === 'home'}
                    onPress={() => onTabPress('home')}
                />
                <TabItem
                    icon={RecommandIcon}
                    label="추천"
                    isActive={activeTab === 'recommend'}
                    onPress={() => onTabPress('recommend')}
                />
                <TabItem
                    icon={CameraIcon}
                    label="사진"
                    isActive={activeTab === 'photos'}
                    onPress={() => onTabPress('photos')}
                    isCenter={true}
                />
                <TabItem
                    icon={CalendarIcon}
                    label="일정"
                    isActive={activeTab === 'schedule'}
                    onPress={() => onTabPress('schedule')}
                />
                <TabItem
                    icon={HumanIcon}
                    label="마이페이지"
                    isActive={activeTab === 'profile'}
                    onPress={() => onTabPress('profile')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
    },
    tabsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingTop: 10,
        paddingBottom: 6,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    centerTabItem: {
        marginTop: -20,
    },
    centerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    tabIcon: {
        width: 24,
        height: 24,
        marginBottom: 4,
        opacity: 0.5,
    },
    tabIconActive: {
        opacity: 1,
    },
    centerIcon: {
        width: 28,
        height: 28,
    },
    tabLabel: {
        fontSize: 10,
        color: '#999999',
        fontWeight: '500',
    },
    tabLabelActive: {
        color: '#5B67CA',
        fontWeight: '600',
    },
});

export type { TabName };
export default BottomTabBar;


