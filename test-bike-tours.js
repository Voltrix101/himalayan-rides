// Test script to verify bike tours functionality
const { bikeToursService } = require('./src/services/bikeToursService');

async function testBikeTours() {
  console.log('🧪 Testing Bike Tours Service...');
  
  try {
    // Test 1: Get all bike tours
    console.log('\n1. Testing getAllBikeTours()...');
    const tours = await bikeToursService.getAllBikeTours();
    console.log(`✅ Found ${tours.length} bike tours`);
    
    // Test 2: Add a test tour
    console.log('\n2. Testing addBikeTourPlan()...');
    const testTour = {
      title: 'Test Tour - Delete Me',
      duration: '1 Day',
      price: 1000,
      highlights: ['Test Highlight'],
      itinerary: [
        {
          day: 1,
          title: 'Test Day',
          description: 'This is a test tour that should be deleted'
        }
      ],
      description: 'This is a test tour for verification',
      coverImage: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
      isFeatured: false
    };
    
    const newTourId = await bikeToursService.addBikeTourPlan(testTour);
    console.log(`✅ Added test tour with ID: ${newTourId}`);
    
    // Test 3: Update the test tour
    console.log('\n3. Testing updateBikeTourPlan()...');
    await bikeToursService.updateBikeTourPlan(newTourId, {
      title: 'Updated Test Tour - Delete Me',
      price: 2000
    });
    console.log('✅ Updated test tour successfully');
    
    // Test 4: Delete the test tour
    console.log('\n4. Testing deleteBikeTourPlan()...');
    await bikeToursService.deleteBikeTourPlan(newTourId);
    console.log('✅ Deleted test tour successfully');
    
    console.log('\n🎉 All bike tours tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBikeTours(); 