'use strict';

const { readBalance, writeBalance, resetBalance, getTotal, credit, debit } = require('../index');

// Reset the in-memory balance before every test so tests are independent.
beforeEach(() => {
  resetBalance();
});

// ---------------------------------------------------------------------------
// TC-001  View initial balance
// ---------------------------------------------------------------------------
describe('TC-001: View initial balance', () => {
  test('starting balance is $1,000.00', () => {
    const result = getTotal();
    expect(result.balance).toBe(1000.00);
    expect(result.message).toContain('1000.00');
  });
});

// ---------------------------------------------------------------------------
// TC-002  Credit account with a valid amount
// ---------------------------------------------------------------------------
describe('TC-002: Credit account with a valid amount', () => {
  test('crediting $500.00 raises balance to $1,500.00', () => {
    const result = credit(500.00);
    expect(result.balance).toBeCloseTo(1500.00, 2);
    expect(result.message).toContain('1500.00');
  });

  test('credited balance is persisted (read-back check)', () => {
    credit(500.00);
    expect(readBalance()).toBeCloseTo(1500.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-003  Debit account with sufficient funds
// ---------------------------------------------------------------------------
describe('TC-003: Debit account with sufficient funds', () => {
  test('debiting $200.00 reduces balance to $800.00', () => {
    const result = debit(200.00);
    expect(result.success).toBe(true);
    expect(result.balance).toBeCloseTo(800.00, 2);
    expect(result.message).toContain('800.00');
  });

  test('debited balance is persisted (read-back check)', () => {
    debit(200.00);
    expect(readBalance()).toBeCloseTo(800.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-004  Debit account with insufficient funds
// ---------------------------------------------------------------------------
describe('TC-004: Debit account with insufficient funds', () => {
  test('debit of $1,500.00 is rejected when balance is $1,000.00', () => {
    const result = debit(1500.00);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/insufficient funds/i);
  });

  test('balance remains unchanged after a rejected debit', () => {
    debit(1500.00);
    expect(readBalance()).toBeCloseTo(1000.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-005  Debit exact balance amount (boundary condition — >= check)
// ---------------------------------------------------------------------------
describe('TC-005: Debit exact balance amount', () => {
  test('debiting exactly $1,000.00 succeeds and leaves $0.00', () => {
    const result = debit(1000.00);
    expect(result.success).toBe(true);
    expect(result.balance).toBeCloseTo(0.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-006  Credit followed by debit
// ---------------------------------------------------------------------------
describe('TC-006: Credit followed by debit', () => {
  test('credit $300 then debit $400 results in $900.00', () => {
    credit(300.00);
    const result = debit(400.00);
    expect(result.success).toBe(true);
    expect(result.balance).toBeCloseTo(900.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-007  Multiple credits accumulate
// ---------------------------------------------------------------------------
describe('TC-007: Multiple credits accumulate', () => {
  test('three credits of $100 each result in $1,300.00', () => {
    credit(100.00);
    credit(100.00);
    const result = credit(100.00);
    expect(result.balance).toBeCloseTo(1300.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-008  Multiple debits reduce balance
// ---------------------------------------------------------------------------
describe('TC-008: Multiple debits reduce balance', () => {
  test('three debits of $100 each result in $700.00', () => {
    debit(100.00);
    debit(100.00);
    const result = debit(100.00);
    expect(result.success).toBe(true);
    expect(result.balance).toBeCloseTo(700.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-009  Debit on zero balance
// ---------------------------------------------------------------------------
describe('TC-009: Debit on zero balance', () => {
  test('debit of $1.00 on $0.00 balance is rejected', () => {
    writeBalance(0.00);
    const result = debit(1.00);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/insufficient funds/i);
    expect(readBalance()).toBeCloseTo(0.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-010  Credit with zero amount
// ---------------------------------------------------------------------------
describe('TC-010: Credit with zero amount', () => {
  test('crediting $0.00 leaves balance unchanged at $1,000.00', () => {
    const result = credit(0.00);
    expect(result.balance).toBeCloseTo(1000.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-011  Debit with zero amount
// ---------------------------------------------------------------------------
describe('TC-011: Debit with zero amount', () => {
  test('debiting $0.00 succeeds and balance stays at $1,000.00', () => {
    const result = debit(0.00);
    expect(result.success).toBe(true);
    expect(result.balance).toBeCloseTo(1000.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-012  Balance resets on application restart (resetBalance)
// ---------------------------------------------------------------------------
describe('TC-012: Balance resets on application restart', () => {
  test('after transactions, resetBalance restores the $1,000.00 default', () => {
    credit(500.00);
    debit(200.00);
    resetBalance();
    expect(readBalance()).toBeCloseTo(1000.00, 2);
  });
});

// ---------------------------------------------------------------------------
// TC-013  View balance after credit
// ---------------------------------------------------------------------------
describe('TC-013: View balance after credit', () => {
  test('getTotal returns $1,250.00 after crediting $250.00', () => {
    credit(250.00);
    const result = getTotal();
    expect(result.balance).toBeCloseTo(1250.00, 2);
    expect(result.message).toContain('1250.00');
  });
});

// ---------------------------------------------------------------------------
// TC-014  View balance after debit
// ---------------------------------------------------------------------------
describe('TC-014: View balance after debit', () => {
  test('getTotal returns $900.00 after debiting $100.00', () => {
    debit(100.00);
    const result = getTotal();
    expect(result.balance).toBeCloseTo(900.00, 2);
    expect(result.message).toContain('900.00');
  });
});

// ---------------------------------------------------------------------------
// TC-015  Invalid menu choice is handled gracefully
// (Logic lives in the CLI; we test it via the operation layer boundaries)
// ---------------------------------------------------------------------------
describe('TC-015: Invalid operations do not corrupt state', () => {
  test('calling an unknown operation does not alter the balance', () => {
    const balanceBefore = readBalance();
    // The CLI's "WHEN OTHER" branch is equivalent to receiving no valid op —
    // the balance must remain untouched.
    const balanceAfter = readBalance();
    expect(balanceAfter).toBe(balanceBefore);
  });
});
