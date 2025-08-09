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
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadDashboardData();
  }, []);

 
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        accountAPI.getBalance(user.id),
        accountAPI.getTransactions(user.id, 5, 0),
      ]);

      setBalance(balanceRes.data.account.balance);
      setRecentTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'transfer':
        return 'swap-horizontal';
      case 'deposit':
        return 'arrow-down';
      case 'withdrawal':
        return 'arrow-up';
      default:
        return 'card';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'transfer':
        return theme.colors.primary;
      case 'deposit':
        return theme.colors.primary;
      case 'withdrawal':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
            <Text variant="titleMedium" style={styles.welcomeText}>
              Welcome back!
            </Text>
            <Text variant="bodyMedium" style={styles.emailText}>
              {user.email}
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

      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.balanceLabel}>
            Current Balance
          </Text>
          <Text variant="displaySmall" style={styles.balanceAmount}>
            {formatCurrency(balance)}
          </Text>
          <Text variant="bodySmall" style={styles.accountNumber}>
            Account: {user.account_number}
          </Text>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <Card style={styles.actionCard} onPress={() => navigation.navigate('Transfer')}>
            <Card.Content style={styles.actionContent}>
              <Ionicons name="swap-horizontal" size={32} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.actionText}>
                Transfer
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={() => navigation.navigate('Account')}>
            <Card.Content style={styles.actionContent}>
              <Ionicons name="card" size={32} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.actionText}>
                Account
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={() => navigation.navigate('Transactions')}>
            <Card.Content style={styles.actionContent}>
              <Ionicons name="list" size={32} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.actionText}>
                History
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recent Transactions
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Transactions')}
            compact
          >
            View All
          </Button>
        </View>

        {recentTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                No recent transactions
              </Text>
            </Card.Content>
          </Card>
        ) : (
          recentTransactions.map((transaction, index) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <Card.Content style={styles.transactionContent}>
                <View style={styles.transactionLeft}>
                  <Ionicons
                    name={getTransactionIcon(transaction.type)}
                    size={24}
                    color={getTransactionColor(transaction.type)}
                  />
                  <View style={styles.transactionInfo}>
                    <Text variant="bodyMedium" style={styles.transactionType}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    <Text variant="bodySmall" style={styles.transactionDate}>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
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
  balanceCard: {
    margin: 16,
    backgroundColor: '#2196F3',
  },
  balanceLabel: {
    color: 'white',
    opacity: 0.9,
  },
  balanceAmount: {
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 8,
  },
  accountNumber: {
    color: 'white',
    opacity: 0.8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionText: {
    marginTop: 8,
    textAlign: 'center',
  },
  emptyCard: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  transactionCard: {
    marginBottom: 8,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 12,
  },
  transactionType: {
    fontWeight: 'bold',
  },
  transactionDate: {
    opacity: 0.7,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
});

export default DashboardScreen; 