import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, Button, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useChildData } from '../context/ChildDataContext';
import { useMeasurements } from '../context/MeasurementContext';

const HomeScreen = ({ navigation }) => {
  const { childData, saveChildData } = useChildData();
  const { getLatestMeasurement, getMeasurementTrend } = useMeasurements();
  
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [gender, setGender] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (childData.name) {
      setName(childData.name);
      setDateOfBirth(childData.dateOfBirth ? new Date(childData.dateOfBirth) : new Date());
      setGender(childData.gender);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [childData]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter child\'s name');
      return;
    }
    if (!gender) {
      Alert.alert('Error', 'Please select gender');
      return;
    }

    const success = await saveChildData({
      name: name.trim(),
      dateOfBirth: dateOfBirth.toISOString(),
      gender,
    });

    if (success) {
      Alert.alert('Success', 'Child information saved!');
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'Failed to save information');
    }
  };

  const latestMeasurement = getLatestMeasurement();
  const trend = getMeasurementTrend();

  const QuickActionButton = ({ icon, title, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Child Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Child Information</Text>
              {!isEditing && childData.name && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Icon name="pencil" size={24} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <>
                <Text style={styles.label}>Child Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter child's name"
                  placeholderTextColor="#9E9E9E"
                />

                <Text style={styles.label}>Date Of Birth</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{dateOfBirth.toLocaleDateString()}</Text>
                  <Icon name="calendar" size={20} color="#757575" />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setDateOfBirth(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}

                <Text style={styles.label}>Gender</Text>
                <RadioButton.Group onValueChange={setGender} value={gender}>
                  <View style={styles.radioContainer}>
                    <View style={styles.radioItem}>
                      <RadioButton value="male" color="#4CAF50" />
                      <Text>Male</Text>
                    </View>
                    <View style={styles.radioItem}>
                      <RadioButton value="female" color="#4CAF50" />
                      <Text>Female</Text>
                    </View>
                  </View>
                </RadioButton.Group>

                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                  buttonColor="#4CAF50"
                >
                  Save Information
                </Button>
              </>
            ) : (
              <View style={styles.childInfo}>
                <View style={styles.infoRow}>
                  <Icon name="account" size={20} color="#757575" />
                  <Text style={styles.infoText}>{childData.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="cake-variant" size={20} color="#757575" />
                  <Text style={styles.infoText}>
                    {new Date(childData.dateOfBirth).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="gender-male-female" size={20} color="#757575" />
                  <Text style={styles.infoText}>
                    {childData.gender === 'male' ? 'Male' : 'Female'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="calendar-clock" size={20} color="#757575" />
                  <Text style={styles.infoText}>
                    Age: {Math.floor(childData.age / 12)} years {childData.age % 12} months
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Status Card */}
        {latestMeasurement && (
          <Card style={[styles.card, styles.statusCard]}>
            <Card.Content>
              <Text style={styles.cardTitle}>Current Status</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Weight</Text>
                  <Text style={styles.statusValue}>{latestMeasurement.weight} kg</Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Height</Text>
                  <Text style={styles.statusValue}>{latestMeasurement.height} cm</Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: latestMeasurement.status.color + '20' }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      { color: latestMeasurement.status.color }
                    ]}>
                      {latestMeasurement.status.label}
                    </Text>
                  </View>
                </View>
              </View>
              {trend !== 'insufficient' && (
                <View style={styles.trendContainer}>
                  <Icon 
                    name={trend === 'increasing' ? 'trending-up' : trend === 'decreasing' ? 'trending-down' : 'trending-neutral'} 
                    size={20} 
                    color={trend === 'increasing' ? '#4CAF50' : trend === 'decreasing' ? '#FF5252' : '#FFA726'} 
                  />
                  <Text style={styles.trendText}>
                    Weight trend: {trend}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="chart-line"
            title="Track Growth"
            color="#4CAF50"
            onPress={() => navigation.navigate('Growth')}
          />
          <QuickActionButton
            icon="camera"
            title="Photo Scan"
            color="#42A5F5"
            onPress={() => navigation.navigate('Scan')}
          />
          <QuickActionButton
            icon="robot"
            title="Ask AI"
            color="#9C27B0"
            onPress={() => navigation.navigate('Chat')}
          />
        </View>

        {/* Tips Card */}
        <Card style={[styles.card, styles.tipsCard]}>
          <Card.Content>
            <View style={styles.tipsHeader}>
              <Icon name="lightbulb" size={24} color="#FFA726" />
              <Text style={styles.cardTitle}>Today's Tip</Text>
            </View>
            <Text style={styles.tipText}>
           Regular growth monitoring helps detect malnutrition early. Measure your child's weight and height monthly for best.
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
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginTop: 12,
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
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  radioContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 25,
  },
  childInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#424242',
  },
  statusCard: {
    backgroundColor: '#E8F5E9',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  trendText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#FFF3E0',
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});

export default HomeScreen;
