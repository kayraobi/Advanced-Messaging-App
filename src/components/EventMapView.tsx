import React, { useMemo } from "react";
import {
	Platform,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Linking,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export type MapMarkerItem = {
	id: string;
	latitude: number;
	longitude: number;
	title: string;
};

const SARAJEVO_CENTER: Region = {
	latitude: 43.8563,
	longitude: 18.4131,
	latitudeDelta: 0.12,
	longitudeDelta: 0.12,
};

function regionFromMarkers(markers: MapMarkerItem[]): Region {
	if (markers.length === 0) return SARAJEVO_CENTER;
	if (markers.length === 1) {
		return {
			latitude: markers[0].latitude,
			longitude: markers[0].longitude,
			latitudeDelta: 0.06,
			longitudeDelta: 0.06,
		};
	}
	let minLat = Infinity;
	let maxLat = -Infinity;
	let minLng = Infinity;
	let maxLng = -Infinity;
	for (const m of markers) {
		minLat = Math.min(minLat, m.latitude);
		maxLat = Math.max(maxLat, m.latitude);
		minLng = Math.min(minLng, m.longitude);
		maxLng = Math.max(maxLng, m.longitude);
	}
	const midLat = (minLat + maxLat) / 2;
	const midLng = (minLng + maxLng) / 2;
	const latDelta = Math.max((maxLat - minLat) * 1.6, 0.04);
	const lngDelta = Math.max((maxLng - minLng) * 1.6, 0.04);
	return {
		latitude: midLat,
		longitude: midLng,
		latitudeDelta: latDelta,
		longitudeDelta: lngDelta,
	};
}

type EventMapViewProps = {
	markers: MapMarkerItem[];
	height: number;
	interactive?: boolean;
	showOpenMapsButton?: boolean;
	onMarkerPress?: (id: string) => void;
};

export function EventMapView({
	markers,
	height,
	interactive = true,
	showOpenMapsButton,
	onMarkerPress,
}: EventMapViewProps) {
	const { colors } = useTheme();
	const region = useMemo(() => regionFromMarkers(markers), [markers]);

	const openExternalMaps = () => {
		if (markers.length === 0) return;
		const q =
			markers.length === 1
				? `${markers[0].latitude},${markers[0].longitude}`
				: `${region.latitude},${region.longitude}`;
		void Linking.openURL(
			`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
		);
	};

	if (Platform.OS === "web") {
		return (
			<View
				style={[
					styles.webBox,
					{
						height,
						backgroundColor: colors.muted,
						borderColor: colors.border,
					},
				]}
			>
				<Ionicons name="map-outline" size={36} color={colors.mutedForeground} />
				<Text style={[styles.webText, { color: colors.mutedForeground }]}>
					Map opens in the Expo Go app on iOS or Android. On web, use the button
					below.
				</Text>
				{markers.length > 0 ? (
					<TouchableOpacity
						style={[styles.linkBtn, { borderColor: colors.primary }]}
						onPress={openExternalMaps}
					>
						<Ionicons name="open-outline" size={16} color={colors.primary} />
						<Text style={[styles.linkBtnText, { color: colors.primary }]}>
							Open in Google Maps
						</Text>
					</TouchableOpacity>
				) : null}
			</View>
		);
	}

	return (
		<View style={styles.wrap}>
			<View style={styles.mapClip}>
			<MapView
				style={{ width: "100%", height }}
				initialRegion={region}
				scrollEnabled={interactive}
				zoomEnabled={interactive}
				pitchEnabled={interactive}
				rotateEnabled={interactive}
			>
				{markers.map((m) => (
					<Marker
						key={m.id}
						coordinate={{
							latitude: m.latitude,
							longitude: m.longitude,
						}}
						title={m.title}
						onPress={() => onMarkerPress?.(m.id)}
					/>
				))}
			</MapView>
			</View>
			{showOpenMapsButton && markers.length > 0 ? (
				<TouchableOpacity
					style={[
						styles.linkBtn,
						{ marginTop: 10, borderColor: colors.primary, backgroundColor: colors.card },
					]}
					onPress={openExternalMaps}
				>
					<Ionicons name="open-outline" size={16} color={colors.primary} />
					<Text style={[styles.linkBtnText, { color: colors.primary }]}>
						Open in Maps
					</Text>
				</TouchableOpacity>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { width: "100%" },
	mapClip: {
		borderRadius: 14,
		overflow: "hidden",
	},
	webBox: {
		borderRadius: 14,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		gap: 12,
	},
	webText: { fontSize: 13, textAlign: "center", lineHeight: 18 },
	linkBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 12,
		borderWidth: 1.5,
		alignSelf: "center",
	},
	linkBtnText: { fontSize: 13, fontWeight: "700" },
});
