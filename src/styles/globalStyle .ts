import { StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();

export const globalStyle = StyleSheet.create({
    container: {
      
        flex: 1,
        backgroundColor: Colors.neutral.background,
    }
})