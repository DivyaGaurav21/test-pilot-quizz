const calculateCommission = (commissionableAmountPaise, commissionBasisPoints) => {
  if (!Number.isSafeInteger(commissionableAmountPaise) || commissionableAmountPaise < 0) {
    throw new TypeError('Commissionable amount must be a non-negative integer number of paise');
  }
  if (!Number.isInteger(commissionBasisPoints) || commissionBasisPoints < 0 || commissionBasisPoints > 10000) {
    throw new TypeError('Commission must be an integer between 0 and 10000 basis points');
  }

  const platformShareBigInt = (
    (BigInt(commissionableAmountPaise) * BigInt(commissionBasisPoints)) + 5000n
  ) / 10000n;
  const platformSharePaise = Number(platformShareBigInt);
  return {
    platformSharePaise,
    instituteSharePaise: commissionableAmountPaise - platformSharePaise,
  };
};

const calculateRefundSplit = (originalCommissionablePaise, refundCommissionablePaise, commissionBasisPoints) => {
  if (!Number.isSafeInteger(refundCommissionablePaise) || refundCommissionablePaise < 0
    || refundCommissionablePaise > originalCommissionablePaise) {
    throw new TypeError('Refund amount must be between zero and the original commissionable amount');
  }
  return calculateCommission(refundCommissionablePaise, commissionBasisPoints);
};

const calculateAvailablePayoutPaise = (entries) => entries.reduce((balance, entry) => {
  if (['institute_share', 'gateway_fee', 'tax', 'refund', 'chargeback', 'payout', 'payout_reversal'].includes(entry.type)) {
    return balance + entry.amountPaise;
  }
  return balance;
}, 0);

module.exports = { calculateCommission, calculateRefundSplit, calculateAvailablePayoutPaise };
