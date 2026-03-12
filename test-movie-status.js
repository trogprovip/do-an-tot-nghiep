// Test script for movie status functionality
const { getAutoMovieStatus } = require('./lib/utils/movieStatus.ts');

// Test cases
const testCases = [
  {
    name: 'Future date - Should be coming_soon',
    releaseDate: new Date('2026-12-31'),
    expected: 'coming_soon'
  },
  {
    name: 'Today - Should be now_showing', 
    releaseDate: new Date(),
    expected: 'now_showing'
  },
  {
    name: 'Past date - Should be now_showing',
    releaseDate: new Date('2024-01-01'),
    expected: 'now_showing'
  },
  {
    name: 'No release date - Should default to coming_soon',
    releaseDate: null,
    expected: 'coming_soon'
  }
];

console.log('Testing movie status logic...\n');

testCases.forEach((test, index) => {
  const result = getAutoMovieStatus({
    releaseDate: test.releaseDate,
    currentStatus: undefined
  });
  
  const passed = result === test.expected;
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`  Input: ${test.releaseDate}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Got: ${result}`);
  console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
});

console.log('Test completed!');
