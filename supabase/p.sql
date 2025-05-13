Table name: transactions

Columns:
- id: UUID (Primary Key, default: `uuid_generate_v4()`)
- date: Date
- amount: Float
- category: Text
- type: Text ('income' or 'expense')