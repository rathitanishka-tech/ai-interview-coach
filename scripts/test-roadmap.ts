import { getCalendarDaysDiff, getRoadmap, saveRoadmap, InterviewRoadmap } from '../lib/roadmap/storage';

// mock localStorage
const store: Record<string, string> = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).window = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; }
};

// Helper to set current time for Date.now()
let currentTime = Date.now();
const originalDateNow = Date.now;
global.Date.now = () => currentTime;

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
  console.log('✅ ' + msg);
}

try {
  console.log('--- Testing Calendar Day Calculation ---');
  // 1. Test getCalendarDaysDiff
  const createdLate = new Date('2026-03-10T23:00:00').getTime(); // 11 PM
  const nextMorning = new Date('2026-03-11T01:00:00').getTime(); // 1 AM next day
  assert(getCalendarDaysDiff(createdLate, nextMorning) === 1, 'Transition to next calendar day is 1 day diff (late night creation)');

  const sameDayLater = new Date('2026-03-10T23:59:59').getTime(); // 11:59 PM
  assert(getCalendarDaysDiff(createdLate, sameDayLater) === 0, 'Same calendar day is 0 day diff');

  const day7 = new Date('2026-03-16T23:59:59').getTime(); // 6 days later, meaning it is the 7th day of the roadmap
  assert(getCalendarDaysDiff(createdLate, day7) === 6, 'Day 7 is 6 days diff');

  const day8 = new Date('2026-03-17T00:00:00').getTime(); // 7 full calendar days later, meaning expiration
  assert(getCalendarDaysDiff(createdLate, day8) === 7, 'Day 8 is 7 days diff');

  console.log('\n--- Testing Roadmap Persistence & Expiration ---');
  // 2. Test getRoadmap persistence and expiration
  const roadmap: InterviewRoadmap = {
    id: 'test-1',
    createdAt: createdLate,
    targetRole: 'Test',
    targetDifficulty: 'Medium',
    readinessSnapshot: 50,
    days: []
  };

  saveRoadmap(roadmap);

  // Fast forward to Day 7
  currentTime = day7;
  const retrieved = getRoadmap();
  assert(retrieved !== null && retrieved.id === 'test-1', 'Roadmap persists and does not expire on Day 7');

  // Fast forward to Day 8
  currentTime = day8;
  const expired = getRoadmap();
  assert(expired === null, 'Roadmap expires strictly after 7 full calendar days (on Day 8)');
  assert(store['ai_interview_coach_roadmap'] === undefined, 'Roadmap is cleared from storage upon expiration');

  console.log('\nAll tests passed successfully!');
} catch (e) {
  console.error('❌ Test failed:', e);
  process.exit(1);
} finally {
  global.Date.now = originalDateNow;
}
