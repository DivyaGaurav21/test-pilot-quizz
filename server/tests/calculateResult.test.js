const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const calculateResult = require('../utils/calculateResult');

describe('calculateResult', () => {
  const questions = [
    { _id: { toString: () => 'q1' }, correctAnswer: 'A', marks: 1 },
    { _id: { toString: () => 'q2' }, correctAnswer: 'B', marks: 2 },
    { _id: { toString: () => 'q3' }, correctAnswer: 'C', marks: 1 },
  ];

  it('scores exact option matches and ignores client-provided totals', () => {
    const result = calculateResult(questions, { q1: 'A', q2: 'Z', q3: '' }, 120);
    assert.equal(result.score, 1);
    assert.equal(result.totalMarks, 4);
    assert.equal(result.correctAnswers, 1);
    assert.equal(result.wrongAnswers, 1);
    assert.equal(result.unanswered, 1);
    assert.equal(result.timeTaken, 120);
    assert.equal(result.percentage, 25);
  });

  it('treats missing answers as unanswered', () => {
    const result = calculateResult(questions, {}, 0);
    assert.equal(result.unanswered, 3);
    assert.equal(result.score, 0);
  });
});
