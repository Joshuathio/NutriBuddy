import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MeasurementContext = createContext();

export const useMeasurements = () => {
  const context = useContext(MeasurementContext);
  if (!context) {
    throw new Error('useMeasurements must be used within a MeasurementProvider');
  }
  return context;
};

export const MeasurementProvider = ({ children }) => {
  const [measurements, setMeasurements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const savedMeasurements = await AsyncStorage.getItem('measurements');
      if (savedMeasurements) {
        setMeasurements(JSON.parse(savedMeasurements));
      }
    } catch (error) {
      console.error('Error loading measurements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMeasurement = async (measurement) => {
    try {
      const newMeasurement = {
        ...measurement,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: calculateNutritionalStatus(measurement.weight, measurement.height),
      };

      const updatedMeasurements = [...measurements, newMeasurement];
      await AsyncStorage.setItem('measurements', JSON.stringify(updatedMeasurements));
      setMeasurements(updatedMeasurements);
      return { success: true, status: newMeasurement.status };
    } catch (error) {
      console.error('Error adding measurement:', error);
      return { success: false, error };
    }
  };

  const deleteMeasurement = async (id) => {
    try {
      const updatedMeasurements = measurements.filter(m => m.id !== id);
      await AsyncStorage.setItem('measurements', JSON.stringify(updatedMeasurements));
      setMeasurements(updatedMeasurements);
      return true;
    } catch (error) {
      console.error('Error deleting measurement:', error);
      return false;
    }
  };

  const calculateNutritionalStatus = (weight, height) => {
    // BMI calculation for nutritional status
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    if (bmi < 16) {
      return {
        level: 'severe',
        label: 'Severe Malnutrition',
        color: '#FF5252',
        message: 'Immediate medical attention required',
      };
    } else if (bmi < 17) {
      return {
        level: 'moderate',
        label: 'Moderate Malnutrition',
        color: '#FFA726',
        message: 'Medical consultation recommended',
      };
    } else if (bmi < 18.5) {
      return {
        level: 'mild',
        label: 'Mild Malnutrition',
        color: '#FFB74D',
        message: 'Monitor closely and improve nutrition',
      };
    } else if (bmi <= 24.9) {
      return {
        level: 'normal',
        label: 'Normal',
        color: '#4CAF50',
        message: 'Healthy weight - keep it up!',
      };
    } else if (bmi <= 29.9) {
      return {
        level: 'overweight',
        label: 'Overweight',
        color: '#FFA726',
        message: 'Consider balanced diet and exercise',
      };
    } else {
      return {
        level: 'obese',
        label: 'Obese',
        color: '#FF5252',
        message: 'Medical consultation recommended',
      };
    }
  };

  const getLatestMeasurement = () => {
    if (measurements.length === 0) return null;
    return measurements.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    );
  };

  const getMeasurementTrend = () => {
    if (measurements.length < 2) return 'insufficient';
    
    const sorted = [...measurements].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    const recent = sorted.slice(-3);
    const weights = recent.map(m => m.weight);
    
    const increasing = weights.every((w, i) => i === 0 || w >= weights[i - 1]);
    const decreasing = weights.every((w, i) => i === 0 || w <= weights[i - 1]);
    
    if (increasing) return 'increasing';
    if (decreasing) return 'decreasing';
    return 'stable';
  };

  const clearMeasurements = async () => {
    try {
      await AsyncStorage.removeItem('measurements');
      setMeasurements([]);
    } catch (error) {
      console.error('Error clearing measurements:', error);
    }
  };

  const value = {
    measurements,
    isLoading,
    addMeasurement,
    deleteMeasurement,
    calculateNutritionalStatus,
    getLatestMeasurement,
    getMeasurementTrend,
    clearMeasurements,
  };

  return (
    <MeasurementContext.Provider value={value}>
      {children}
    </MeasurementContext.Provider>
  );
};
