import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export interface CustomAlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    buttons: CustomAlertButton[];
    onClose: () => void;
}

const CustomAlert = ({ visible, title, message, buttons, onClose }: CustomAlertProps) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <View style={styles.contentContainer}>
                        {title ? <Text style={styles.title}>{title}</Text> : null}
                        <Text style={styles.message}>{message}</Text>
                    </View>

                    <View style={styles.buttonRow}>
                        {buttons.length === 0 ? (
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.primaryButtonText}>확인</Text>
                            </TouchableOpacity>
                        ) : (
                            buttons.map((btn, index) => {
                                const isPrimary = btn.style !== 'cancel';
                                const isLast = index === buttons.length - 1;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            isPrimary ? styles.primaryButton : styles.secondaryButton,
                                            !isLast && { marginRight: 10 },
                                            buttons.length > 2 && { width: '100%', marginRight: 0, marginBottom: 10 }
                                        ]}
                                        onPress={() => {
                                            btn.onPress?.();
                                            onClose();
                                        }}
                                    >
                                        <Text style={isPrimary ? styles.primaryButtonText : styles.secondaryButtonText}>
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    alertContainer: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    button: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100,
    },
    primaryButton: {
        backgroundColor: '#5B67CA',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#F0F2FF',
    },
    secondaryButtonText: {
        color: '#5B67CA',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomAlert;
