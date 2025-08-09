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
  Card,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

const TransactionsScreen = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadTransactions();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await accountAPI.getTransactions(user.id, 50, 0);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
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
        <Text style={styles.loadingText}>Loading transactions...</Text>
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
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Transaction History
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {transactions.length} transactions found
        </Text>
      </View>

      {transactions.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Ionicons name="list" size={64} color={theme.colors.outline} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Transactions
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              You haven't made any transactions yet.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        transactions.map((transaction) => (
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
                  {transaction.description && (
                    <Text variant="bodySmall" style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                  )}
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
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  emptyCard: {
    margin: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  transactionCard: {
    marginHorizontal: 16,
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
  transactionDescription: {
    opacity: 0.6,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
});

export default TransactionsScreen; 