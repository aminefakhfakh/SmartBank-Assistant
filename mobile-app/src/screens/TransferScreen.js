import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  Card,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { transferAPI, accountAPI } from '../services/api';
import { refreshUserData } from '../utils/refreshUtils';

const TransferScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const theme = useTheme();

  React.useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await accountAPI.getBalance(user.id);
      setBalance(response.data.account.balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handleTransfer = async () => {
    if (!toAccountId || !amount || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (transferAmount > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (parseInt(toAccountId) === user.id) {
      Alert.alert('Error', 'Cannot transfer to your own account');
      return;
    }

    setLoading(true);
    try {
      const response = await transferAPI.transfer({
        fromAccountId: user.id,
        toAccountId: parseInt(toAccountId),
        amount: transferAmount,
        description,
      });

      Alert.alert(
        'Transfer Successful',
        `Successfully transferred ${formatCurrency(transferAmount)}`,
        [
          {
            text: 'OK',
            onPress: async () => {
              setToAccountId('');
              setAmount('');
              setDescription('');
              
              // Refresh user data and balance
              try {
                await refreshUserData(updateUser, accountAPI, user.id);
                loadBalance();
              } catch (error) {
                console.error('Error refreshing data:', error);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert(
        'Transfer Failed',
        error.response?.data?.error || 'Transfer failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.balanceLabel}>
              Available Balance
            </Text>
            <Text variant="headlineSmall" style={styles.balanceAmount}>
              {formatCurrency(balance || 0)}
            </Text>
          </Card.Content>
        </Card>

       
        <Surface style={styles.formContainer} elevation={2}>
          <Text variant="titleLarge" style={styles.formTitle}>
            Transfer Money
          </Text>

          <TextInput
            label="To Account ID"
            value={toAccountId}
            onChangeText={setToAccountId}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />

          <TextInput
            label="Description "
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            left={<TextInput.Icon icon="text" />}
          />

          <Button
            mode="contained"
            onPress={handleTransfer}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="send"
          >
            Send Transfer
          </Button>
        </Surface>

        
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.infoTitle}>
              Transfer Information
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Enter the recipient's Account ID
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Minimum transfer amount: TND 10.00
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Transfers are processed immediately
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • You cannot transfer to your own account
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  balanceCard: {
    marginBottom: 16,
    backgroundColor: '#4CAF50',
  },
  balanceLabel: {
    color: 'white',
    opacity: 0.9,
  },
  balanceAmount: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  formTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    marginBottom: 4,
    opacity: 0.8,
  },
});

export default TransferScreen; 