import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/theme';

type FeedCardType = 'signal' | 'review' | 'score' | 'article';

interface FeedItem {
  id: string;
  type: FeedCardType;
  author: string;
  authorInitials: string;
  authorRole: string;
  time: string;
  body: string;
  highlight?: string;
  embed?: { label: string; title: string; body: string; };
  reactions: number;
  isPrivate?: boolean;
}

const FEED_ITEMS: FeedItem[] = [
  {
    id: '1',
    type: 'signal',
    author: 'Sequoia Capital',
    authorInitials: 'SEQ',
    authorRole: 'Venture Capital · Series A–C',
    time: '2 hours ago',
    body: 'This signal is only visible to you.',
    highlight: 'Add Sequoia to your pipeline to track further engagement.',
    embed: { label: 'Investor activity · private', title: 'Viewed your startup profile', body: 'Second visit this week. Most active between 2–4pm EST.' },
    reactions: 0,
    isPrivate: true,
  },
  {
    id: '2',
    type: 'review',
    author: 'Rachel Johnson',
    authorInitials: 'RJ',
    authorRole: 'Founder, Meridian · Seed stage',
    time: 'Yesterday',
    body: 'Left a review on Andreessen Horowitz after closing our seed round.',
    embed: { label: 'Investor review · 4.2 stars', title: 'Andreessen Horowitz', body: '"They actually read the deck before the call. Rare. Response time was 48h."' },
    reactions: 14,
  },
  {
    id: '3',
    type: 'score',
    author: 'David Kim',
    authorInitials: 'DK',
    authorRole: 'Founder, Arkon AI · Pre-seed',
    time: '2 days ago',
    body: 'Crossed into Surge class after uploading traction evidence last week.',
    reactions: 31,
  },
  {
    id: '4',
    type: 'article',
    author: 'FundingTrace Editorial',
    authorInitials: 'FT',
    authorRole: 'Dan Shapiro · Staff writer',
    time: '3 days ago',
    body: 'Why your distribution score is hurting your raise more than your product gap.',
    reactions: 87,
  },
];

const FILTERS = ['All', 'Signals', 'Reviews', 'Scores', 'Editorial'];

const embedBorderColor: Record<FeedCardType, string> = {
  signal: colors.gold,
  review: colors.teal,
  score: colors.goldDim,
  article: colors.border2,
};

function ScoreBanner() {
  return (
    <TouchableOpacity style={styles.scoreBanner} activeOpacity={0.8}>
      <View style={styles.scoreArcWrap}>
        <Text style={styles.scoreNum}>621</Text>
      </View>
      <View style={styles.scoreDetails}>
        <Text style={styles.scoreClass}>BEACON · FTSO SCORE</Text>
        <Text style={styles.scoreLine}>
          <Text style={styles.scoreHighlight}>+18 pts</Text> since last week · rescore in 3 days
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted2} />
    </TouchableOpacity>
  );
}

function Composer() {
  return (
    <View style={styles.composer}>
      <View style={styles.composerAvatar}>
        <Text style={styles.composerAvatarText}>MC</Text>
      </View>
      <Text style={styles.composerPlaceholder}>Share an update…</Text>
      <View style={styles.composerActions}>
        <Ionicons name="image-outline" size={18} color={colors.muted2} />
        <Ionicons name="document-text-outline" size={18} color={colors.muted2} />
      </View>
    </View>
  );
}

function FilterBar() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {FILTERS.map((f, i) => (
        <TouchableOpacity key={f} style={[styles.filterChip, i === 0 && styles.filterChipActive]} activeOpacity={0.7}>
          <Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{f}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const isSquare = item.type === 'signal' || item.type === 'article';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, isSquare && styles.avatarSquare]}>
          <Text style={styles.avatarText}>{item.authorInitials}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardAuthor}>{item.author}</Text>
          <Text style={styles.cardRole}>{item.authorRole}</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        {!item.isPrivate
          ? <TouchableOpacity style={styles.followBtn}><Text style={styles.followText}>+ Follow</Text></TouchableOpacity>
          : <Ionicons name="ellipsis-vertical" size={18} color={colors.muted2} />
        }
      </View>

      <Text style={styles.cardBody}>{item.body}</Text>
      {item.highlight && <Text style={styles.cardHighlight}>{item.highlight}</Text>}

      {item.embed && (
        <View style={[styles.embed, { borderLeftColor: embedBorderColor[item.type] }]}>
          <Text style={[styles.embedLabel, { color: item.type === 'review' ? colors.tealDark : colors.goldDim }]}>
            {item.embed.label}
          </Text>
          <Text style={styles.embedTitle}>{item.embed.title}</Text>
          <Text style={styles.embedBody}>{item.embed.body}</Text>
        </View>
      )}

      {item.type === 'score' && (
        <View style={styles.scoreEmbed}>
          <Text style={styles.scoreEmbedNum}>512</Text>
          <View>
            <Text style={styles.scoreEmbedClass}>SURGE CLASS · FTSO</Text>
            <View style={styles.scoreEmbedBarBg}>
              <View style={[styles.scoreEmbedBar, { width: '51%' }]} />
            </View>
            <Text style={styles.scoreEmbedSub}>↑ from 447 · +65 pts in 14 days</Text>
          </View>
        </View>
      )}

      {item.type === 'article' && (
        <View style={styles.articleEmbed}>
          <View style={styles.articleThumb}>
            <Ionicons name="document-text-outline" size={24} color={colors.border2} />
          </View>
          <View style={styles.articleBody}>
            <Text style={styles.articleSource}>FUNDINGTRACE · 6 MIN READ</Text>
            <Text style={styles.articleTitle}>{item.body}</Text>
          </View>
        </View>
      )}

      <View style={styles.reactions}>
        <Text style={styles.reactCount}>
          {item.isPrivate ? 'Signal · 2 views' : `${item.reactions} ${item.type === 'review' ? 'upvotes' : item.type === 'article' ? 'reads' : 'reactions'}`}
        </Text>
        <View style={styles.reactActions}>
          {item.isPrivate ? (
            <>
              <TouchableOpacity style={styles.reactBtn}>
                <Ionicons name="git-branch-outline" size={16} color={colors.gold} />
                <Text style={[styles.reactBtnText, { color: colors.gold }]}>Pipeline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reactBtn}>
                <Ionicons name="bookmark-outline" size={16} color={colors.muted2} />
                <Text style={styles.reactBtnText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.reactBtn}>
                <Ionicons name="thumbs-up-outline" size={16} color={colors.muted2} />
                <Text style={styles.reactBtnText}>{item.type === 'review' ? 'Helpful' : 'React'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reactBtn}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.muted2} />
                <Text style={styles.reactBtnText}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reactBtn}>
                <Ionicons name="share-outline" size={16} color={colors.muted2} />
                <Text style={styles.reactBtnText}>Share</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.logo}><Text style={styles.logoGold}>Funding</Text>Trace</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topBarIcon}>
            <Ionicons name="search-outline" size={22} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarIcon}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.muted} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarIcon}>
            <Ionicons name="notifications-outline" size={22} color={colors.muted} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <View style={styles.avatarSm}>
            <Text style={styles.avatarSmText}>MC</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ScoreBanner />
        <Composer />
        <FilterBar />
        <View style={styles.divider} />
        {FEED_ITEMS.map((item) => <FeedCard key={item.id} item={item} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.border, backgroundColor: colors.bg },
  logo: { fontFamily: fonts.interSemiBold, fontSize: 16, color: colors.cream },
  logoGold: { color: colors.gold },
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
  scoreLine: { fontFamily: fonts.inter, fontSize: 11, color: colors.muted },
  scoreHighlight: { color: colors.cream, fontFamily: fonts.interMedium },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.md, backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border, padding: spacing.md },
  composerAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.bg3, borderWidth: 0.5, borderColor: colors.border2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  composerAvatarText: { fontFamily: fonts.interSemiBold, fontSize: 10, color: colors.gold },
  composerPlaceholder: { flex: 1, fontFamily: fonts.inter, fontSize: 12, color: colors.muted2 },
  composerActions: { flexDirection: 'row', gap: spacing.sm },
  filterRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 5, borderWidth: 0.5, borderColor: colors.border2 },
  filterChipActive: { borderColor: colors.gold, backgroundColor: colors.goldFaint },
  filterText: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted, letterSpacing: 0.4 },
  filterTextActive: { color: colors.gold },
  divider: { height: 0.5, backgroundColor: colors.border, marginBottom: spacing.sm },
  card: { backgroundColor: colors.bg, borderBottomWidth: 0.5, borderBottomColor: colors.border, padding: spacing.lg, paddingBottom: spacing.md },
  cardHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginBottom: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg3, borderWidth: 0.5, borderColor: colors.border2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarSquare: { borderRadius: 4 },
  avatarText: { fontFamily: fonts.interSemiBold, fontSize: 11, color: colors.gold },
  cardMeta: { flex: 1 },
  cardAuthor: { fontFamily: fonts.interMedium, fontSize: 13, color: colors.cream, marginBottom: 1 },
  cardRole: { fontFamily: fonts.inter, fontSize: 11, color: colors.muted },
  cardTime: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted2, letterSpacing: 0.3, marginTop: 2 },
  followBtn: { borderWidth: 0.5, borderColor: colors.goldDim, paddingHorizontal: spacing.sm, paddingVertical: 3, flexShrink: 0, marginTop: 2 },
  followText: { fontFamily: fonts.mono, fontSize: 9, color: colors.gold, letterSpacing: 0.4 },
  cardBody: { fontFamily: fonts.inter, fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: spacing.sm },
  cardHighlight: { fontFamily: fonts.inter, fontSize: 12, color: colors.gold, lineHeight: 18, marginBottom: spacing.sm },
  embed: { backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border2, borderLeftWidth: 2, padding: spacing.md, marginBottom: spacing.sm },
  embedLabel: { fontFamily: fonts.mono, fontSize: 8, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  embedTitle: { fontFamily: fonts.interMedium, fontSize: 13, color: colors.cream, marginBottom: 3 },
  embedBody: { fontFamily: fonts.inter, fontSize: 11, color: colors.muted, lineHeight: 16 },
  scoreEmbed: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border2, padding: spacing.md, marginBottom: spacing.sm },
  scoreEmbedNum: { fontFamily: fonts.playfair, fontSize: 36, color: colors.gold, lineHeight: 40 },
  scoreEmbedClass: { fontFamily: fonts.mono, fontSize: 9, color: colors.gold, letterSpacing: 0.6, marginBottom: 4 },
  scoreEmbedBarBg: { width: 120, height: 2, backgroundColor: colors.bg4, marginBottom: 4 },
  scoreEmbedBar: { height: 2, backgroundColor: colors.gold },
  scoreEmbedSub: { fontFamily: fonts.mono, fontSize: 8, color: colors.muted2, letterSpacing: 0.3 },
  articleEmbed: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border2, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'flex-start' },
  articleThumb: { width: 56, height: 56, backgroundColor: colors.bg3, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  articleBody: { flex: 1 },
  articleSource: { fontFamily: fonts.mono, fontSize: 8, color: colors.goldDim, letterSpacing: 0.6, marginBottom: 4 },
  articleTitle: { fontFamily: fonts.interMedium, fontSize: 12, color: colors.cream, lineHeight: 17 },
  reactions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 0.5, borderTopColor: colors.border, marginTop: spacing.xs },
  reactCount: { fontFamily: fonts.inter, fontSize: 11, color: colors.muted2 },
  reactActions: { flexDirection: 'row', gap: spacing.md },
  reactBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reactBtnText: { fontFamily: fonts.inter, fontSize: 11, color: colors.muted2 },
});