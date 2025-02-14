import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../../services/api';
import { Transaction } from '../../../types/api';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';

const TransactionScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'expense' | 'income'
  >('all');

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [selectedFilter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      setError(null);
      const filter = {
        type: selectedFilter === 'all' ? undefined : selectedFilter,
        search: searchQuery || undefined,
      };
      const data = await getTransactions(filter);
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, [selectedFilter, searchQuery]);

  const handleSubmit = async () => {
    if (!name || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        const updatedTransaction = await updateTransaction(editingId, {
          name,
          amount: parseFloat(amount),
          type,
          date: date.toISOString(),
        });
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingId ? updatedTransaction : t))
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        const newTransaction = await addTransaction({
          name,
          amount: parseFloat(amount),
          type,
          date: date.toISOString(),
        });
        setTransactions((prev) => [newTransaction, ...prev]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      resetForm();
      setModalVisible(false);
    } catch (err) {
      Alert.alert(
        'Error',
        editingId ? 'Failed to update transaction' : 'Failed to add transaction'
      );
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setName(transaction.name);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setDate(new Date(transaction.date));
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              setTransactions((prev) => prev.filter((t) => t.id !== id));
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setType('expense');
    setDate(new Date());
    setEditingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    return `${type === 'expense' ? '-' : '+'}Rp${amount.toLocaleString()}`;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'expense' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('expense')}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'expense' && styles.filterTextActive,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'income' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('income')}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'income' && styles.filterTextActive,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.transactionList}
        contentContainerStyle={styles.transactionListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadTransactions}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => handleEdit(transaction)}
              onLongPress={() => handleDelete(transaction.id)}
            >
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionName}>{transaction.name}</Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.date.toString())}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      transaction.type === 'income' ? '#34C759' : '#FF3B30',
                  },
                ]}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Transaction' : 'Add Transaction'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'expense' && styles.typeButtonActive,
                ]}
                onPress={() => setType('expense')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'expense' && styles.typeButtonTextActive,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'income' && styles.typeButtonActive,
                ]}
                onPress={() => setType('income')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'income' && styles.typeButtonTextActive,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              <Text style={styles.dateButtonText}>
                {date.toLocaleDateString('id-ID')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {editingId ? 'Update Transaction' : 'Add Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'DMSans_500Medium',
    color: '#1A202C',
  },
  addButton: {
    backgroundColor: '#4FACFE',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4FACFE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#4A5568',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
    marginHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
  },
  filterButtonActive: {
    backgroundColor: '#4FACFE',
  },
  filterText: {
    color: '#4A5568',
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  filterTextActive: {
    color: '#fff',
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionListContent: {
    padding: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#1A202C',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#4A5568',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#4A5568',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_500Medium',
    color: '#1A202C',
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#1A202C',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4FACFE',
  },
  typeButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#4A5568',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#4FACFE',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#4FACFE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4FACFE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4FACFE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionScreen;
