import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	ScrollView,
	TouchableOpacity,
	Image,
	StyleSheet,
	Dimensions,
	FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import type { NewsArticle } from "../data/news";
import NewsCard from "../components/NewsCard";
import { News } from "../types/news.types";
import { newsService } from "../services";
import { eventService } from "../services/eventService";
import { sponsorsService, Sponsor } from "../services/sponsorsService";

const { width } = Dimensions.get("window");

const stripNewsHtml = (html: string): string =>
	html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const toNewsArticle = (newsItem: News): NewsArticle => {
	const plain = stripNewsHtml(newsItem.content || "");
	const snippet =
		plain.length > 220 ? `${plain.slice(0, 220).trim()}…` : plain;
	return {
		id: newsItem._id,
		title: newsItem.title,
		snippet: snippet || stripNewsHtml(newsItem.title),
		content: plain || newsItem.title,
		date: newsItem.createdAt,
		image:
			newsItem.pictures[0] ??
			"https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80",
		featured: newsItem.showInSlider,
		sources: newsItem.sources?.trim() || undefined,
	};
};

interface HomeScreenProps {
	onEventPress: (id: string) => void;
	onNewsPress: (id: string) => void;
	onSponsorPress?: (id: string) => void;
}

const HomeScreen = ({ onEventPress, onNewsPress, onSponsorPress }: HomeScreenProps) => {
	const { colors } = useTheme();
	const [current, setCurrent] = useState(0);
	const [showReminder, setShowReminder] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
	const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
	const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);
	const [newsError, setNewsError] = useState<string | null>(null);
	const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
	const [isEventsLoading, setIsEventsLoading] = useState<boolean>(true);
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [isSponsorsLoading, setIsSponsorsLoading] = useState<boolean>(true);
	const flatListRef = useRef<FlatList>(null);

	const sponsorThumb = (s: Sponsor) =>
		(s.logo ?? s.displayUrl ?? s.image ?? null) as string | null;

	const next = useCallback(() => {
		if (featuredNews.length === 0) return;
		setCurrent((c) => {
			const nextIndex = (c + 1) % featuredNews.length;
			flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
			return nextIndex;
		});
	}, [featuredNews.length]);

  // News ve Events paralel yükleniyor — birbirini beklemez
  useEffect(() => {
    const loadAll = async () => {
      setIsNewsLoading(true);
      setIsEventsLoading(true);

      const [slidesResult, latestResult, eventsResult] = await Promise.allSettled([
        newsService.getSlides(),
        newsService.getLatest(),
        eventService.getFeatured().catch(() => eventService.getAll()),
      ]);

      const errs: string[] = [];
      if (slidesResult.status === 'fulfilled') {
        setFeaturedNews(slidesResult.value.map(toNewsArticle));
      } else {
        setFeaturedNews([]);
        errs.push(
          slidesResult.reason instanceof Error
            ? slidesResult.reason.message
            : 'Featured news unavailable.',
        );
      }
      if (latestResult.status === 'fulfilled') {
        const slideIds =
          slidesResult.status === 'fulfilled'
            ? new Set(slidesResult.value.map((n) => n._id))
            : new Set<string>();
        setLatestNews(
          latestResult.value
            .filter((n) => !slideIds.has(n._id))
            .map(toNewsArticle),
        );
      } else {
        setLatestNews([]);
        errs.push(
          latestResult.reason instanceof Error
            ? latestResult.reason.message
            : 'Latest news unavailable.',
        );
      }
      setNewsError(errs.length ? errs.join(' ') : null);

      if (eventsResult.status === 'fulfilled') {
        const data = eventsResult.value;
        setFeaturedEvents(Array.isArray(data) ? data.slice(0, 3) : []);
      } else {
        setFeaturedEvents([]);
      }

      setIsNewsLoading(false);
      setIsEventsLoading(false);
    };

    loadAll();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsSponsorsLoading(true);
      try {
        const list = await sponsorsService.getAll();
        if (!cancelled) setSponsors(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setSponsors([]);
      } finally {
        if (!cancelled) setIsSponsorsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

	useEffect(() => {
		if (featuredNews.length === 0) return;
		const timer = setInterval(next, 5000);
		return () => clearInterval(timer);
	}, [next, featuredNews.length]);

	useEffect(() => {
		if (featuredNews.length === 0) {
			setCurrent(0);
			return;
		}
		if (current >= featuredNews.length) {
			setCurrent(0);
		}
	}, [featuredNews.length, current]);

	return (
		<ScrollView
			style={{ flex: 1, backgroundColor: colors.background }}
			showsVerticalScrollIndicator={false}
		>
			{/* Search Bar */}
			<View style={[styles.searchWrap]}>
				<View style={[styles.searchBox, { backgroundColor: colors.muted }]}>
					<Ionicons
						name="search-outline"
						size={16}
						color={colors.mutedForeground}
					/>
					<TextInput
						placeholder="Search news, events, places…"
						placeholderTextColor={colors.mutedForeground}
						value={searchQuery}
						onChangeText={setSearchQuery}
						style={[styles.searchInput, { color: colors.foreground }]}
					/>
				</View>
			</View>

			{/* Reminder Banner */}
			{showReminder && (
				<View
					style={[styles.reminder, { backgroundColor: colors.primary + "1A" }]}
				>
					<Text style={[styles.reminderText, { color: colors.foreground }]}>
						📅 Tomorrow at 18:00: Pizza Tour
					</Text>
					<TouchableOpacity onPress={() => setShowReminder(false)}>
						<Ionicons name="close" size={16} color={colors.mutedForeground} />
					</TouchableOpacity>
				</View>
			)}

			{/* Featured News Carousel */}
			<View style={styles.section}>
				<Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
					FEATURED NEWS
				</Text>
				{isNewsLoading && (
					<Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
						Loading news...
					</Text>
				)}
				{!isNewsLoading && newsError && (
					<Text style={{ color: "#ef4444", fontSize: 13 }}>{newsError}</Text>
				)}
				<FlatList
					ref={flatListRef}
					data={featuredNews}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onMomentumScrollEnd={(e) => {
						if (featuredNews.length === 0) return;
						const denominator = width - 32;
						if (!denominator) return;
						const idx = Math.round(e.nativeEvent.contentOffset.x / denominator);
						if (Number.isNaN(idx)) return;
						const boundedIdx = Math.min(
							Math.max(idx, 0),
							Math.max(featuredNews.length - 1, 0),
						);
						setCurrent(boundedIdx);
					}}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={{ width: width - 32 }}
							activeOpacity={0.9}
							onPress={() => onNewsPress(item.id)}
						>
							<View style={styles.heroCard}>
								<Image source={{ uri: item.image }} style={styles.heroImage} />
								<View style={styles.heroOverlay} />
								<View style={styles.heroContent}>
									<Text style={styles.heroTitle} numberOfLines={2}>
										{item.title}
									</Text>
									<Text style={styles.heroSnippet} numberOfLines={2}>
										{item.snippet}
									</Text>
									<View style={styles.heroReadMore}>
										<Text
											style={[styles.readMoreText, { color: colors.primary }]}
										>
											Read More
										</Text>
										<Ionicons
											name="chevron-forward"
											size={14}
											color={colors.primary}
										/>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					)}
				/>
				{/* Dots */}
				<View style={styles.dots}>
					{featuredNews.map((_, i) => (
						<TouchableOpacity
							key={i}
							onPress={() => {
								if (featuredNews.length === 0) return;
								flatListRef.current?.scrollToIndex({
									index: i,
									animated: true,
								});
								setCurrent(i);
							}}
							style={[
								styles.dot,
								{
									backgroundColor:
										i === current ? colors.primary : "rgba(255,255,255,0.5)",
								},
							]}
						/>
					))}
				</View>
			</View>

			{/* Recommended Events */}
			<View style={styles.section}>
				<Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
					RECOMMENDED FOR YOU ✨
				</Text>
				{isEventsLoading ? (
					<Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
						Loading events...
					</Text>
				) : (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 12, paddingRight: 16 }}
					>
						{featuredEvents.map((event) => {
							const title =
								(typeof event.content === "string"
									? event.content
									: (event.content ?? [])[0] ?? ""
								)
									.split("\n")[0]
									.trim() || "Event";
							return (
								<TouchableOpacity
									key={event._id}
									style={{ width: 280 }}
									activeOpacity={0.85}
									onPress={() => onEventPress(event._id)}
								>
									<View
										style={[
											styles.miniEventCard,
											{
												backgroundColor: colors.card,
												borderColor: colors.border,
											},
										]}
									>
										{event.displayUrl ? (
											<Image
												source={{ uri: event.displayUrl }}
												style={styles.miniEventImage}
											/>
										) : (
											<View
												style={[
													styles.miniEventImage,
													{
														backgroundColor: colors.muted,
														alignItems: "center",
														justifyContent: "center",
													},
												]}
											>
												<Ionicons
													name="calendar-outline"
													size={36}
													color={colors.mutedForeground}
												/>
											</View>
										)}
										<View style={{ padding: 12, gap: 6 }}>
											<Text
												style={[
													styles.miniEventTitle,
													{ color: colors.foreground },
												]}
												numberOfLines={2}
											>
												{title}
											</Text>
											{event.date ? (
												<View
													style={{
														flexDirection: "row",
														alignItems: "center",
														gap: 5,
													}}
												>
													<Ionicons
														name="calendar-outline"
														size={12}
														color={colors.primary}
													/>
													<Text
														style={{
															color: colors.mutedForeground,
															fontSize: 12,
														}}
														numberOfLines={1}
													>
														{event.date}
													</Text>
												</View>
											) : null}
										</View>
									</View>
								</TouchableOpacity>
							);
						})}
					</ScrollView>
				)}
			</View>

			{/* Sponsors — GET /api/sponsors */}
			{sponsors.length > 0 || isSponsorsLoading ? (
				<View style={styles.section}>
					<Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
						SPONSORS
					</Text>
					{isSponsorsLoading ? (
						<Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Loading sponsors…</Text>
					) : (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ gap: 12, paddingRight: 16 }}
						>
							{sponsors.map((s) => {
								const thumb = sponsorThumb(s);
								const label = (s.name ?? s.title ?? "Sponsor") as string;
								return (
									<TouchableOpacity
										key={s._id}
										style={[
											styles.sponsorCard,
											{ backgroundColor: colors.card, borderColor: colors.border },
										]}
										activeOpacity={0.85}
										onPress={() => onSponsorPress?.(s._id)}
										disabled={!onSponsorPress}
									>
										{thumb ? (
											<Image source={{ uri: thumb }} style={styles.sponsorLogo} resizeMode="contain" />
										) : (
											<View style={[styles.sponsorLogo, { backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }]}>
												<Ionicons name="ribbon-outline" size={28} color={colors.mutedForeground} />
											</View>
										)}
										<Text style={[styles.sponsorName, { color: colors.foreground }]} numberOfLines={2}>
											{label}
										</Text>
									</TouchableOpacity>
								);
							})}
						</ScrollView>
					)}
				</View>
			) : null}

			{/* Latest News */}
			<View style={[styles.section, { paddingBottom: 24 }]}>
				<Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
					LATEST NEWS
				</Text>
				<FlatList
					data={latestNews}
					keyExtractor={(item) => item.id}
					scrollEnabled={false}
					ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
					initialNumToRender={5}
					maxToRenderPerBatch={5}
					windowSize={3}
					renderItem={({ item: article }) => (
						<NewsCard
							article={article}
							onPress={() => onNewsPress(article.id)}
						/>
					)}
				/>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
	searchBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 999,
	},
	searchInput: { flex: 1, fontSize: 14 },
	reminder: {
		marginHorizontal: 16,
		marginBottom: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	reminderText: { fontSize: 13, fontWeight: "600" },
	section: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
	sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
	heroCard: { borderRadius: 18, overflow: "hidden", position: "relative" },
	heroImage: { width: "100%", height: 220 },
	heroOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.55)",
	},
	heroContent: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		padding: 20,
	},
	heroTitle: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 17,
		lineHeight: 22,
		marginBottom: 6,
	},
	heroSnippet: {
		color: "rgba(255,255,255,0.75)",
		fontSize: 12,
		lineHeight: 16,
		marginBottom: 10,
	},
	heroReadMore: { flexDirection: "row", alignItems: "center", gap: 2 },
	readMoreText: { fontSize: 13, fontWeight: "700" },
	dots: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 6,
		marginTop: 8,
	},
	dot: { width: 8, height: 8, borderRadius: 4 },
	miniEventCard: {
		borderRadius: 14,
		overflow: "hidden",
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.07,
		shadowRadius: 6,
		elevation: 3,
	},
	miniEventImage: { width: "100%", height: 140 },
	miniEventTitle: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
	sponsorCard: {
		width: 132,
		padding: 12,
		borderRadius: 14,
		borderWidth: 1,
		gap: 8,
		alignItems: "center",
	},
	sponsorLogo: { width: "100%", height: 56, borderRadius: 8 },
	sponsorName: { fontSize: 12, fontWeight: "700", textAlign: "center", lineHeight: 16 },
});

export default HomeScreen;
