import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { rolesService, Role } from '../services/rolesService';
import { sponsorsService, Sponsor } from '../services/sponsorsService';
import { usersService } from '../services/usersService';
import type { User } from '../types/user.types';
import { servicesService, Service } from '../services/servicesService';
import { tripsService, Trip } from '../services/tripsService';

interface GmAdminScreenProps {
  onBack: () => void;
  onOpenSponsor?: (id: string) => void;
  onOpenUser?: (id: string) => void;
}

type AdminTab = 'sponsors' | 'roles' | 'users' | 'services' | 'trips';

const TAB_ORDER: AdminTab[] = ['sponsors', 'roles', 'users', 'services', 'trips'];

/** GM tools — Stage 1 APIs: users list, services CRUD, trips CRUD, roles/sponsors (existing). */
const GmAdminScreen = ({ onBack, onOpenSponsor, onOpenUser }: GmAdminScreenProps) => {
  const { colors } = useTheme();
  const [tab, setTab] = useState<AdminTab>('sponsors');

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [templateJson, setTemplateJson] = useState<string>('');
  const [showTemplate, setShowTemplate] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [rolePermissionsJson, setRolePermissionsJson] = useState('{}');
  const [roleSaving, setRoleSaving] = useState(false);
  const [showRoleEdit, setShowRoleEdit] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRolePermissionsJson, setEditRolePermissionsJson] = useState('{}');
  const [roleEditSaving, setRoleEditSaving] = useState(false);

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorWebsite, setSponsorWebsite] = useState('');
  const [sponsorLogoUrl, setSponsorLogoUrl] = useState('');
  const [sponsorDesc, setSponsorDesc] = useState('');
  const [sponsorSaving, setSponsorSaving] = useState(false);
  const [showSponsorEdit, setShowSponsorEdit] = useState(false);
  const [editSponsorId, setEditSponsorId] = useState<string | null>(null);
  const [editSponsorName, setEditSponsorName] = useState('');
  const [editSponsorWebsite, setEditSponsorWebsite] = useState('');
  const [editSponsorLogoUrl, setEditSponsorLogoUrl] = useState('');
  const [editSponsorDesc, setEditSponsorDesc] = useState('');
  const [sponsorEditSaving, setSponsorEditSaving] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [svcName, setSvcName] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcTypeId, setSvcTypeId] = useState('');
  const [svcSaving, setSvcSaving] = useState(false);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [tripDesc, setTripDesc] = useState('');
  const [tripPrice, setTripPrice] = useState('');
  const [tripCapacity, setTripCapacity] = useState('');
  const [tripSaving, setTripSaving] = useState(false);

  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      setRoles(await rolesService.getAll());
    } catch (e) {
      Alert.alert('Roles', e instanceof Error ? e.message : 'Failed to load roles.');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const loadSponsors = useCallback(async () => {
    setSponsorsLoading(true);
    try {
      setSponsors(await sponsorsService.getAll());
    } catch (e) {
      Alert.alert('Sponsors', e instanceof Error ? e.message : 'Failed to load sponsors.');
    } finally {
      setSponsorsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      setUsers(await usersService.getAll());
    } catch (e) {
      Alert.alert('Users', e instanceof Error ? e.message : 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      setServices(await servicesService.getAll());
    } catch (e) {
      Alert.alert('Services', e instanceof Error ? e.message : 'Failed to load services.');
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const loadTrips = useCallback(async () => {
    setTripsLoading(true);
    try {
      setTrips(await tripsService.getAll());
    } catch (e) {
      Alert.alert('Trips', e instanceof Error ? e.message : 'Failed to load trips.');
    } finally {
      setTripsLoading(false);
    }
  }, []);

  useEffect(() => {
    switch (tab) {
      case 'roles':
        loadRoles();
        break;
      case 'sponsors':
        loadSponsors();
        break;
      case 'users':
        loadUsers();
        break;
      case 'services':
        loadServices();
        break;
      case 'trips':
        loadTrips();
        break;
      default:
        break;
    }
  }, [tab, loadRoles, loadSponsors, loadUsers, loadServices, loadTrips]);

  const loadTemplate = async () => {
    try {
      const tpl = await rolesService.getPermissionsTemplate();
      setTemplateJson(JSON.stringify(tpl, null, 2));
      setShowTemplate(true);
    } catch (e) {
      Alert.alert('Template', e instanceof Error ? e.message : 'Failed to load.');
    }
  };

  const openEditRole = (r: Role) => {
    setEditRoleId(r._id);
    setEditRoleName((r.name ?? r.label ?? '') as string);
    try {
      setEditRolePermissionsJson(JSON.stringify(r.permissions ?? {}, null, 2));
    } catch {
      setEditRolePermissionsJson('{}');
    }
    setShowRoleEdit(true);
  };

  const saveRoleEdit = async () => {
    if (!editRoleId) return;
    const name = editRoleName.trim();
    if (!name) {
      Alert.alert('Role name required');
      return;
    }
    let permissions: unknown = {};
    try {
      permissions = JSON.parse(editRolePermissionsJson.trim() || '{}');
    } catch {
      Alert.alert('Invalid JSON', 'Permissions must be valid JSON.');
      return;
    }
    setRoleEditSaving(true);
    try {
      await rolesService.update(editRoleId, { name, permissions });
      Alert.alert('Saved', 'Role updated.');
      setShowRoleEdit(false);
      setEditRoleId(null);
      loadRoles();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not update role.');
    } finally {
      setRoleEditSaving(false);
    }
  };

  const deleteRole = (r: Role) => {
    Alert.alert('Delete role', `Remove ${r.name ?? r.label ?? r._id}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await rolesService.delete(r._id);
            loadRoles();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Delete failed.');
          }
        },
      },
    ]);
  };

  const openEditSponsor = (s: Sponsor) => {
    setEditSponsorId(s._id);
    setEditSponsorName((s.name ?? s.title ?? '') as string);
    setEditSponsorWebsite((s.website ?? s.url ?? '') as string);
    setEditSponsorLogoUrl((s.logo ?? s.displayUrl ?? s.image ?? '') as string);
    setEditSponsorDesc((s.description ?? '') as string);
    setShowSponsorEdit(true);
  };

  const saveSponsorEdit = async () => {
    if (!editSponsorId) return;
    const name = editSponsorName.trim();
    if (!name) {
      Alert.alert('Name required');
      return;
    }
    setSponsorEditSaving(true);
    try {
      await sponsorsService.update(editSponsorId, {
        name,
        title: name,
        website: editSponsorWebsite.trim() || undefined,
        url: editSponsorWebsite.trim() || undefined,
        logo: editSponsorLogoUrl.trim() || undefined,
        displayUrl: editSponsorLogoUrl.trim() || undefined,
        description: editSponsorDesc.trim() || undefined,
      });
      Alert.alert('Saved', 'Sponsor updated.');
      setShowSponsorEdit(false);
      setEditSponsorId(null);
      loadSponsors();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not update sponsor.');
    } finally {
      setSponsorEditSaving(false);
    }
  };

  const deleteSponsor = (s: Sponsor) => {
    Alert.alert('Delete sponsor', `Remove ${s.name ?? s.title ?? s._id}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await sponsorsService.delete(s._id);
            loadSponsors();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Delete failed.');
          }
        },
      },
    ]);
  };

  const createRole = async () => {
    const name = roleName.trim();
    if (!name) {
      Alert.alert('Role name required');
      return;
    }
    let permissions: unknown = {};
    try {
      permissions = JSON.parse(rolePermissionsJson.trim() || '{}');
    } catch {
      Alert.alert('Invalid JSON', 'Permissions must be valid JSON.');
      return;
    }
    setRoleSaving(true);
    try {
      await rolesService.create({ name, permissions });
      Alert.alert('Created', 'Role created.');
      setRoleName('');
      setRolePermissionsJson('{}');
      loadRoles();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create role.');
    } finally {
      setRoleSaving(false);
    }
  };

  const createSponsor = async () => {
    const name = sponsorName.trim();
    if (!name) {
      Alert.alert('Name required');
      return;
    }
    setSponsorSaving(true);
    try {
      await sponsorsService.create({
        name,
        title: name,
        website: sponsorWebsite.trim() || undefined,
        url: sponsorWebsite.trim() || undefined,
        logo: sponsorLogoUrl.trim() || undefined,
        displayUrl: sponsorLogoUrl.trim() || undefined,
        description: sponsorDesc.trim() || undefined,
      });
      Alert.alert('Created', 'Sponsor added.');
      setSponsorName('');
      setSponsorWebsite('');
      setSponsorLogoUrl('');
      setSponsorDesc('');
      loadSponsors();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create sponsor.');
    } finally {
      setSponsorSaving(false);
    }
  };

  const deleteUser = (u: User) => {
    Alert.alert(
      'Delete user',
      `Remove ${u.username ?? u.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersService.delete(u._id);
              loadUsers();
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Delete failed.');
            }
          },
        },
      ],
    );
  };

  const createService = async () => {
    const name = svcName.trim();
    if (!name) {
      Alert.alert('Name required');
      return;
    }
    const body: Record<string, unknown> = {
      name,
      title: name,
      description: svcDesc.trim() || undefined,
    };
    const tid = svcTypeId.trim();
    if (tid) body.serviceType = tid;
    setSvcSaving(true);
    try {
      await servicesService.create(body);
      Alert.alert('Created');
      setSvcName('');
      setSvcDesc('');
      setSvcTypeId('');
      loadServices();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Create failed.');
    } finally {
      setSvcSaving(false);
    }
  };

  const deleteService = (s: Service) => {
    Alert.alert('Delete service', (s.name ?? s.title ?? s._id) as string, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await servicesService.delete(s._id);
            loadServices();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Delete failed.');
          }
        },
      },
    ]);
  };

  const createTrip = async () => {
    const title = tripTitle.trim();
    if (!title) {
      Alert.alert('Title required');
      return;
    }
    const body: Record<string, unknown> = {
      title,
      name: title,
      destination: tripDestination.trim() || undefined,
      description: tripDesc.trim() || undefined,
    };
    const cap = tripCapacity.trim();
    if (cap) {
      const n = Number(cap);
      if (!Number.isNaN(n)) body.capacity = n;
    }
    const pr = tripPrice.trim();
    if (pr) {
      const n = Number(pr.replace(/[^0-9.]/g, ''));
      if (!Number.isNaN(n)) body.price = n;
      else body.price = pr;
    }
    setTripSaving(true);
    try {
      await tripsService.create(body);
      Alert.alert('Created');
      setTripTitle('');
      setTripDestination('');
      setTripDesc('');
      setTripPrice('');
      setTripCapacity('');
      loadTrips();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Create failed.');
    } finally {
      setTripSaving(false);
    }
  };

  const deleteTrip = (t: Trip) => {
    Alert.alert('Delete trip', (t.title ?? t.name ?? t._id) as string, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await tripsService.delete(t._id);
            loadTrips();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Delete failed.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Admin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabScroll, { borderBottomColor: colors.border }]}
        contentContainerStyle={styles.tabScrollContent}
      >
        {TAB_ORDER.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tabPill,
              { borderColor: colors.border, backgroundColor: colors.card },
              tab === t && { borderColor: colors.primary, backgroundColor: colors.primary + '18' },
            ]}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 13,
                color: tab === t ? colors.primary : colors.mutedForeground,
                textTransform: 'capitalize',
              }}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {tab === 'roles' ? (
          <>
            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.primary }]}
              onPress={loadTemplate}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Permissions template</Text>
            </TouchableOpacity>

            {rolesLoading ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color={colors.primary} />
            ) : (
              <View style={{ gap: 8, marginTop: 12 }}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ROLES</Text>
                {roles.map((r) => (
                  <View
                    key={r._id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 10 }]}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: '700' }}>
                      {(r.name ?? r.label ?? r._id) as string}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                      <TouchableOpacity onPress={() => openEditRole(r)}>
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Edit (PUT)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteRole(r)}>
                        <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 24 }]}>
              CREATE ROLE
            </Text>
            <TextInput
              value={roleName}
              onChangeText={setRoleName}
              placeholder="Role name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={rolePermissionsJson}
              onChangeText={setRolePermissionsJson}
              placeholder="Permissions JSON"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, styles.jsonInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={createRole}
              disabled={roleSaving}
            >
              {roleSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create role</Text>}
            </TouchableOpacity>
          </>
        ) : null}

        {tab === 'sponsors' ? (
          <>
            {sponsorsLoading ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color={colors.primary} />
            ) : (
              <View style={{ gap: 8 }}>
                {sponsors.map((item) => (
                  <View
                    key={item._id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 8 }]}
                  >
                    <TouchableOpacity
                      onPress={() => onOpenSponsor?.(item._id)}
                      disabled={!onOpenSponsor}
                      style={{ gap: 4 }}
                    >
                      <Text style={{ color: colors.foreground, fontWeight: '700' }}>
                        {(item.name ?? item.title ?? item._id) as string}
                      </Text>
                      {onOpenSponsor ? (
                        <Text style={{ color: colors.primary, fontSize: 12 }}>View detail →</Text>
                      ) : null}
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                      <TouchableOpacity onPress={() => openEditSponsor(item)}>
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Edit (PUT)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteSponsor(item)}>
                        <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 24 }]}>
              CREATE SPONSOR
            </Text>
            <TextInput
              value={sponsorName}
              onChangeText={setSponsorName}
              placeholder="Name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={sponsorWebsite}
              onChangeText={setSponsorWebsite}
              placeholder="Website URL"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={sponsorLogoUrl}
              onChangeText={setSponsorLogoUrl}
              placeholder="Logo image URL"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={sponsorDesc}
              onChangeText={setSponsorDesc}
              placeholder="Description"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={createSponsor}
              disabled={sponsorSaving}
            >
              {sponsorSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Create sponsor</Text>
              )}
            </TouchableOpacity>
          </>
        ) : null}

        {tab === 'users' ? (
          <>
            {usersLoading ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color={colors.primary} />
            ) : (
              <View style={{ gap: 8 }}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>GET /api/users</Text>
                {users.map((u) => (
                  <View
                    key={u._id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 10 }]}
                  >
                    <TouchableOpacity
                      onPress={() => onOpenUser?.(u._id)}
                      disabled={!onOpenUser}
                      style={{ gap: 4 }}
                    >
                      <Text style={{ color: colors.foreground, fontWeight: '700' }}>{u.username}</Text>
                      <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{u.email}</Text>
                      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Type: {u.type}</Text>
                      {onOpenUser ? (
                        <Text style={{ color: colors.primary, fontSize: 12 }}>Open profile →</Text>
                      ) : null}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteUser(u)}>
                      <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>
                        Delete user (DELETE /api/users/id)
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}

        {tab === 'services' ? (
          <>
            {servicesLoading ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color={colors.primary} />
            ) : (
              <View style={{ gap: 8 }}>
                {services.map((s) => (
                  <View
                    key={s._id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 8 }]}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: '700' }}>
                      {(s.name ?? s.title ?? s._id) as string}
                    </Text>
                    <TouchableOpacity onPress={() => deleteService(s)}>
                      <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Delete service</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 20 }]}>
              POST /api/services
            </Text>
            <TextInput
              value={svcName}
              onChangeText={setSvcName}
              placeholder="Name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={svcDesc}
              onChangeText={setSvcDesc}
              placeholder="Description"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={svcTypeId}
              onChangeText={setSvcTypeId}
              placeholder="Service type ID (optional)"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={createService}
              disabled={svcSaving}
            >
              {svcSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create service</Text>}
            </TouchableOpacity>
          </>
        ) : null}

        {tab === 'trips' ? (
          <>
            {tripsLoading ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color={colors.primary} />
            ) : (
              <View style={{ gap: 8 }}>
                {trips.map((t) => (
                  <View
                    key={t._id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 8 }]}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: '700' }}>
                      {(t.title ?? t.name ?? t._id) as string}
                    </Text>
                    <TouchableOpacity onPress={() => deleteTrip(t)}>
                      <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Delete trip</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 20 }]}>
              POST /api/trips
            </Text>
            <TextInput
              value={tripTitle}
              onChangeText={setTripTitle}
              placeholder="Title"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={tripDestination}
              onChangeText={setTripDestination}
              placeholder="Destination"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={tripDesc}
              onChangeText={setTripDesc}
              placeholder="Description"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={tripPrice}
              onChangeText={setTripPrice}
              placeholder="Price"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={tripCapacity}
              onChangeText={setTripCapacity}
              placeholder="Capacity (number)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={createTrip}
              disabled={tripSaving}
            >
              {tripSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create trip</Text>}
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>

      <Modal visible={showTemplate} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Permissions template</Text>
            <TouchableOpacity onPress={() => setShowTemplate(false)}>
              <Ionicons name="close" size={26} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'monospace', fontSize: 11 }}>
              {templateJson || '—'}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showRoleEdit} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit role</Text>
            <TouchableOpacity
              onPress={() => {
                setShowRoleEdit(false);
                setEditRoleId(null);
              }}
            >
              <Ionicons name="close" size={26} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <TextInput
              value={editRoleName}
              onChangeText={setEditRoleName}
              placeholder="Role name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { marginTop: 0, color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={editRolePermissionsJson}
              onChangeText={setEditRolePermissionsJson}
              placeholder="Permissions JSON"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, styles.jsonInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={saveRoleEdit}
              disabled={roleEditSaving}
            >
              {roleEditSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Save changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showSponsorEdit} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit sponsor</Text>
            <TouchableOpacity
              onPress={() => {
                setShowSponsorEdit(false);
                setEditSponsorId(null);
              }}
            >
              <Ionicons name="close" size={26} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <TextInput
              value={editSponsorName}
              onChangeText={setEditSponsorName}
              placeholder="Name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { marginTop: 0, color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={editSponsorWebsite}
              onChangeText={setEditSponsorWebsite}
              placeholder="Website URL"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={editSponsorLogoUrl}
              onChangeText={setEditSponsorLogoUrl}
              placeholder="Logo image URL"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TextInput
              value={editSponsorDesc}
              onChangeText={setEditSponsorDesc}
              placeholder="Description"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={saveSponsorEdit}
              disabled={sponsorEditSaving}
            >
              {sponsorEditSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Save changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  tabScroll: { maxHeight: 52, borderBottomWidth: 1 },
  tabScrollContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: 'center' },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 4,
  },
  scroll: { padding: 16, paddingBottom: 48 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1 },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  jsonInput: { minHeight: 100, textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 12 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  primaryBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalRoot: { flex: 1, paddingTop: 16 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
});

export default GmAdminScreen;
