# Test Plan — Account Management System

This test plan covers all business logic from the COBOL Account Management System (`main.cob`, `operations.cob`, `data.cob`) and is used to validate the equivalent Node.js implementation.

---

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | View initial balance | Application started; no prior transactions | Call the view-balance operation | Balance displayed is **$1,000.00** | — | — | Default starting balance defined in data layer |
| TC-002 | Credit account with a valid amount | Balance is $1,000.00 | Credit the account with **$500.00** | New balance is **$1,500.00** and is persisted | — | — | ADD operation in operations.cob |
| TC-003 | Debit account with sufficient funds | Balance is $1,000.00 | Debit the account with **$200.00** | New balance is **$800.00** and is persisted | — | — | SUBTRACT when `FINAL-BALANCE >= AMOUNT` |
| TC-004 | Debit account with insufficient funds | Balance is $1,000.00 | Attempt to debit **$1,500.00** | Transaction rejected; balance remains **$1,000.00**; "Insufficient funds" message shown | — | — | `IF FINAL-BALANCE >= AMOUNT` guard in operations.cob |
| TC-005 | Debit exact balance amount | Balance is $1,000.00 | Debit exactly **$1,000.00** | New balance is **$0.00**; transaction succeeds (boundary: `>=` check) | — | — | Boundary condition — equal amount is allowed |
| TC-006 | Credit followed by debit | Balance is $1,000.00 | (1) Credit $300.00 → balance $1,300.00; (2) Debit $400.00 | Final balance is **$900.00** | — | — | Sequential operations persist correctly |
| TC-007 | Multiple credits accumulate | Balance is $1,000.00 | Credit $100.00 three times | Final balance is **$1,300.00** | — | — | Each credit reads and writes the updated balance |
| TC-008 | Multiple debits reduce balance | Balance is $1,000.00 | Debit $100.00 three times | Final balance is **$700.00** | — | — | Each debit reads the latest persisted balance |
| TC-009 | Debit after credit leaves zero balance | Balance is $0.00 (after full debit) | Attempt to debit **$1.00** | Transaction rejected; balance remains **$0.00**; "Insufficient funds" message shown | — | — | Zero-balance edge case |
| TC-010 | Credit with zero amount | Balance is $1,000.00 | Credit $0.00 | Balance remains **$1,000.00**; no error | — | — | Zero-value credit is a no-op |
| TC-011 | Debit with zero amount | Balance is $1,000.00 | Debit $0.00 | Balance remains **$1,000.00**; transaction succeeds (0 >= 0) | — | — | Zero-value debit is a no-op |
| TC-012 | Balance resets on application restart | Prior balance was $1,500.00 | Restart the application and view balance | Balance is **$1,000.00** (in-memory only, no persistence across restarts) | — | — | `STORAGE-BALANCE` is re-initialised to 1000.00 on each run |
| TC-013 | View balance after credit | Balance is $1,000.00; credit $250.00 | View balance | Balance displayed is **$1,250.00** | — | — | View operation reads persisted value from data layer |
| TC-014 | View balance after debit | Balance is $1,000.00; debit $100.00 | View balance | Balance displayed is **$900.00** | — | — | View operation reads persisted value from data layer |
| TC-015 | Invalid menu choice is handled gracefully | Application running | Enter an invalid menu choice (e.g., 5 or 0) | Error message displayed; menu re-shown; application continues | — | — | `WHEN OTHER` in main.cob EVALUATE |
