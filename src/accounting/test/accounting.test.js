'use strict';

// We require index.js which exports { data, operations }.
// Each test resets the in-memory balance by calling data.write(1000) in beforeEach.

const { data, operations, OPERATION_TYPES } = require('../index');

// Helper: create a mock readline interface that answers questions from a queue.
function mockRl(answers) {
  const queue = [...answers];
  return {
    question: (_prompt, callback) => {
      const answer = queue.shift() ?? '';
      callback(String(answer));
    },
  };
}

beforeEach(() => {
  // Reset balance to the COBOL default ($1,000.00) before every test.
  data.write(1000.00);
});

// ---------------------------------------------------------------------------
// TC-001  View initial account balance
// ---------------------------------------------------------------------------
test('TC-001: View initial account balance displays 1000.00', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.VIEW_BALANCE, mockRl([]));
  expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1000.00');
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-002  Credit account with a valid amount
// ---------------------------------------------------------------------------
test('TC-002: Credit $500 raises balance to $1500.00', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.CREDIT, mockRl(['500']));
  expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1500.00');
  expect(data.read()).toBeCloseTo(1500.00, 2);
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-003  Debit account with sufficient funds
// ---------------------------------------------------------------------------
test('TC-003: Debit $200 from $1000 leaves $800.00', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.DEBIT, mockRl(['200']));
  expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 800.00');
  expect(data.read()).toBeCloseTo(800.00, 2);
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-004  Debit account with exactly the full balance
// ---------------------------------------------------------------------------
test('TC-004: Debit exactly $1000 leaves $0.00', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.DEBIT, mockRl(['1000']));
  expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
  expect(data.read()).toBeCloseTo(0.00, 2);
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-005  Debit account with insufficient funds
// ---------------------------------------------------------------------------
test('TC-005: Debit $600 when balance is $500 shows insufficient funds', async () => {
  data.write(500.00);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.DEBIT, mockRl(['600']));
  expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
  expect(data.read()).toBeCloseTo(500.00, 2);
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-006  View balance after a credit
// ---------------------------------------------------------------------------
test('TC-006: View balance after crediting $250 shows $1250.00', async () => {
  await operations(OPERATION_TYPES.CREDIT, mockRl(['250']));
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.VIEW_BALANCE, mockRl([]));
  expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1250.00');
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-007  View balance after a debit
// ---------------------------------------------------------------------------
test('TC-007: View balance after debiting $300 shows $700.00', async () => {
  await operations(OPERATION_TYPES.DEBIT, mockRl(['300']));
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.VIEW_BALANCE, mockRl([]));
  expect(consoleSpy).toHaveBeenCalledWith('Current balance: 700.00');
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-008  Multiple sequential operations
// ---------------------------------------------------------------------------
test('TC-008: Credit $500 then debit $200 leaves $1300.00', async () => {
  await operations(OPERATION_TYPES.CREDIT, mockRl(['500']));
  await operations(OPERATION_TYPES.DEBIT, mockRl(['200']));
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.VIEW_BALANCE, mockRl([]));
  expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1300.00');
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-012  Credit amount of zero
// ---------------------------------------------------------------------------
test('TC-012: Credit $0 leaves balance unchanged at $1000.00', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.CREDIT, mockRl(['0']));
  expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000.00');
  expect(data.read()).toBeCloseTo(1000.00, 2);
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-013  Debit amount of zero
// ---------------------------------------------------------------------------
test('TC-013: Debit $0 leaves balance unchanged at $1000.00', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.DEBIT, mockRl(['0']));
  expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 1000.00');
  expect(data.read()).toBeCloseTo(1000.00, 2);
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-015  Balance resets to default — simulated by beforeEach
// ---------------------------------------------------------------------------
test('TC-015: Balance starts at $1000.00 (default) each test run', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  // Simulate a "previous session" by crediting $500
  await operations(OPERATION_TYPES.CREDIT, mockRl(['500']));
  // Reset (simulates restart) — beforeEach does this, but we reset manually here
  data.write(1000.00);
  await operations(OPERATION_TYPES.VIEW_BALANCE, mockRl([]));
  expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1000.00');
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-017  Credit then insufficient debit
// ---------------------------------------------------------------------------
test('TC-017: Credit $100, then debit $1200 shows insufficient funds', async () => {
  await operations(OPERATION_TYPES.CREDIT, mockRl(['100']));
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.DEBIT, mockRl(['1200']));
  expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
  expect(data.read()).toBeCloseTo(1100.00, 2);
  consoleSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// TC-018  Debit to zero then debit again
// ---------------------------------------------------------------------------
test('TC-018: Debit to $0 then debit $1 shows insufficient funds', async () => {
  await operations(OPERATION_TYPES.DEBIT, mockRl(['1000']));
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await operations(OPERATION_TYPES.DEBIT, mockRl(['1']));
  expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
  expect(data.read()).toBeCloseTo(0.00, 2);
  consoleSpy.mockRestore();
});
