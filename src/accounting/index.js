'use strict';

const readline = require('readline');

// ---------------------------------------------------------------------------
// Data layer  (equivalent to data.cob)
// ---------------------------------------------------------------------------

const INITIAL_BALANCE = 1000.00;

let storageBalance = INITIAL_BALANCE;

function readBalance() {
  return storageBalance;
}

function writeBalance(amount) {
  storageBalance = amount;
}

function resetBalance() {
  storageBalance = INITIAL_BALANCE;
}

// ---------------------------------------------------------------------------
// Operations layer  (equivalent to operations.cob)
// ---------------------------------------------------------------------------

function getTotal() {
  const balance = readBalance();
  return { balance, message: `Current balance: ${balance.toFixed(2)}` };
}

function credit(amount) {
  const balance = readBalance();
  const newBalance = balance + amount;
  writeBalance(newBalance);
  return { balance: newBalance, message: `Amount credited. New balance: ${newBalance.toFixed(2)}` };
}

function debit(amount) {
  const balance = readBalance();
  if (balance >= amount) {
    const newBalance = balance - amount;
    writeBalance(newBalance);
    return { balance: newBalance, success: true, message: `Amount debited. New balance: ${newBalance.toFixed(2)}` };
  }
  return { balance, success: false, message: 'Insufficient funds for this debit.' };
}

// ---------------------------------------------------------------------------
// Interactive CLI  (equivalent to main.cob)
// ---------------------------------------------------------------------------

/* istanbul ignore next */
async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

  let running = true;

  while (running) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const choice = await ask('Enter your choice (1-4): ');

    switch (choice.trim()) {
      case '1': {
        const result = getTotal();
        console.log(result.message);
        break;
      }
      case '2': {
        const input = await ask('Enter credit amount: ');
        const amount = parseFloat(input);
        const result = credit(amount);
        console.log(result.message);
        break;
      }
      case '3': {
        const input = await ask('Enter debit amount: ');
        const amount = parseFloat(input);
        const result = debit(amount);
        console.log(result.message);
        break;
      }
      case '4':
        running = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  console.log('Exiting the program. Goodbye!');
  rl.close();
}

module.exports = { readBalance, writeBalance, resetBalance, getTotal, credit, debit };

if (require.main === module) {
  main().catch(console.error);
}
