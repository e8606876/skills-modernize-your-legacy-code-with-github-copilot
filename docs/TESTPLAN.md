# Test Plan — Account Management System (COBOL)

This test plan covers all business logic implemented in the legacy COBOL accounting system (`main.cob`, `operations.cob`, `data.cob`). It is intended to be used as a validation baseline when migrating the application to Node.js.

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | View initial account balance | Application starts fresh (balance = $1,000.00) | 1. Launch application. 2. Select option `1` (View Balance). | Displays: `Current balance: 1000.00` | | | Default balance is hardcoded to $1,000.00 in `data.cob`. |
| TC-002 | Credit account with a valid amount | Application running, balance = $1,000.00 | 1. Select option `2` (Credit Account). 2. Enter amount `500`. | Displays: `Amount credited. New balance: 1500.00` | | | Balance increases by the credited amount. |
| TC-003 | Debit account with sufficient funds | Application running, balance = $1,000.00 | 1. Select option `3` (Debit Account). 2. Enter amount `200`. | Displays: `Amount debited. New balance: 800.00` | | | Balance decreases by the debited amount. |
| TC-004 | Debit account with exactly the full balance | Application running, balance = $1,000.00 | 1. Select option `3` (Debit Account). 2. Enter amount `1000`. | Displays: `Amount debited. New balance: 0.00` | | | Boundary condition: debit equals balance. |
| TC-005 | Debit account with insufficient funds | Application running, balance = $500.00 | 1. Credit to reach balance $500.00 (debit $500). 2. Select option `3` (Debit Account). 3. Enter amount `600`. | Displays: `Insufficient funds for this debit.` Balance remains $500.00. | | | Overdraft protection is enforced in `operations.cob`. |
| TC-006 | View balance after a credit | Application running, balance = $1,000.00, then credited $250 | 1. Select option `2` and enter `250`. 2. Select option `1` (View Balance). | Displays: `Current balance: 1250.00` | | | Balance is persisted in-memory between calls. |
| TC-007 | View balance after a debit | Application running, balance = $1,000.00, then debited $300 | 1. Select option `3` and enter `300`. 2. Select option `1` (View Balance). | Displays: `Current balance: 700.00` | | | Balance is persisted in-memory between calls. |
| TC-008 | Multiple sequential operations | Application running, balance = $1,000.00 | 1. Credit $500 → balance $1,500.00. 2. Debit $200 → balance $1,300.00. 3. View balance. | Displays: `Current balance: 1300.00` | | | Verifies compound state changes. |
| TC-009 | Exit application | Application running | 1. Select option `4` (Exit). | Displays: `Exiting the program. Goodbye!` and program terminates. | | | `CONTINUE-FLAG` is set to `'NO'`, ending the `PERFORM UNTIL` loop. |
| TC-010 | Invalid menu choice | Application running | 1. Enter `5` (or any value not in 1–4) at the menu prompt. | Displays: `Invalid choice, please select 1-4.` Menu re-displays. | | | `WHEN OTHER` clause in `EVALUATE` handles unexpected input. |
| TC-011 | Invalid menu choice — zero | Application running | 1. Enter `0` at the menu prompt. | Displays: `Invalid choice, please select 1-4.` Menu re-displays. | | | Boundary check: zero is not a valid option. |
| TC-012 | Credit amount of zero | Application running, balance = $1,000.00 | 1. Select option `2`. 2. Enter amount `0`. | Displays: `Amount credited. New balance: 1000.00` (balance unchanged). | | | Adding zero does not alter the balance. |
| TC-013 | Debit amount of zero | Application running, balance = $1,000.00 | 1. Select option `3`. 2. Enter amount `0`. | Displays: `Amount debited. New balance: 1000.00` (balance unchanged). | | | Subtracting zero does not alter the balance; `0 <= 1000` satisfies the funds check. |
| TC-014 | Credit large amount near maximum | Application running, balance = $1,000.00 | 1. Select option `2`. 2. Enter amount `998999.99`. | Displays: `Amount credited. New balance: 999999.99` | | | Upper boundary of `PIC 9(6)V99` picture clause. |
| TC-015 | Balance resets on program restart | Application running; credit $500 to reach $1,500.00; then exit | 1. Restart the application. 2. Select option `1`. | Displays: `Current balance: 1000.00` | | | Data is in-memory only — no persistent storage between runs. |
| TC-016 | Menu re-displays after each operation | Application running | 1. Select option `1` (View Balance). 2. Observe that the menu is shown again. | Menu header and options 1–4 are displayed again after completing an operation. | | | The `PERFORM UNTIL` loop in `main.cob` re-displays the menu after every call. |
| TC-017 | Credit then insufficient debit | Application running, balance = $1,000.00 | 1. Credit $100 → balance $1,100.00. 2. Debit $1,200. | Displays: `Insufficient funds for this debit.` Balance remains $1,100.00. | | | Debit guard applies to updated balance. |
| TC-018 | Debit leaves zero balance, then debit again | Application running, balance = $1,000.00 | 1. Debit $1,000 → balance $0.00. 2. Debit $1. | Displays: `Insufficient funds for this debit.` Balance remains $0.00. | | | Zero balance cannot be debited. |
