import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from "../../theme";


const dataDnDKey = [
    {
        id: "a",
        text: "A: An châu",
    },
    {
        id: 'b',
        text: "B: Bắc cạn",
    },
    {
        id: 'c',
        text: "C: Cao bằng",
    },
    {
        id: 'd',
        text: "D: Đáp cầu",
    }
]

const dataDnDNumber = [
    {
        id: '1',
        text: "1: Một",
    },
    {
        id: '2',
        text: "2: Hai",
    }
]

const handlePressKey = (id: any) => {
    Alert.alert("Nút ", "id: " + id, [
        { text: "OK" }
    ]);
    //Play sound DnD
}

function DnDScreen() {
    const [state, setState] = useState(0)
    useEffect(() => {
        console.log("state: ", state)
    }, [state])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tic ta</Text>

            <Text style={styles.header}>Chữ cái</Text>

            {
                dataDnDKey.map((item, index) => {
                    return (
                        <TouchableOpacity key={index} style={styles.button} onPress={() => {
                            handlePressKey(item.id)
                        }}>
                            <Text style={{
                                textAlign: 'center',
                                color: colors.text
                            }}>{item.text}</Text>
                        </TouchableOpacity>
                    )
                })
            }

            <Text style={styles.header}>Số</Text>
            {
                dataDnDNumber.map((item, index) => {
                    return (
                        <TouchableOpacity key={index} style={styles.button} onPress={() => {
                            handlePressKey(item.id)
                        }}>                            <Text style={{
                            textAlign: 'center',
                            color: colors.text
                        }}>{item.text}</Text>
                        </TouchableOpacity>
                    )
                })
            }

            <Text style={styles.header}>Ký hiệu đặc biệt</Text>
            {
                dataDnDNumber.map((item, index) => {
                    return (
                        <TouchableOpacity key={index} style={styles.button} onPress={() => {
                            handlePressKey(item.id)
                        }}>                            <Text style={{
                            textAlign: 'center',
                            color: colors.text
                        }}>{item.text}</Text>
                        </TouchableOpacity>
                    )
                })
            }

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
    button: {
        borderRadius: 8,
        padding: 10,
        justifyContent: "center",
        backgroundColor: colors.success,
        margin: 12
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.text,
        textAlign: "center"
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        textAlign: 'center',

    },
    header: {
        fontSize: 18,
        fontWeight: 500,
    }

})

export default DnDScreen