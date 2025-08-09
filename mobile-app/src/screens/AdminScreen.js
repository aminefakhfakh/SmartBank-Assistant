import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  Surface,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  List,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminScreen = () => {
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadAdminData();
  }, []);

 
  useFocusEffect(
    React.useCallback(() => {
      loadAdminData();
    }, [])
  );

  const loadAdminData = async () => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      Alert.alert('Access Denied', 'You need admin privileges to view this screen.');
      return;
    }

    try {
      setLoading(true);
      const [accountsRes, transactionsRes] = await Promise.all([
        adminAPI.getAllAccounts(),
        adminAPI.getAllTransactions(),
      ]);

      setAccounts(accountsRes.data.accounts);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error loading admin data:', error);
      
     
      if (error.response?.status === 401) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => logout()
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => {
          // Clear data before logout to prevent null errors
          setAccounts([]);
          setTransactions([]);
          logout();
        }, style: 'destructive' },
      ]
    );
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="titleLarge" style={styles.welcomeText}>
              Admin Dashboard
            </Text>
            <Text variant="bodyMedium" style={styles.emailText}>
              {user?.email || 'Loading...'}
            </Text>
          </View>
          <Button
            mode="text"
            onPress={handleLogout}
            icon="logout"
            compact
          >
            Logout
          </Button>
        </View>
      </Surface>

     
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statLabel}>
              Total Accounts
            </Text>
            <Text variant="displaySmall" style={styles.statValue}>
              {accounts.length}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statLabel}>
              Total Transactions
            </Text>
            <Text variant="displaySmall" style={styles.statValue}>
              {transactions.length}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Accounts */}
      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          All Accounts ({accounts.length})
        </Text>

        {accounts.map((account) => (
          <List.Item
            key={account.id}
            title={account.email}
            description={`${account.id} • ${account.account_number} • ${account.role} • ${formatCurrency(account.balance)}`}
            left={(props) => (
              <List.Icon
                {...props}
                icon={account.role === 'admin' ? 'shield' : 'account'}
                color={account.role === 'admin' ? theme.colors.primary : theme.colors.onSurface}
              />
            )}
            right={(props) => (
              <Text {...props} variant="bodySmall" style={styles.accountDate}>
                {new Date(account.created_at).toLocaleDateString()}
              </Text>
            )}
          />
        ))}
      </Surface>

      {/* Recent Transactions */}
      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Transactions ({transactions.length})
        </Text>

        {transactions.slice(0, 10).map((transaction) => (
          <List.Item
            key={transaction.id}
            title={`${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} • ${formatCurrency(transaction.amount)}`}
            description={`${transaction.sender_email || 'System'} → ${transaction.receiver_email} • ${new Date(transaction.created_at).toLocaleDateString()}`}
            left={(props) => (
              <List.Icon
                {...props}
                icon="swap-horizontal"
                color={theme.colors.primary}
              />
            )}
          />
        ))}

        {transactions.length > 10 && (
          <List.Item
            title={`View all ${transactions.length} transactions`}
            left={(props) => <List.Icon {...props} icon="list" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        )}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontWeight: 'bold',
  },
  emailText: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  statLabel: {
    color: 'white',
    opacity: 0.9,
  },
  statValue: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  accountDate: {
    opacity: 0.7,
  },
});

export default AdminScreen; 