import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';

function ElectricPanelScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Bảng điện</Text>
            <Text style={styles.subTitle}>
                Luyện tập và kiểm tra kỹ năng báo vụ
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 60,
    },
});

export default ElectricPanelScreen;
