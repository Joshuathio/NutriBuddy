
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Card, Button, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';
import { useMeasurements } from '../context/MeasurementContext';
import { useChildData } from '../context/ChildDataContext';

const { width: screenWidth } = Dimensions.get('window');

const GrowthScreen = () => {
  const { measurements, addMeasurement, deleteMeasurement } = useMeasurements();
  const { childData } = useChildData();
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedChart, setSelectedChart] = useState('weight');

  const handleSaveMeasurement = async () => {
    if (!weight || !height) {
      Alert.alert('Error', 'Please enter both weight and height');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    if (weightNum <= 0 || heightNum <= 0) {
      Alert.alert('Error', 'Weight and height must be positive values');
      return;
    }

    const result = await addMeasurement({
      weight: weightNum,
      height: heightNum,
    });

    if (result.success) {
      Alert.alert(
        'Measurement Saved',
        `Status: ${result.status.label}\n${result.status.message}`,
        [{ text: 'OK', style: 'default' }]
      );
      setWeight('');
      setHeight('');
      setShowAddForm(false);
    } else {
      Alert.alert('Error', 'Failed to save measurement');
    }
  };

  const handleDeleteMeasurement = (id) => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteMeasurement(id);
            if (!success) {
              Alert.alert('Error', 'Failed to delete measurement');
            }
          },
        },
      ]
    );
  };

  const getChartData = () => {
    if (measurements.length === 0) {
      return null;
    }

    const sortedMeasurements = [...measurements].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const labels = sortedMeasurements.map((m) => {
      const date = new Date(m.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = sortedMeasurements.map((m) => 
      selectedChart === 'weight' ? m.weight : m.height
    );

    //WHO reference lines (simplified for demo)
    const ageInMonths = childData.age || 24;
    const whoData = generateWHOData(selectedChart, ageInMonths, data.length);

    return {
      labels: labels.slice(-6), //Show last 6 measurements
      datasets: [
        {
          data: data.slice(-6),
          color: (opacity = 1) => `rgba(66, 165, 245, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: whoData.p50,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 1,
          withDots: false,
        },
        {
          data: whoData.p85,
          color: (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
          strokeWidth: 1,
          withDots: false,
        },
      ],
      legend: ['Actual', 'Normal (P50)', 'Upper (P85)'],
    };
  };

  const generateWHOData = (type, ageMonths, length) => {
    //Simplified WHO reference data (would be replaced with actual WHO data)
    const baseWeight = 12 + (ageMonths * 0.2);
    const baseHeight = 75 + (ageMonths * 0.8);
    
    const base = type === 'weight' ? baseWeight : baseHeight;
    
    return {
      p50: Array(length).fill(base),
      p85: Array(length).fill(base * 1.15),
      p15: Array(length).fill(base * 0.85),
    };
  };

  const chartData = getChartData();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Chart Selection */}
        <View style={styles.chartSelector}>
          <TouchableOpacity
            style={[
              styles.chartOption,
              selectedChart === 'weight' && styles.chartOptionActive,
            ]}
            onPress={() => setSelectedChart('weight')}
          >
            <Text
              style={[
                styles.chartOptionText,
                selectedChart === 'weight' && styles.chartOptionTextActive,
              ]}
            >
              Weight Chart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chartOption,
              selectedChart === 'height' && styles.chartOptionActive,
            ]}
            onPress={() => setSelectedChart('height')}
          >
            <Text
              style={[
                styles.chartOptionText,
                selectedChart === 'height' && styles.chartOptionTextActive,
              ]}
            >
              Height Chart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Growth Chart */}
        {chartData ? (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>
                {selectedChart === 'weight' ? 'Weight' : 'Height'} Progress
              </Text>
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(66, 165, 245, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#42A5F5',
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#42A5F5' }]} />
                  <Text style={styles.legendText}>Your Child</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>WHO Normal</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FFA726' }]} />
                  <Text style={styles.legendText}>WHO P85</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Icon name="chart-line" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No measurements yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first measurement to see growth charts
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Add Measurement Form */}
        {showAddForm && (
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.formTitle}>New Measurement</Text>
              <Text style={styles.dateText}>
                Date: {new Date().toLocaleDateString()}
              </Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="0.0"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="0.0"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
              </View>

              <View style={styles.formButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowAddForm(false);
                    setWeight('');
                    setHeight('');
                  }}
                  style={styles.cancelButton}
                  textColor="#757575"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveMeasurement}
                  style={styles.saveButton}
                  buttonColor="#4CAF50"
                >
                  Save
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Measurement History */}
        <Card style={styles.historyCard}>
          <Card.Content>
            <Text style={styles.historyTitle}>Measurement History</Text>
            {measurements.length > 0 ? (
              [...measurements]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((measurement) => (
                  <TouchableOpacity
                    key={measurement.id}
                    style={styles.historyItem}
                    onLongPress={() => handleDeleteMeasurement(measurement.id)}
                  >
                    <View style={styles.historyContent}>
                      <View>
                        <Text style={styles.historyDate}>
                          {new Date(measurement.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.historyMeasurements}>
                          Weight: {measurement.weight} kg | Height: {measurement.height} cm
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: measurement.status.color + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: measurement.status.color },
                          ]}
                        >
                          {measurement.status.label}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
            ) : (
              <Text style={styles.noHistoryText}>No measurements recorded yet</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddForm(!showAddForm)}
        color="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chartSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  chartOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chartOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  chartOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  chartOptionTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#757575',
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
  },
  formCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    borderColor: '#E0E0E0',
  },
  saveButton: {
    borderRadius: 25,
  },
  historyCard: {
    margin: 16,
    marginBottom: 80,
    elevation: 2,
    borderRadius: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  historyMeasurements: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noHistoryText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default GrowthScreen;
