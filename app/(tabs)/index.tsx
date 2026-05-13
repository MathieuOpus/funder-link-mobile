import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { colors, fonts, spacing } from '@/theme';

type FeedFilter = 'all' | 'reviews' | 'articles' | 'myWatchlist' | 'myPipeline' | 'responses';

type FeedItem =
  | { type: 'review'; data: any; date: string }
  | { type: 'article'; data: any; date: string }
  | { type: 'response'; data: any; date: string }
  | { type: 'pipeline_alert'; data: any; date: string };

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'articles', label: 'Articles' },
  { key: 'myWatchlist', label: 'Watchlist' },
  { key: 'myPipeline', label: 'Pipeline' },
  { key: 'responses', label: 'Responses' },
];

function ScoreBanner({ score }: { score: any }) {
  if (!score) return null;
  const beaconScore = score.peak_beacon ?? score.matched_beacon ?? score.base_beacon ?? 0;
  const weightClass = score.weight_class
    ? score.weight_class.charAt(0).toUpperCase() + score.weight_class.slice(1)
    : 'Unranked';
  return (
    <TouchableOpacity style={styles.scoreBanner} activeOpacity={0.8}>
      <View style={styles.scoreArcWrap}>
        <Text style={styles.scoreNum}>{beaconScore}</Text>
      </View>
      <View style={styles.scoreDetails}>
        <Text style={styles.scoreClass}>{weightClass.toUpperCase()} · FTSO SCORE</Text>
        <Text style={styles.scoreLine}>
          <Text style={styles.scoreHighlight}>{score.company_name}</Text>
          {' · '}{score.qualified_count ?? 0} of 6 categories met
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted2} />
    </TouchableOpacity>
  );
}

function FilterBar({ active, onSelect }: { active: FeedFilter; onSelect: (f: FeedFilter) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={[styles.filterChip, active === f.key && styles.filterChipActive]}
          onPress={() => onSelect(f.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, active === f.key && styles.filterTextActive]}>{f.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function ReviewCard({ item }: { item: any }) {
  const name = item.target?.full_name || item.unclaimed_target?.full_name || 'Unknown Investor';
  const reviewerName = item.is_anonymous ? 'Anonymous founder' : (item.reviewer?.full_name || 'A founder');
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
  const rating = item.overall_rating ?? item.rating ?? null;
  return (
    <View style={[styles.card, styles.cardReview]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarSquare}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardAuthor}>{name}</Text>
          <Text style={styles.cardRole}>{reviewerName} filed a review</Text>
          <Text style={styles.cardTime}>{timeAgo}</Text>
        </View>
        {rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{parseFloat(rating).toFixed(1)}</Text>
            <Text style={styles.ratingStar}>★</Text>
          </View>
        )}
      </View>
      {item.content && <Text style={styles.cardBody} numberOfLines={3}>{item.content}</Text>}
      <View style={styles.reactions}>
        <Text style={styles.reactCount}></Text>
        <View style={styles.reactActions}>
          <TouchableOpacity style={styles.reactBtn}>
            <Ionicons name="eye-outline" size={16} color={colors.muted2} />
            <Text style={styles.reactBtnText}>Open review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactBtn}>
            <Ionicons name="bookmark-outline" size={16} color={colors.muted2} />
            <Text style={styles.reactBtnText}>Watchlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ArticleCard({ item, onDismiss }: { item: any; onDismiss: () => void }) {
  const timeAgo = formatDistanceToNow(new Date(item.published_at || item.created_at), { addSuffix: true });
  const preview = item.excerpt || (item.content ? item.content.slice(0, 200) + '…' : '');
  const hasPhoto = item.image_urls && item.image_urls.length > 0;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.author_photo_url ? (
          <Image source={{ uri: item.author_photo_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(item.author_name || 'F').charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.cardMeta}>
          <Text style={styles.cardAuthor}>{item.author_name || 'FundingTrace Editorial'}</Text>
          <View style={styles.tagRow}>
            {item.category && <View style={styles.tag}><Text style={styles.tagText}>{item.category.toUpperCase()}</Text></View>}
            <View style={styles.tag}><Text style={styles.tagText}>EDITORIAL</Text></View>
          </View>
          <Text style={styles.cardTime}>{timeAgo}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Ionicons name="close" size={16} color={colors.muted2} />
        </TouchableOpacity>
      </View>
      {item.title && <Text style={styles.articleTitle}>{item.title}</Text>}
      {preview ? <Text style={styles.cardBody} numberOfLines={3}>{preview}</Text> : null}
      {hasPhoto && <Image source={{ uri: item.image_urls[0] }} style={styles.articlePhoto} resizeMode="cover" />}
      <View style={styles.reactions}>
        {item.read_time_minutes ? <Text style={styles.reactCount}>{item.read_time_minutes} min read</Text> : <Text style={styles.reactCount}></Text>}
        <TouchableOpacity style={styles.reactBtn}>
          <Text style={[styles.reactBtnText, { color: colors.gold }]}>Read full post →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ResponseCard({ item }: { item: any }) {
  const name = item.responder?.full_name || 'An investor';
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
  return (
    <View style={[styles.card, styles.cardResponse]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardAuthor}>{name}</Text>
          <Text style={[styles.cardRole, { color: colors.teal }]}>Responded to a review</Text>
          <Text style={styles.cardTime}>{timeAgo}</Text>
        </View>
      </View>
      {item.response_text && <Text style={styles.cardBody} numberOfLines={2}>"{item.response_text}"</Text>}
      <View style={styles.reactions}>
        <Text style={styles.reactCount}></Text>
        <TouchableOpacity style={styles.reactBtn}>
          <Ionicons name="eye-outline" size={16} color={colors.muted2} />
          <Text style={styles.reactBtnText}>Open response</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PipelineAlertCard({ item }: { item: any }) {
  const name = item.target?.full_name || item.unclaimed_target?.full_name || 'Unknown';
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
  const rating = item.overall_rating ?? item.rating ?? null;
  return (
    <View style={[styles.card, styles.cardPipeline]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarSquare}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardAuthor}>{name}</Text>
          <Text style={[styles.cardRole, { color: colors.gold }]}>New review — in your pipeline</Text>
          <Text style={styles.cardTime}>{timeAgo}</Text>
        </View>
        {rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{parseFloat(rating).toFixed(1)}</Text>
            <Text style={styles.ratingStar}>★</Text>
          </View>
        )}
      </View>
      <View style={styles.reactions}>
        <Text style={styles.reactCount}></Text>
        <View style={styles.reactActions}>
          <TouchableOpacity style={styles.reactBtn}>
            <Ionicons name="eye-outline" size={16} color={colors.muted2} />
            <Text style={styles.reactBtnText}>Open review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactBtn}>
            <Ionicons name="git-branch-outline" size={16} color={colors.gold} />
            <Text style={[styles.reactBtnText, { color: colors.gold }]}>Pipeline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function EmptyState({ filter, onReset }: { filter: FeedFilter; onReset: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {filter !== 'all' ? 'Nothing here with this filter.' : 'Your feed will populate as activity happens.'}
      </Text>
      {filter !== 'all' && (
        <TouchableOpacity onPress={onReset} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>SHOW ALL</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [reviews, setReviews] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [pipelineIds, setPipelineIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [myScore, setMyScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    const uid = user!.id;
    try {
      const [revRes, articlesRes, respRes, wlRes, plRes, dismissRes] = await Promise.all([
        supabase.from('reviews').select('*, target:profiles!target_profile_id(full_name, company), unclaimed_target:unclaimed_profiles!target_unclaimed_id(full_name, firm)').order('created_at', { ascending: false }).limit(50),
        supabase.from('articles').select('*').eq('status', 'published').eq('format', 'short').order('published_at', { ascending: false }).limit(50),
        supabase.from('review_responses').select('*, responder:profiles!responder_id(full_name)').order('created_at', { ascending: false }).limit(50),
        supabase.from('watchlist').select('investor_profile_id, investor_unclaimed_id').eq('user_id', uid),
        supabase.from('pipeline_nodes').select('investor_profile_id, investor_unclaimed_id').eq('user_id', uid),
        supabase.from('dismissed_articles').select('article_id').eq('user_id', uid),
      ]);
      setReviews(revRes.data || []);
      setArticles(articlesRes.data || []);
      setResponses(respRes.data || []);
      setWatchlistIds(new Set((wlRes.data || []).map((w: any) => w.investor_profile_id || w.investor_unclaimed_id)));
      setPipelineIds(new Set((plRes.data || []).map((p: any) => p.investor_profile_id || p.investor_unclaimed_id)));
      setDismissedIds(new Set((dismissRes.data || []).map((d: any) => d.article_id)));
      if (profile?.account_type === 'venture') {
        const { data: startups } = await supabase.from('startups').select('id, company_name').eq('user_id', uid).order('created_at', { ascending: false }).limit(1);
        if (startups?.length) {
          const { data: scores } = await supabase.from('beacon_scores').select('matched_beacon, base_beacon, weight_class, qualified_count, startup_id').eq('startup_id', startups[0].id).order('created_at', { ascending: false }).limit(1);
          if (scores?.length) setMyScore({ ...scores[0], company_name: startups[0].company_name });
        }
      }
    } catch (e) {
      console.error('Feed fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissArticle = async (articleId: string) => {
    if (!user) return;
    await supabase.from('dismissed_articles').insert({ user_id: user.id, article_id: articleId });
    setDismissedIds((prev) => new Set(prev).add(articleId));
  };

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    const filteredArticles = articles.filter((a) => !dismissedIds.has(a.id));
    if (filter === 'all' || filter === 'reviews') reviews.forEach((r) => items.push({ type: 'review', data: r, date: r.created_at }));
    if (filter === 'all' || filter === 'articles') filteredArticles.forEach((a) => items.push({ type: 'article', data: a, date: a.published_at || a.created_at }));
    if (filter === 'all' || filter === 'responses') responses.forEach((r) => items.push({ type: 'response', data: r, date: r.created_at }));
    if (filter === 'myWatchlist') reviews.filter((r) => watchlistIds.has(r.target_profile_id) || watchlistIds.has(r.target_unclaimed_id)).forEach((r) => items.push({ type: 'review', data: r, date: r.created_at }));
    if (filter === 'myPipeline') reviews.filter((r) => pipelineIds.has(r.target_profile_id) || pipelineIds.has(r.target_unclaimed_id)).forEach((r) => items.push({ type: 'pipeline_alert', data: r, date: r.created_at }));
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [reviews, articles, responses, filter, watchlistIds, pipelineIds, dismissedIds]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Image source={require('../../assets/fundingtrace_logo.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topBarIcon}>
            <Ionicons name="notifications-outline" size={22} color={colors.muted} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <View style={styles.avatarSm}>
            <Text style={styles.avatarSmText}>{profile?.full_name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {profile?.account_type === 'venture' && <ScoreBanner score={myScore} />}
        <FilterBar active={filter} onSelect={setFilter} />
        <View style={styles.divider} />
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : feedItems.length === 0 ? (
          <EmptyState filter={filter} onReset={() => setFilter('all')} />
        ) : (
          feedItems.map((item, i) => {
            switch (item.type) {
              case 'review': return <ReviewCard key={`review-${item.data.id}-${i}`} item={item.data} />;
              case 'article': return <ArticleCard key={`article-${item.data.id}-${i}`} item={item.data} onDismiss={() => handleDismissArticle(item.data.id)} />;
              case 'response': return <ResponseCard key={`response-${item.data.id}-${i}`} item={item.data} />;
              case 'pipeline_alert': return <PipelineAlertCard key={`pipeline-${item.data.id}-${i}`} item={item.data} />;
              default: return null;
            }
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.border, backgroundColor: colors.bg },
  logoImage: { height: 22, width: 140 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  topBarIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.gold, borderWidth: 1.5, borderColor: colors.bg },
  avatarSm: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bg3, borderWidth: 0.5, borderColor: colors.border2, alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { fontFamily: fonts.interSemiBold, fontSize: 10, color: colors.gold },
  scoreBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, margin: spacing.md, backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border2, padding: spacing.md },
  scoreArcWrap: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  scoreNum: { fontFamily: fonts.interSemiBold, fontSize: 12, color: colors.gold },
  scoreDetails: { flex: 1 },
  scoreClass: { fontFamily: fonts.mono, fontSize: 8, color: colors.gold, letterSpacing: 0.8, marginBottom: 3 },
  scoreLine: { fontFamily: fonts.inter, fontSize: 12, color: colors.muted },
  scoreHighlight: { color: colors.cream, fontFamily: fonts.interMedium },
  filterRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 5, borderWidth: 0.5, borderColor: colors.border2 },
  filterChipActive: { borderColor: colors.gold, backgroundColor: colors.goldFaint },
  filterText: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted, letterSpacing: 0.4 },
  filterTextActive: { color: colors.gold },
  divider: { height: 0.5, backgroundColor: colors.border },
  card: { backgroundColor: colors.bg, borderBottomWidth: 0.5, borderBottomColor: colors.border, padding: spacing.xl, paddingBottom: spacing.md },
  cardReview: { borderLeftWidth: 2, borderLeftColor: colors.teal },
  cardResponse: { borderLeftWidth: 2, borderLeftColor: colors.teal },
  cardPipeline: { borderLeftWidth: 2, borderLeftColor: colors.gold },
  cardHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginBottom: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg3, borderWidth: 0.5, borderColor: colors.border2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarSquare: { width: 36, height: 36, borderRadius: 4, backgroundColor: colors.bg3, borderWidth: 0.5, borderColor: colors.border2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: fonts.interSemiBold, fontSize: 11, color: colors.gold },
  cardMeta: { flex: 1 },
  cardAuthor: { fontFamily: fonts.interMedium, fontSize: 13, color: colors.cream, marginBottom: 1 },
  cardRole: { fontFamily: fonts.inter, fontSize: 12, color: colors.muted },
  cardTime: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted2, letterSpacing: 0.3, marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: colors.bg3, padding: spacing.xs, flexShrink: 0 },
  ratingText: { fontFamily: fonts.interSemiBold, fontSize: 13, color: colors.gold },
  ratingStar: { fontSize: 10, color: colors.gold },
  tagRow: { flexDirection: 'row', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  tag: { borderWidth: 0.5, borderColor: colors.border2, paddingHorizontal: 5, paddingVertical: 2 },
  tagText: { fontFamily: fonts.mono, fontSize: 8, color: colors.muted, letterSpacing: 0.4 },
  dismissBtn: { padding: 4, flexShrink: 0 },
  cardBody: { fontFamily: fonts.inter, fontSize: 14, color: colors.cream, lineHeight: 20, marginBottom: spacing.sm },
  articleTitle: { fontFamily: fonts.interSemiBold, fontSize: 15, color: colors.cream, lineHeight: 22, marginBottom: spacing.sm },
  articlePhoto: { width: '100%', height: 160, marginBottom: spacing.sm, backgroundColor: colors.bg3 },
  reactions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 0.5, borderTopColor: colors.border, marginTop: spacing.xs },
  reactCount: { fontFamily: fonts.inter, fontSize: 11, color: colors.muted2 },
  reactActions: { flexDirection: 'row', gap: spacing.md },
  reactBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reactBtnText: { fontFamily: fonts.inter, fontSize: 11, color: colors.muted2 },
  emptyState: { padding: spacing.xl, alignItems: 'center', marginTop: 40 },
  emptyText: { fontFamily: fonts.inter, fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: spacing.md },
  emptyBtn: { borderWidth: 0.5, borderColor: colors.border2, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  emptyBtnText: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted, letterSpacing: 0.6 },
});
