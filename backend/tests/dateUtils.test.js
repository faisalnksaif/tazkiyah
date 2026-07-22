const { getChallengeStatus, addDays, toDateKey } = require('../utils/dateUtils');

describe('getChallengeStatus', () => {
  test('respects a configurable durationDays instead of assuming 21', () => {
    const start = '2026-01-01';
    const config = { startDate: new Date(`${start}T00:00:00.000Z`), durationDays: 10 };

    const status = getChallengeStatus(config, new Date('2026-01-05T00:00:00.000Z'));
    expect(status.totalDays).toBe(10);
    expect(status.dayNumber).toBe(5);
    expect(status.isOver).toBe(false);

    const overStatus = getChallengeStatus(config, new Date('2026-01-20T00:00:00.000Z'));
    expect(overStatus.isOver).toBe(true);
  });

  test('day number caps at durationDays and never exceeds it', () => {
    const config = { startDate: new Date('2026-01-01T00:00:00.000Z'), durationDays: 21 };
    const status = getChallengeStatus(config, new Date('2026-03-01T00:00:00.000Z'));
    expect(status.dayNumber).toBe(21);
  });

  test('addDays and toDateKey round-trip correctly', () => {
    expect(addDays('2026-01-30', 2)).toBe('2026-02-01');
    expect(toDateKey(new Date('2026-01-01T23:59:59.000Z'))).toBe('2026-01-01');
  });
});
