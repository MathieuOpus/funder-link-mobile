import { useAuth } from '@/contexts/AuthContext';

export type Tier = 'free' | 'incubatoru_lite' | 'incubatoru' | 'investor_pro';

export interface Entitlements {
  tier: Tier;
  isActive: boolean;
  isPaid: boolean;
  isPro: boolean;
  isIncubatorU: boolean;
  isIncubatorULite: boolean;
  canUseMyStartup: boolean;
  canUseDataRoom: boolean;
  canUseTeam: boolean;
  canUseFundDirectory: boolean;
  canUseTools: boolean;
  canUseBusinessPlan: boolean;
  canUsePitchAddendum: boolean;
  canUseGrants: boolean;
  pipelineNodeCap: number;
  ftsoCadenceDays: number;
  ftsoLifetimeOnly: boolean;
  monthlyGenerationCap: number;
  canSeeStartupScore: boolean;
  canOpenStartupProfile: boolean;
}

export function useEntitlements(): Entitlements {
  const { profile } = useAuth();
  const tier = (profile?.subscription_tier as Tier | undefined) ?? 'free';
  const status = (profile?.subscription_status as string | undefined) ?? 'inactive';
  const accountType = profile?.account_type as 'venture' | 'funding' | undefined;

  const isActive = status === 'active' || status === 'trialing';
  const isPro = isActive && tier === 'investor_pro';
  const isIncubatorU = isActive && tier === 'incubatoru';
  const isIncubatorULite = isActive && (tier === 'incubatoru' || tier === 'incubatoru_lite');
  const isPaid = isActive && tier !== 'free';
  const isVenture = accountType === 'venture';

  return {
    tier,
    isActive,
    isPaid,
    isPro,
    isIncubatorU,
    isIncubatorULite,
    canUseMyStartup: isVenture,
    canUseDataRoom: isVenture && isIncubatorULite,
    canUseTeam: isVenture && isIncubatorULite,
    canUseFundDirectory: isVenture && isIncubatorULite,
    canUseTools: isVenture && isIncubatorU,
    canUseBusinessPlan: isVenture && isIncubatorU,
    canUsePitchAddendum: isVenture && isIncubatorU,
    canUseGrants: isVenture,
    pipelineNodeCap: isIncubatorULite ? 200 : 10,
    ftsoCadenceDays: isIncubatorU ? 7 : isIncubatorULite ? 14 : Number.POSITIVE_INFINITY,
    ftsoLifetimeOnly: !isIncubatorULite,
    monthlyGenerationCap: isIncubatorU ? 50 : 0,
    canSeeStartupScore: isPro,
    canOpenStartupProfile: isPro,
  };
}