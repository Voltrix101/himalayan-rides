// Manual script to initialize bike tour plans in Firebase
// Run this once after signing in as an admin

import { BikeTourPlanService } from '../services/bikeTourPlanService';

export const initializeBikeTours = async () => {
  try {
    console.log('🚀 Starting bike tour initialization...');
    
    // Check if collection is empty
    const isEmptyResult = await BikeTourPlanService.isCollectionEmpty();
    
    if (isEmptyResult) {
      console.log('📝 Collection is empty, initializing with default plans...');
      await BikeTourPlanService.initializeDefaultPlans();
      console.log('✅ Bike tours initialized successfully!');
    } else {
      console.log('📋 Bike tours already exist in the database');
    }
  } catch (error) {
    console.error('❌ Error initializing bike tours:', error);
    throw error;
  }
};

// For browser console usage
(window as any).initializeBikeTours = initializeBikeTours;
