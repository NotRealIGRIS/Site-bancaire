/**
 * Said Banking — db.js
 * In-memory database with seed data.
 * In production, replace with real API calls.
 */

const DB = {
  users: [
    {
      id: 1,
      name: 'Said Demo',
      email: 'said@bank.com',
      password: 'pass123',
      createdAt: '2025-01-15',
      accounts: [
        { id: 'CHK001', type: 'Checking', balance: 8432.50 },
        { id: 'SAV001', type: 'Savings',  balance: 23150.00 }
      ],
      transactions: [
        { id: 1, type: 'credit', name: 'Salary Deposit',  amount: 3200.00, date: '2026-05-12', acc: 'CHK001' },
        { id: 2, type: 'debit',  name: 'Rent Payment',    amount: 1200.00, date: '2026-05-10', acc: 'CHK001' },
        { id: 3, type: 'debit',  name: 'Grocery Store',   amount: 87.40,   date: '2026-05-09', acc: 'CHK001' },
        { id: 4, type: 'credit', name: 'Interest Earned', amount: 12.50,   date: '2026-05-01', acc: 'SAV001' },
        { id: 5, type: 'debit',  name: 'Subscription',    amount: 15.99,   date: '2026-05-03', acc: 'CHK001' },
        { id: 6, type: 'debit',  name: 'Restaurant',      amount: 64.20,   date: '2026-04-28', acc: 'CHK001' },
        { id: 7, type: 'credit', name: 'Freelance Payment',amount: 850.00, date: '2026-04-22', acc: 'CHK001' },
        { id: 8, type: 'debit',  name: 'Utilities',       amount: 142.00,  date: '2026-04-20', acc: 'CHK001' },
      ]
    }
  ],
  nextId: 2
};
