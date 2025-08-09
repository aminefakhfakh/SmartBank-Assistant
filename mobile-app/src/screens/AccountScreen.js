import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  Surface,
  Card,
  Button,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

const AccountScreen = () => {
  const { user, updateUser } = useAuth();
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const theme = useTheme();

  useEffect(() => {
    loadAccountDetails();
  }, []);

  
  useFocusEffect(
    React.useCallback(() => {
      loadAccountDetails();
    }, [])
  );

  const loadAccountDetails = async () => {
    try {
      setLoading(true);
      const response = await accountAPI.getDetails(user.id);
      setAccountDetails(response.data.account);
      setEmail(response.data.account.email);
    } catch (error) {
      console.error('Error loading account details:', error);
      Alert.alert('Error', 'Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!email) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      const updateData = { email };
      if (newPassword) {
        updateData.password = newPassword;
      }

      const response = await accountAPI.updateAccount(user.id, updateData);
      
      Alert.alert('Success', 'Account updated successfully');
      setEditing(false);
      setNewPassword('');
      setConfirmPassword('');
      loadAccountDetails();
      updateUser(response.data.account);
    } catch (error) {
      console.error('Error updating account:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update account');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading account details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Account Info Card */}
      <Card style={styles.accountCard}>
        <Card.Content>
          <View style={styles.accountHeader}>
            <Ionicons name="card" size={48} color={theme.colors.primary} />
            <View style={styles.accountInfo}>
              <Text variant="titleLarge" style={styles.accountNumber}>
                {accountDetails?.account_number}
              </Text>
              <Text variant="bodyMedium" style={styles.accountType}>
                {accountDetails?.role === 'admin' ? 'Administrator' : 'Standard Account'}
              </Text>
            </View>
          </View>
          
          <View style={styles.balanceSection}>
            <Text variant="titleMedium" style={styles.balanceLabel}>
              Current Balance
            </Text>
            <Text variant="headlineSmall" style={styles.balanceAmount}>
              {formatCurrency(accountDetails?.balance || 0)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Account Details */}
      <Surface style={styles.detailsContainer} elevation={2}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Details
          </Text>
          <Button
            mode="text"
            onPress={() => setEditing(!editing)}
            icon={editing ? 'close' : 'pencil'}
            compact
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="New Password (Optional)"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleUpdate}
              style={styles.updateButton}
            >
              Update Account
            </Button>
          </View>
        ) : (
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Email
              </Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {accountDetails?.email}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Account ID
              </Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {accountDetails?.id}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Account Type
              </Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {accountDetails?.role === 'admin' ? 'Administrator' : 'Standard'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Created Date
              </Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {new Date(accountDetails?.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
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
  accountCard: {
    margin: 16,
    backgroundColor: '#2196F3',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountInfo: {
    marginLeft: 16,
  },
  accountNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  accountType: {
    color: 'white',
    opacity: 0.8,
  },
  balanceSection: {
    marginTop: 16,
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
  detailsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
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
  editForm: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 8,
  },
  detailsList: {
    marginTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontWeight: 'bold',
    opacity: 0.7,
  },
  detailValue: {
    fontWeight: '500',
  },
});

export default AccountScreen; 