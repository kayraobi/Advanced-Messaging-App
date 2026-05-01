import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { placesService } from '../services/placesService';
import { uploadService } from '../services/uploadService';

interface SubmitPlaceScreenProps {
  onBack: () => void;
  onSubmitted?: (placeId: string) => void;
}

/** POST /api/places (auth) or POST /api/places/ (guest) — [Swagger](https://test.sarajevoexpats.com/api/api-docs/#/) */
const SubmitPlaceScreen = ({ onBack, onSubmitted }: SubmitPlaceScreenProps) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [pictureUris, setPictureUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const ensureMediaPermission = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach images.');
      return false;
    }
    return true;
  };

  const pickOnePhoto = async () => {
    if (!(await ensureMediaPermission())) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setPictureUris((prev) => [...prev, res.assets[0].uri].slice(0, 12));
    }
  };

  const pickMultiplePhotos = async () => {
    if (!(await ensureMediaPermission())) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
    });
    if (!res.canceled && res.assets.length > 0) {
      setPictureUris((prev) =>
        [...prev, ...res.assets.map((a) => a.uri)].slice(0, 12),
      );
    }
  };

  const removePhotoAt = (index: number) => {
    setPictureUris((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    const name = title.trim();
    if (!name) {
      Alert.alert('Missing title', 'Please enter a place name.');
      return;
    }
    setSubmitting(true);
    try {
      let displayUrl: string | undefined;
      let pictures: string[] | undefined;
      if (pictureUris.length > 0) {
        const files = pictureUris.map((uri, i) => ({
          uri,
          name: `place_${i}.jpg`,
          mimeType: 'image/jpeg',
        }));
        const urls =
          files.length === 1
            ? [
                await uploadService.uploadImage({
                  uri: files[0].uri,
                  name: files[0].name,
                  mimeType: files[0].mimeType,
                }),
              ]
            : await uploadService.uploadMultiple(files);
        displayUrl = urls[0];
        pictures = urls;
      }

      const token = await AsyncStorage.getItem('auth_token');
      const basePayload: Record<string, unknown> = {
        name,
        title: name,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        displayUrl,
        pictures,
      };

      let place;
      if (token && token !== 'mock_token') {
        place = await placesService.create({
          ...basePayload,
        });
      } else {
        place = await placesService.submitGuest({
          ...basePayload,
          email: contactEmail.trim() || undefined,
        });
      }

      Alert.alert('Submitted', 'Thank you — your place suggestion was sent.');
      onSubmitted?.(place._id);
      onBack();
    } catch (e) {
      Alert.alert('Submit failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Suggest a place</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Signed-in users submit via POST /api/places; guests use POST /api/places/. Multiple images use POST /api/upload/multiple.
        </Text>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Name</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Place name"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Short description"
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Address or area"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Contact email (guests)</Text>
        <TextInput
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="your@email.com"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <TouchableOpacity
            style={[styles.pickBtn, { borderColor: colors.border, backgroundColor: colors.card, flex: 1, minWidth: 140 }]}
            onPress={pickOnePhoto}
          >
            <Ionicons name="image-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 13 }}>Add photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pickBtn, { borderColor: colors.border, backgroundColor: colors.card, flex: 1, minWidth: 140 }]}
            onPress={pickMultiplePhotos}
          >
            <Ionicons name="images-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 13 }}>Multiple</Text>
          </TouchableOpacity>
        </View>
        {pictureUris.length > 0 ? (
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 8 }}>
            {pictureUris.length} photo(s) — first is cover.
          </Text>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {pictureUris.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.thumbWrap}>
              <Image source={{ uri }} style={styles.thumb} />
              <TouchableOpacity style={styles.thumbRemove} onPress={() => removePhotoAt(index)}>
                <Ionicons name="close-circle" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.submit, { backgroundColor: colors.primary }]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  form: { padding: 16, paddingBottom: 48, gap: 8 },
  hint: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  preview: { width: '100%', height: 160, borderRadius: 12, marginTop: 8 },
  thumbWrap: { marginRight: 10, position: 'relative' },
  thumb: { width: 88, height: 88, borderRadius: 10 },
  thumbRemove: { position: 'absolute', top: -6, right: -6 },
  submit: {
    marginTop: 24,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default SubmitPlaceScreen;
