import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function DashboardScreen() {
  const { token, role } = useAuth();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!token) return;
    const endpoint = role === 'TENANT' ? '/dashboard/tenant' : '/dashboard/metrics';
    const res = await apiFetch<any>(endpoint, { method: 'GET' }, token);
    setData(res);
  };

  useEffect(() => {
    load().catch(() => null);
  }, [token, role]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load().catch(() => null); setRefreshing(false); }} />}
    >
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Role: {role || 'unknown'}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Raw response</Text>
        <Text selectable style={styles.code}>{JSON.stringify(data, null, 2) || 'No data yet'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontWeight: '600', marginBottom: 8 },
  code: { fontFamily: 'monospace', fontSize: 12, color: '#111827' },
});
