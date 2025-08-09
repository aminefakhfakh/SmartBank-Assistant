// Utility functions for refreshing data across the app

export const refreshUserData = async (updateUser, accountAPI, userId) => {
  try {
    // Refresh user balance and account details
    const balanceResponse = await accountAPI.getBalance(userId);
    const accountResponse = await accountAPI.getDetails(userId);
    
    // Update user data with fresh balance
    const updatedUser = {
      ...accountResponse.data.account,
      balance: balanceResponse.data.account.balance
    };
    
    updateUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    throw error;
  }
};

export const refreshDashboardData = async (accountAPI, userId) => {
  try {
    const [balanceRes, transactionsRes] = await Promise.all([
      accountAPI.getBalance(userId),
      accountAPI.getTransactions(userId, 5, 0),
    ]);

    return {
      balance: balanceRes.data.account.balance,
      transactions: transactionsRes.data.transactions
    };
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
    throw error;
  }
}; 