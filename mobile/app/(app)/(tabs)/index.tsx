import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { router } from 'expo-router';
import { getChartData } from '../../../services/api';
import { ChartData } from '../../../types/api';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';

type TimeRange = 'all' | 'monthly' | 'weekly';

const HomeScreen: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{
    all: ChartData;
    monthly: ChartData;
    weekly: ChartData;
  } | null>(null);

  useEffect(() => {
    loadChartData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChartData();
    }, [])
  );

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChartData();
      setChartData(data);
    } catch (err) {
      setError('Failed to load chart data');
      Alert.alert('Error', 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !chartData) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadChartData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentData = chartData[selectedRange];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.subtitle}>Track your finances with ease</Text>
        </View>

        <View style={styles.filterContainer}>
          {['all', 'monthly', 'weekly'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.filterButton,
                selectedRange === range && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedRange(range as TimeRange)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedRange === range && styles.filterTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Income vs Expenses</Text>
          <LineChart
            data={{
              labels: currentData.labels,
              datasets: [
                {
                  data: currentData.income,
                  color: () => '#4FACFE',
                  strokeWidth: 2,
                },
                {
                  data: currentData.expenses,
                  color: () => '#FF6B6B',
                  strokeWidth: 2,
                },
              ],
              legend: ['Income', 'Expenses'],
            }}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(74, 85, 104, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(74, 85, 104, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#fff',
              },
              propsForLabels: {
                fontSize: 12,
                fontFamily: 'DMSans_400Regular',
              },
              formatYLabel: (value) => `Rp${parseInt(value).toLocaleString()}`,
              paddingRight: 0,
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={5}
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(app)/(tabs)/transactions')}
        >
          <Plus size={24} color="#fff" strokeWidth={2.5} />
          <Text style={styles.addButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'DMSans_500Medium',
    color: '#1A202C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#4A5568',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
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
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_500Medium',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -8,
  },
  addButton: {
    backgroundColor: '#4FACFE',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4FACFE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
});

export default HomeScreen;
