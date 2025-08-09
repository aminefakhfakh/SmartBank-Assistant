import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  List,
  useTheme,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const theme = useTheme();

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

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.profileInfo}>
          <Ionicons name="person-circle" size={80} color={theme.colors.primary} />
          <View style={styles.userInfo}>
            <Text variant="titleLarge" style={styles.userName}>
              {user.email}
            </Text>
            <Text variant="bodyMedium" style={styles.userRole}>
              {user.role === 'admin' ? 'Administrator' : 'Standard User'}
            </Text>
            <Text variant="bodySmall" style={styles.accountNumber}>
              Account: {user.account_number}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Settings */}
      <Surface style={styles.settingsContainer} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account Settings
        </Text>

        <List.Item
          title="Account Details"
          description="View and edit your account information"
          left={(props) => <List.Icon {...props} icon="account" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title="Security"
          description="Change password and security settings"
          left={(props) => <List.Icon {...props} icon="shield" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title="Notifications"
          description="Manage your notification preferences"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
      </Surface>

      {/* App Info */}
      <Surface style={styles.infoContainer} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          App Information
        </Text>

        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />

        <List.Item
          title="Support"
          description="Get help and contact support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title="Privacy Policy"
          description="Read our privacy policy"
          left={(props) => <List.Icon {...props} icon="file-text" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title="Terms of Service"
          description="Read our terms of service"
          left={(props) => <List.Icon {...props} icon="file-text" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
      </Surface>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          icon="logout"
          style={styles.logoutButton}
          buttonColor={theme.colors.error}
          textColor={theme.colors.error}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  userRole: {
    opacity: 0.7,
    marginTop: 4,
  },
  accountNumber: {
    opacity: 0.6,
    marginTop: 4,
  },
  settingsContainer: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  infoContainer: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  logoutContainer: {
    margin: 16,
  },
  logoutButton: {
    borderRadius: 8,
  },
});

export default ProfileScreen; 