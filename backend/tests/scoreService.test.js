const ScoreService = require('../services/ScoreService');

describe('ScoreService.computeCompletionRatio', () => {
  test('counter: sums increments and caps ratio at 1', () => {
    const activity = { type: 'counter', targetValue: 6000 };
    const entry = { increments: [{ value: 2000 }, { value: 1000 }] };
    expect(ScoreService.computeCompletionRatio(activity, entry)).toBeCloseTo(0.5);

    const overEntry = { increments: [{ value: 4000 }, { value: 5000 }] };
    expect(ScoreService.computeCompletionRatio(activity, overEntry)).toBe(1);
  });

  test('duration: sums session minutes against target', () => {
    const activity = { type: 'duration', targetValue: 360 };
    const entry = { increments: [{ value: 120 }, { value: 60 }] };
    expect(ScoreService.computeCompletionRatio(activity, entry)).toBeCloseTo(0.5);
  });

  test('checkbox: done true/false maps to 1/0', () => {
    const activity = { type: 'checkbox' };
    expect(ScoreService.computeCompletionRatio(activity, { done: true })).toBe(1);
    expect(ScoreService.computeCompletionRatio(activity, { done: false })).toBe(0);
  });

  test('checklist: ratio is doneCount / totalItems', () => {
    const activity = { type: 'checklist' };
    const entry = {
      subItemStatuses: [
        { label: 'Fajr', done: true },
        { label: 'Dhuhr', done: true },
        { label: 'Asr', done: false },
        { label: 'Maghrib', done: false },
        { label: 'Isha', done: false },
      ],
    };
    expect(ScoreService.computeCompletionRatio(activity, entry)).toBeCloseTo(0.4);
  });

  test('missing entry yields 0 completion', () => {
    expect(ScoreService.computeCompletionRatio({ type: 'counter', targetValue: 100 }, null)).toBe(0);
  });
});

describe('ScoreService.computePointsEarned', () => {
  test('proportional model scales points by completion ratio', () => {
    const activity = { scoringModel: 'proportional', pointsWeight: 20 };
    expect(ScoreService.computePointsEarned(activity, 0.5)).toBe(10);
    expect(ScoreService.computePointsEarned(activity, 1)).toBe(20);
    expect(ScoreService.computePointsEarned(activity, 0)).toBe(0);
  });

  test('fixed model only awards points at full completion', () => {
    const activity = { scoringModel: 'fixed', pointsWeight: 25 };
    expect(ScoreService.computePointsEarned(activity, 1)).toBe(25);
    expect(ScoreService.computePointsEarned(activity, 0.99)).toBe(0);
    expect(ScoreService.computePointsEarned(activity, 0)).toBe(0);
  });
});

describe('ScoreService.computeJamaathBonus', () => {
  test('awards 2 flat points per jama\'ath prayer, only on the 5 Daily Prayers activity', () => {
    const prayerActivity = { type: 'checklist', name: '5 Daily Prayers' };
    const entry = {
      subItemStatuses: [
        { label: 'Fajr', done: true, jamaath: true },
        { label: 'Dhuhr', done: true, jamaath: false },
        { label: 'Asr', done: false, jamaath: true }, // not done -> shouldn't count
        { label: 'Maghrib', done: false, jamaath: false },
        { label: 'Isha', done: false, jamaath: false },
      ],
    };
    expect(ScoreService.computeJamaathBonus(prayerActivity, entry)).toBe(2);

    const allJamaath = {
      subItemStatuses: entry.subItemStatuses.map((s) => ({ ...s, done: true, jamaath: true })),
    };
    expect(ScoreService.computeJamaathBonus(prayerActivity, allJamaath)).toBe(10);

    const otherChecklist = { type: 'checklist', name: 'Some Other Checklist' };
    expect(ScoreService.computeJamaathBonus(otherChecklist, allJamaath)).toBe(0);

    expect(ScoreService.computeJamaathBonus(prayerActivity, null)).toBe(0);
  });
});
