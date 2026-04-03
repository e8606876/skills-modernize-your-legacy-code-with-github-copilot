'use strict';

const readline = require('readline');

// ---------------------------------------------------------------------------
// DataProgram — in-memory balance persistence (mirrors data.cob)
// ---------------------------------------------------------------------------
const data = (() => {
  let storageBalance = 1000.00;

  return {
    read() {
      return storageBalance;
    },
    write(balance) {
      storageBalance = balance;
    },
  };
})();

// ---------------------------------------------------------------------------
// Operations — business logic for each account operation (mirrors operations.cob)
// ---------------------------------------------------------------------------
async function operations(operationType, rl) {
  const ask = (prompt) =>
    new Promise((resolve) => rl.question(prompt, (answer) => resolve(answer)));

  if (operationType === 'TOTAL ') {
    const balance = data.read();
    console.log(`Current balance: ${balance.toFixed(2)}`);
  } else if (operationType === 'CREDIT') {
    const input = await ask('Enter credit amount: ');
    const amount = parseFloat(input);
    if (isNaN(amount) || amount < 0) {
      console.log('Invalid amount.');
      return;
    }
    const balance = data.read();
    const newBalance = balance + amount;
    data.write(newBalance);
    console.log(`Amount credited. New balance: ${newBalance.toFixed(2)}`);
  } else if (operationType === 'DEBIT ') {
    const input = await ask('Enter debit amount: ');
    const amount = parseFloat(input);
    if (isNaN(amount) || amount < 0) {
      console.log('Invalid amount.');
      return;
    }
    const balance = data.read();
    if (balance >= amount) {
      const newBalance = balance - amount;
      data.write(newBalance);
      console.log(`Amount debited. New balance: ${newBalance.toFixed(2)}`);
    } else {
      console.log('Insufficient funds for this debit.');
    }
  }
}

// ---------------------------------------------------------------------------
// MainProgram — interactive menu loop (mirrors main.cob)
// ---------------------------------------------------------------------------
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (prompt) =>
    new Promise((resolve) => rl.question(prompt, (answer) => resolve(answer)));

  let continueFlag = true;

  while (continueFlag) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const choice = await ask('Enter your choice (1-4): ');

    switch (choice.trim()) {
      case '1':
        await operations('TOTAL ', rl);
        break;
      case '2':
        await operations('CREDIT', rl);
        break;
      case '3':
        await operations('DEBIT ', rl);
        break;
      case '4':
        continueFlag = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  console.log('Exiting the program. Goodbye!');
  rl.close();
}

// Export for testing
module.exports = { data, operations };

// Run the application when executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
