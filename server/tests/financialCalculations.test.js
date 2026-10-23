const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateCommission,
  calculateRefundSplit,
  calculateAvailablePayoutPaise,
} = require('../utils/financialCalculations');
const { getScheduledPayoutDate } = require('../services/financialService');
const { addCalendarMonths } = require('../utils/datePeriods');

test('commission splits integer paise and assigns rounding remainder to the institute', () => {
  assert.deepEqual(calculateCommission(10000, 2000), {
    platformSharePaise: 2000,
    instituteSharePaise: 8000,
  });
  assert.deepEqual(calculateCommission(101, 2000), {
    platformSharePaise: 20,
    instituteSharePaise: 81,
  });
  assert.deepEqual(calculateCommission(1, 10000), {
    platformSharePaise: 1,
    instituteSharePaise: 0,
  });
});

test('refund splits honor rounding and never exceed original shares', () => {
  const full = calculateRefundSplit(101, 101, 2000);
  assert.deepEqual(full, calculateCommission(101, 2000));

  const firstPartial = calculateRefundSplit(101, 1, 2000);
  const cumulative = calculateRefundSplit(101, 2, 2000);
  const secondPartialInstituteRefund = cumulative.instituteSharePaise - firstPartial.instituteSharePaise;
  const secondPartialPlatformRefund = cumulative.platformSharePaise - firstPartial.platformSharePaise;

  assert.equal(firstPartial.instituteSharePaise + secondPartialInstituteRefund, 2);
  assert.equal(firstPartial.platformSharePaise + secondPartialPlatformRefund, 0);
});

test('payout balance includes shares and adjustments, reserves, and reverses failed payouts', () => {
  assert.equal(calculateAvailablePayoutPaise([
    { type: 'purchase', amountPaise: 10000 },
    { type: 'institute_share', amountPaise: 8000 },
    { type: 'gateway_fee', amountPaise: -100 },
    { type: 'tax', amountPaise: -200 },
    { type: 'refund', amountPaise: -800 },
    { type: 'payout', amountPaise: -3000 },
    { type: 'payout_reversal', amountPaise: 3000 },
  ]), 6900);
});

test('commission calculation rejects fractional paise and out-of-range rates', () => {
  assert.throws(() => calculateCommission(1.5, 2000), TypeError);
  assert.throws(() => calculateCommission(100, 10001), TypeError);
});

test('payout schedules calculate their next UTC processing date', () => {
  const monday = new Date('2026-10-26T12:00:00.000Z');
  assert.equal(
    getScheduledPayoutDate('weekly', monday).toISOString(),
    '2026-11-02T00:00:00.000Z',
  );
  assert.equal(
    getScheduledPayoutDate('monthly', monday).toISOString(),
    '2026-11-01T00:00:00.000Z',
  );
  assert.equal(
    getScheduledPayoutDate('quarterly', monday).toISOString(),
    '2027-01-01T00:00:00.000Z',
  );
  assert.equal(getScheduledPayoutDate('on_demand', monday).toISOString(), monday.toISOString());
});

test('subscription billing durations advance by calendar months and clamp month ends', () => {
  assert.equal(
    addCalendarMonths(new Date('2026-01-31T12:00:00.000Z'), 1).toISOString(),
    '2026-02-28T12:00:00.000Z',
  );
  assert.equal(
    addCalendarMonths(new Date('2026-08-31T09:00:00.000Z'), 12).toISOString(),
    '2027-08-31T09:00:00.000Z',
  );
});
