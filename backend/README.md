# Budget Tracker API

## Local setup

1. `npm install`
2. `npm run migrate`
3. `npm start`

## API quick test (after start)

- `GET /api/transactions`
- `POST /api/transactions` with JSON body:

```json
{
  "type": "expense",
  "amount": 12.5,
  "category": "Food",
  "date": "2025-09-01",
  "notes": "Lunch"
}
```
