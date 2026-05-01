import React, { useState, useMemo, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	Image,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { eventService } from "../services/eventService";
import { parse, isAfter, isBefore, startOfDay, format } from "date-fns";

interface CalendarScreenProps {
	onEventPress: (id: string) => void;
}

const CalendarScreen = ({ onEventPress }: CalendarScreenProps) => {
	const { colors } = useTheme();
	const [events, setEvents] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [fromDate, setFromDate] = useState<Date | undefined>();
	const [toDate, setToDate] = useState<Date | undefined>();
	const [showDatePicker, setShowDatePicker] = useState<"from" | "to" | null>(null);

	useEffect(() => {
		eventService.getAll()
			.then(setEvents)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const filtered = useMemo(() => {
		return events.filter((e) => {
			if (!e.date) return true;
			const eventDate = parse(e.date, "MMMM d, yyyy 'at' h:mm a", new Date());
			if (fromDate && isBefore(startOfDay(eventDate), startOfDay(fromDate)))
				return false;
			if (toDate && isAfter(startOfDay(eventDate), startOfDay(toDate)))
				return false;
			return true;
		});
	}, [events, fromDate, toDate]);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	return (
		<FlatList
			data={filtered}
			keyExtractor={(item) => item._id}
			showsVerticalScrollIndicator={false}
			style={{ flex: 1, backgroundColor: colors.background }}
			contentContainerStyle={{ paddingBottom: 40 }}
			initialNumToRender={8}
			maxToRenderPerBatch={10}
			windowSize={5}
			ListHeaderComponent={
				<>
					{/* Filters */}
					<View style={styles.filters}>
						<TouchableOpacity
							style={[
								styles.filterBtn,
								{ backgroundColor: colors.card, borderColor: colors.border },
							]}
						>
							<Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
							<Text style={[styles.filterBtnText, { color: fromDate ? colors.foreground : colors.mutedForeground }]}>
								{fromDate ? format(fromDate, "MMM d") : "From"}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.filterBtn,
								{ backgroundColor: colors.card, borderColor: colors.border },
							]}
						>
							<Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
							<Text style={[styles.filterBtnText, { color: toDate ? colors.foreground : colors.mutedForeground }]}>
								{toDate ? format(toDate, "MMM d") : "To"}
							</Text>
						</TouchableOpacity>
					</View>

					<View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
						<Text style={[styles.count, { color: colors.mutedForeground }]}>
							<Text style={{ fontWeight: "700", color: colors.foreground }}>
								{filtered.length}
							</Text>{" "}
							{filtered.length === 1 ? "event" : "events"} found
						</Text>
					</View>
				</>
			}
			ListEmptyComponent={
				<View style={styles.empty}>
					<Ionicons name="calendar-outline" size={40} color={colors.primary} />
					<Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
						No events match your filters.
					</Text>
				</View>
			}
			renderItem={({ item: event }) => {
				const title = event.content?.split("\n")[0] ?? "Event";
				return (
					<TouchableOpacity
						key={event._id}
						onPress={() => onEventPress(event._id)}
						style={[
							styles.eventCard,
							{ backgroundColor: colors.card, borderColor: colors.border },
						]}
						activeOpacity={0.85}
					>
						{event.displayUrl ? (
							<Image source={{ uri: event.displayUrl }} style={styles.eventImage} />
						) : (
							<View style={[styles.eventImage, { backgroundColor: colors.muted, justifyContent: "center", alignItems: "center" }]}>
								<Ionicons name="calendar-outline" size={40} color={colors.mutedForeground} />
							</View>
						)}
						<View style={styles.eventBody}>
							<Text
								style={[styles.eventTitle, { color: colors.foreground }]}
								numberOfLines={2}
							>
								{title}
							</Text>
							<View style={styles.metaRow}>
								<Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
								<Text style={[styles.metaText, { color: colors.mutedForeground }]}>
									{event.date}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				);
			}}
		/>
	);
};

const styles = StyleSheet.create({
	filters: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 10,
		flexWrap: "wrap",
	},
	filterBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
	},
	filterBtnText: { fontSize: 13, fontWeight: "500" },
	count: { fontSize: 13, marginBottom: 8 },
	list: { paddingHorizontal: 16, gap: 14, paddingBottom: 40 },
	eventCard: {
		borderRadius: 14,
		overflow: "hidden",
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	eventImage: { width: "100%", height: 160 },
	eventBody: { padding: 14, gap: 6 },
	eventTitleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		gap: 8,
	},
	eventTitle: { fontSize: 15, fontWeight: "700" },
	metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
	metaText: { fontSize: 12 },
	empty: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 64,
		gap: 8,
	},
	emptyText: { fontSize: 14 },
});

export default CalendarScreen;
