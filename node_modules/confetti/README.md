# Confetti API Wrapper

[![Confetti](https://circleci.com/gh/confetti/confetti-node.svg?style=shield)](https://circleci.com/gh/confetti/confetti-node)

A TypeScript-first Node.js wrapper for the Confetti API with full type safety.

## Installation

```bash
npm install confetti
```

## Usage

### Instance Methods

```javascript
import Confetti from 'confetti'

const confetti = new Confetti({ apiKey: 'your-api-key' })

const events = await confetti.events.findAll()
const event = await confetti.events.find(1)
const contacts = await confetti.contacts.findAll()
const newContact = await confetti.contacts.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
})
```

### Static Methods

```javascript
import Confetti from 'confetti'

const events = await Confetti.events.findAll({ apiKey: 'your-api-key' })
const event = await Confetti.events.find(1, { apiKey: 'your-api-key' })
const contacts = await Confetti.contacts.findAll({ apiKey: 'your-api-key' })
const newContact = await Confetti.contacts.create(
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  { apiKey: 'your-api-key' },
)
```

### TypeScript

```typescript
import Confetti, { Event, Contact, Ticket } from 'confetti'

const confetti = new Confetti({ apiKey: 'your-api-key' })

const events: Event[] = await confetti.events.findAll()
const event: Event = await confetti.events.find(1)

const events = await confetti.events.findAll({
  filter: {
    signupType: 'rsvp',
  },
  sort: 'startDate',
  include: ['categories'],
})
```

## Resources

- **Events** - `findAll`, `find`
- **Contacts** - `findAll`, `find`, `create`
- **Tickets** - `findAll`, `find`, `create`
- **Payments** - `findAll`, `find`
- **Webhooks** - `findAll`, `find`, `create`, `delete`
- **Workspaces** - `findAll`, `find`
- **Categories** - `findAll`, `find`
- **TicketBatches** - `findAll`, `find`

## Development

```bash
npm install
npm run lint
npm test
npm run build
```
