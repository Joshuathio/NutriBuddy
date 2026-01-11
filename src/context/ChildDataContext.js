import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChildDataContext = createContext();

export const useChildData = () => {
  const context = useContext(ChildDataContext);
  if (!context) {
    throw new Error('useChildData must be used within a ChildDataProvider');
  }
  return context;
};

export const ChildDataProvider = ({ children }) => {
  const [childData, setChildData] = useState({
    name: '',
    dateOfBirth: null,
    gender: '',
    age: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load child data from storage
  useEffect(() => {
    loadChildData();
  }, []);

  const loadChildData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('childData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setChildData(parsed);
        calculateAge(parsed.dateOfBirth);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChildData = async (data) => {
    try {
      const dataToSave = {
        ...data,
        age: calculateAge(data.dateOfBirth),
      };
      await AsyncStorage.setItem('childData', JSON.stringify(dataToSave));
      setChildData(dataToSave);
      return true;
    } catch (error) {
      console.error('Error saving child data:', error);
      return false;
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());
    return ageInMonths;
  };

  const clearChildData = async () => {
    try {
      await AsyncStorage.removeItem('childData');
      setChildData({
        name: '',
        dateOfBirth: null,
        gender: '',
        age: 0,
      });
    } catch (error) {
      console.error('Error clearing child data:', error);
    }
  };

  const value = {
    childData,
    isLoading,
    saveChildData,
    clearChildData,
    calculateAge,
  };

  return (
    <ChildDataContext.Provider value={value}>
      {children}
    </ChildDataContext.Provider>
  );
};
