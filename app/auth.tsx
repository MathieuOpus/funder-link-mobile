import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { colors, fonts, spacing } from '@/theme';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      router.replace('/(tabs)');
    }
  }, [loading, user, profile]);

  const handleOAuth = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
    setOauthLoading(provider);
    setError(null);

    try {
      const redirectTo = __DEV__
        ? 'exp://192.168.2.14:8081'
        : makeRedirectUri({ scheme: 'fundingtrace' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else {
          // Try extracting from hash fragment
          const hash = result.url.split('#')[1];
          if (hash) {
            const params = new URLSearchParams(hash);
            const at = params.get('access_token');
            const rt = params.get('refresh_token');
            if (at && rt) {
              await supabase.auth.setSession({ access_token: at, refresh_token: rt });
            }
          }
        }
      }
    } catch (e: any) {
      setError(e.message || 'Sign in failed. Please try again.');
    } finally {
      setOauthLoading(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.gold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Image
            source={require('../assets/fundingtrace_logo.png')}
            style={styles.logoWordmark}
            resizeMode="contain"
          />
        </View>

        {/* Headline */}
        <View style={styles.headlineWrap}>
          <Text style={styles.headline}>Know where you stand.</Text>
          <Text style={styles.subline}>Raise with confidence.</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* OAuth buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.oauthBtn}
            onPress={() => handleOAuth('google')}
            disabled={!!oauthLoading}
            activeOpacity={0.8}
          >
            <GoogleIcon />
            <Text style={styles.oauthBtnText}>
              {oauthLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
            </Text>
            {oauthLoading === 'google' && <ActivityIndicator size="small" color={colors.muted} style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.oauthBtn}
            onPress={() => handleOAuth('linkedin_oidc')}
            disabled={!!oauthLoading}
            activeOpacity={0.8}
          >
            <LinkedInIcon />
            <Text style={styles.oauthBtnText}>
              {oauthLoading === 'linkedin_oidc' ? 'Connecting…' : 'Continue with LinkedIn'}
            </Text>
            {oauthLoading === 'linkedin_oidc' && <ActivityIndicator size="small" color={colors.muted} style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.oauthBtn}
            onPress={() => handleOAuth('github')}
            disabled={!!oauthLoading}
            activeOpacity={0.8}
          >
            <GitHubIcon />
            <Text style={styles.oauthBtnText}>
              {oauthLoading === 'github' ? 'Connecting…' : 'Continue with GitHub'}
            </Text>
            {oauthLoading === 'github' && <ActivityIndicator size="small" color={colors.muted} style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>

      </View>
    </SafeAreaView>
  );
}

// ── SVG Icons as components ────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <View style={styles.iconWrap}>
      <Text style={styles.iconG}>G</Text>
    </View>
  );
}

function LinkedInIcon() {
  return (
    <View style={[styles.iconWrap, { backgroundColor: '#0A66C2' }]}>
      <Text style={[styles.iconG, { color: '#fff' }]}>in</Text>
    </View>
  );
}

function GitHubIcon() {
  return (
    <View style={[styles.iconWrap, { backgroundColor: '#24292E' }]}>
      <Text style={[styles.iconG, { color: '#fff', fontSize: 11 }]}>GH</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  logoIcon: {
    width: 72,
    height: 72,
  },
  logoWordmark: {
    width: 200,
    height: 34,
  },
  headlineWrap: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  headline: {
    fontFamily: fonts.playfair,
    fontSize: 26,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: 4,
  },
  subline: {
    fontFamily: fonts.playfair,
    fontSize: 26,
    color: colors.gold,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(226,75,74,0.1)',
    borderWidth: 0.5,
    borderColor: colors.danger,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.inter,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
  buttons: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg3,
    borderWidth: 0.5,
    borderColor: colors.border2,
    padding: spacing.lg,
    height: 52,
  },
  oauthBtnText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.3,
    flex: 1,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.bg4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconG: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cream,
  },
  terms: {
    fontFamily: fonts.inter,
    fontSize: 10,
    color: colors.muted2,
    textAlign: 'center',
    lineHeight: 15,
  },
});
