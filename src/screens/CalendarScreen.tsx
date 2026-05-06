import React, { useState, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
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
import { useEvents } from '../hooks/useEvents';
import { parse, isAfter, isBefore, startOfDay, format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const CalendarScreen = () => {
	const navigation = useNavigation();
	const { colors } = useTheme();
	const { data: events = [], isLoading: loading } = useEvents();
	const [fromDate, setFromDate] = useState<Date | undefined>();
	const [toDate, setToDate] = useState<Date | undefined>();
	const [showDatePicker, setShowDatePicker] = useState<"from" | "to" | null>(null);

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
					{/* Filter buttons row */}
					<View style={styles.filters}>
						<TouchableOpacity
							onPress={() => setShowDatePicker(showDatePicker === 'from' ? null : 'from')}
							style={[
								styles.filterBtn,
								{
									backgroundColor: fromDate ? colors.primary + '15' : colors.card,
									borderColor: fromDate ? colors.primary : colors.border,
								},
							]}
						>
							<Ionicons name="calendar-outline" size={14} color={fromDate ? colors.primary : colors.mutedForeground} />
							<Text style={[styles.filterBtnText, { color: fromDate ? colors.primary : colors.mutedForeground }]}>
								{fromDate ? format(fromDate, "MMM d") : "From"}
							</Text>
							{fromDate && (
								<TouchableOpacity onPress={() => { setFromDate(undefined); setShowDatePicker(null); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
									<Ionicons name="close-circle" size={14} color={colors.primary} />
								</TouchableOpacity>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => setShowDatePicker(showDatePicker === 'to' ? null : 'to')}
							style={[
								styles.filterBtn,
								{
									backgroundColor: toDate ? colors.primary + '15' : colors.card,
									borderColor: toDate ? colors.primary : colors.border,
								},
							]}
						>
							<Ionicons name="calendar-outline" size={14} color={toDate ? colors.primary : colors.mutedForeground} />
							<Text style={[styles.filterBtnText, { color: toDate ? colors.primary : colors.mutedForeground }]}>
								{toDate ? format(toDate, "MMM d") : "To"}
							</Text>
							{toDate && (
								<TouchableOpacity onPress={() => { setToDate(undefined); setShowDatePicker(null); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
									<Ionicons name="close-circle" size={14} color={colors.primary} />
								</TouchableOpacity>
							)}
						</TouchableOpacity>

						{(fromDate || toDate) && (
							<TouchableOpacity
								onPress={() => { setFromDate(undefined); setToDate(undefined); setShowDatePicker(null); }}
								style={[styles.filterBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
							>
								<Text style={[styles.filterBtnText, { color: colors.mutedForeground }]}>Clear all</Text>
							</TouchableOpacity>
						)}
					</View>

					{/* Quick-preset picker */}
					{showDatePicker && (
						<View style={[styles.presetBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
							<Text style={[styles.presetTitle, { color: colors.mutedForeground }]}>
								{showDatePicker === 'from' ? 'Start date' : 'End date'}
							</Text>
							{[
								{ label: 'Today',       from: startOfDay(new Date()),         to: startOfDay(new Date()) },
								{ label: 'This week',   from: startOfWeek(new Date()),        to: endOfWeek(new Date()) },
								{ label: 'This month',  from: startOfMonth(new Date()),       to: endOfMonth(new Date()) },
								{ label: 'Next 30 days',from: startOfDay(new Date()),         to: addDays(new Date(), 30) },
							].map(({ label, from, to }) => (
								<TouchableOpacity
									key={label}
									onPress={() => {
										if (showDatePicker === 'from') setFromDate(from);
										else setToDate(to);
										setShowDatePicker(null);
									}}
									style={[styles.presetOption, { borderBottomColor: colors.border }]}
								>
									<Text style={[styles.presetOptionText, { color: colors.foreground }]}>{label}</Text>
									<Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
								</TouchableOpacity>
							))}
						</View>
					)}

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
						onPress={() => navigation.navigate('EventDetail', { eventId: event._id })}
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
	presetBox: {
		marginHorizontal: 16,
		marginBottom: 10,
		borderRadius: 12,
		borderWidth: 1,
		overflow: 'hidden',
	},
	presetTitle: {
		fontSize: 11,
		fontWeight: '600',
		paddingHorizontal: 14,
		paddingTop: 10,
		paddingBottom: 6,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	presetOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	presetOptionText: { fontSize: 14, fontWeight: '500' },
});

export default CalendarScreen;
