/**
 * PlannerChatScreen - AI 일정 채팅 수정 화면
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { plannerChat, PlannerChatMessage, getLatestChatHistoryByTrip } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PlannerChatScreenProps {
    tripId: number;
    tripTitle: string;
    onBack: () => void;
}

interface ChatBubble {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

function PlannerChatScreen({ tripId, tripTitle, onBack }: PlannerChatScreenProps) {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [messages, setMessages] = useState<ChatBubble[]>([
        { id: '0', role: 'assistant', content: `"${tripTitle}" 일정을 도와드릴게요! 수정하고 싶은 부분을 알려주세요.\n\n예시:\n• "2일차에 해운대 추가해줘"\n• "카페 일정을 오전으로 옮겨줘"\n• "전체 일정을 최적화해줘"` },
    ]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [sessionId, setSessionId] = useState<number | undefined>(undefined);
    const [initialLoading, setInitialLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    // 이전 대화 기록 불러오기
    React.useEffect(() => {
        const loadHistory = async () => {
            if (!token || !tripId) return;
            try {
                const history = await getLatestChatHistoryByTrip(token, tripId);
                if (history && history.messages && history.messages.length > 0) {
                    setSessionId(history.session_id);
                    const formattedMsgs: ChatBubble[] = history.messages.map((m, idx) => ({
                        id: `hist-${idx}`,
                        role: m.role,
                        content: m.content
                    }));
                    setMessages(prev => [prev[0], ...formattedMsgs]);
                }
            } catch (err) {
                console.log('채팅 히스토리가 없거나 불러오기 실패:', err);
            } finally {
                setInitialLoading(false);
            }
        };
        loadHistory();
    }, [token, tripId]);

    const chatHistory: PlannerChatMessage[] = messages
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, content: m.content }));

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || sending || !token) return;

        const userMsg: ChatBubble = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setSending(true);

        try {
            const response = await plannerChat(token, tripId, userMsg.content, sessionId);
            setSessionId(response.session_id);
            const assistantMsg: ChatBubble = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            const errorMsg: ChatBubble = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.',
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setSending(false);
        }
    }, [inputText, sending, token, tripId]);

    const renderMessage = ({ item }: { item: ChatBubble }) => (
        <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {item.role === 'assistant' && <Text style={styles.aiLabel}>AI 플래너</Text>}
            {item.id === 'loading' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
                    <ActivityIndicator size="small" color="#5B67CA" />
                    <Text style={[styles.bubbleText, { marginLeft: 8, color: '#888' }]}>{item.content}</Text>
                </View>
            ) : (
                <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>{item.content}</Text>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.backButtonText}>뒤로</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>AI 일정 수정</Text>
                    <View style={{ width: 50 }} />
                </View>

                {/* 채팅 목록 */}
                <FlatList
                    ref={flatListRef}
                    style={{ flex: 1 }}
                    inverted
                    data={sending
                        ? [{ id: 'loading', role: 'assistant', content: '일정을 수정중입니다.' }, ...[...messages].reverse()]
                        : [...messages].reverse()
                    }
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatList}
                />

                {/* 입력 영역 */}
                <View style={[styles.inputArea, { paddingBottom: insets.bottom > 20 ? insets.bottom : 8 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="수정할 내용을 입력하세요..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        editable={!sending}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                    >
                        <Text style={[styles.sendText, { fontSize: 24, marginBottom: 2 }]}>↑</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButtonText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 28, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 8 },
    chatList: { padding: 16, paddingBottom: 8 },
    bubble: { maxWidth: '85%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 22, marginBottom: 12 },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#5B67CA' },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
    aiLabel: { fontSize: 12, color: '#5B67CA', fontWeight: '700', marginBottom: 6, marginLeft: 2 },
    bubbleText: { fontSize: 15, lineHeight: 22, color: '#333' },
    userText: { color: '#FFF' },
    inputArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    input: { flex: 1, backgroundColor: '#F5F6FA', borderRadius: 25, paddingHorizontal: 18, paddingVertical: 10, fontSize: 15, color: '#1A1A2E', maxHeight: 100 },
    sendBtn: { marginLeft: 10, backgroundColor: '#5B67CA', borderRadius: 25, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
    sendDisabled: { backgroundColor: '#C0C5E0' },
    sendText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default PlannerChatScreen;
