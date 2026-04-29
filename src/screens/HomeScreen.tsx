import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	ScrollView,
	TouchableOpacity,
	Image,
	Modal,
	StyleSheet,
	Dimensions,
	FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { newsArticles, NewsArticle } from "../data/news";
import { events } from "../data/events";
import NewsCard from "../components/NewsCard";
import EventCard from "../components/EventCard";
import { News } from "../types/news.types";
import { newsService } from "../services";
import { USE_MOCK } from "../services/api";

const { width } = Dimensions.get("window");

const toNewsArticle = (newsItem: News): NewsArticle => ({
	id: newsItem._id,
	title: newsItem.title,
	snippet: newsItem.content.replace(/<[^>]+>/g, "").trim(),
	date: newsItem.createdAt,
	image:
		newsItem.pictures[0] ??
		"https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80",
	featured: newsItem.showInSlider,
});

interface HomeScreenProps {
	onEventPress: (id: string) => void;
}

const HomeScreen = ({ onEventPress }: HomeScreenProps) => {
	const { colors } = useTheme();
	const [current, setCurrent] = useState(0);
	const [showReminder, setShowReminder] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [articleOpen, setArticleOpen] = useState(false);
	const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
		null,
	);
	const [articles, setArticles] = useState<NewsArticle[]>([]);
	const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);
	const [newsError, setNewsError] = useState<string | null>(null);
	const flatListRef = useRef<FlatList>(null);

	const featured = articles.filter((a) => a.featured);
	const latest = articles.filter((a) => !a.featured);

	const next = useCallback(() => {
		if (featured.length === 0) return;
		setCurrent((c) => {
			const nextIndex = (c + 1) % featured.length;
			flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
			return nextIndex;
		});
	}, [featured.length]);

	useEffect(() => {
		const loadNews = async () => {
			try {
				setIsNewsLoading(true);
				setNewsError(null);
				const apiNews = await newsService.getAll();
				setArticles(apiNews.map(toNewsArticle));
			} catch (e) {
				const message =
					e instanceof Error ? e.message : "Failed to fetch news.";
				setNewsError(message);
				if (USE_MOCK) setArticles(newsArticles);
			} finally {
				setIsNewsLoading(false);
			}
		};

		loadNews();
	}, []);

	useEffect(() => {
		if (featured.length === 0) return;
		const timer = setInterval(next, 5000);
		return () => clearInterval(timer);
	}, [next, featured.length]);

	useEffect(() => {
		if (featured.length === 0) {
			setCurrent(0);
			return;
		}
		if (current >= featured.length) {
			setCurrent(0);
		}
	}, [featured.length, current]);

	const currentArticle = featured[current];

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
					data={featured}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onMomentumScrollEnd={(e) => {
						if (featured.length === 0) return;
						const denominator = width - 32;
						if (!denominator) return;
						const idx = Math.round(e.nativeEvent.contentOffset.x / denominator);
						if (Number.isNaN(idx)) return;
						const boundedIdx = Math.min(
							Math.max(idx, 0),
							Math.max(featured.length - 1, 0),
						);
						setCurrent(boundedIdx);
					}}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={{ width: width - 32 }}
							activeOpacity={0.9}
							onPress={() => {
								setSelectedArticle(item);
								setArticleOpen(true);
							}}
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
					{featured.map((_, i) => (
						<TouchableOpacity
							key={i}
							onPress={() => {
								if (featured.length === 0) return;
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
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: 12, paddingRight: 16 }}
				>
					{events.slice(0, 3).map((event) => (
						<View key={event.id} style={{ width: 280 }}>
							<EventCard event={event} onPress={() => onEventPress(event.id)} />
						</View>
					))}
				</ScrollView>
			</View>

			{/* Latest News */}
			<View style={[styles.section, { paddingBottom: 24 }]}>
				<Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
					LATEST NEWS
				</Text>
				<View style={{ gap: 10 }}>
					{latest.map((article) => (
						<NewsCard
							key={article.id}
							article={article}
							onPress={() => {
								setSelectedArticle(article);
								setArticleOpen(true);
							}}
						/>
					))}
				</View>
			</View>

			{/* Article Modal */}
			<Modal
				visible={articleOpen}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setArticleOpen(false)}
			>
				<View
					style={[styles.articleModal, { backgroundColor: colors.background }]}
				>
					<View
						style={[styles.articleHeader, { borderBottomColor: colors.border }]}
					>
						<Text
							style={[styles.articleHeaderTitle, { color: colors.foreground }]}
						>
							Article
						</Text>
						<TouchableOpacity onPress={() => setArticleOpen(false)}>
							<Ionicons name="close" size={24} color={colors.foreground} />
						</TouchableOpacity>
					</View>
					<ScrollView
						style={{ flex: 1 }}
						contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
					>
						{selectedArticle && (
							<>
								<Image
									source={{ uri: selectedArticle.image }}
									style={styles.articleImage}
								/>
								<Text
									style={[styles.articleTitle, { color: colors.foreground }]}
								>
									{selectedArticle.title}
								</Text>
								<Text
									style={[
										styles.articleBody,
										{ color: colors.mutedForeground },
									]}
								>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
									do eiusmod tempor incididunt ut labore et dolore magna aliqua.
									Ut enim ad minim veniam, quis nostrud exercitation ullamco
									laboris nisi ut aliquip ex ea commodo consequat.
								</Text>
								<Text
									style={[
										styles.articleBody,
										{ color: colors.mutedForeground, marginTop: 12 },
									]}
								>
									Duis aute irure dolor in reprehenderit in voluptate velit esse
									cillum dolore eu fugiat nulla pariatur. Excepteur sint
									occaecat cupidatat non proident, sunt in culpa qui officia
									deserunt mollit anim id est laborum.
								</Text>
							</>
						)}
					</ScrollView>
				</View>
			</Modal>
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
	articleModal: { flex: 1 },
	articleHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
	},
	articleHeaderTitle: { fontSize: 17, fontWeight: "700" },
	articleImage: {
		width: "100%",
		height: 200,
		borderRadius: 14,
		marginBottom: 16,
	},
	articleTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
	articleBody: { fontSize: 14, lineHeight: 22 },
});

export default HomeScreen;
