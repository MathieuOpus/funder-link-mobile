import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '@/theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.label}>PROFILE</Text>
        <Text style={styles.coming}>Coming next</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.mono, fontSize: 9, color: colors.goldDim, letterSpacing: 1, marginBottom: 8 },
  coming: { fontFamily: fonts.playfair, fontSize: 24, color: colors.cream },
});