const models = {
  users: {
    fields: {
      email: {
        type: 'TEXT',
        unique: true
      },
      coffee_days: { type: 'TEXT' }
    },
    indices: ['email']
  },
  matches: {
    fields: {
      date: { type: 'TEXT' },
      email1: { type: 'TEXT' },
      email2: { type: 'TEXT' }
    },
    indices: ['date', 'email1', 'email2', ['email1', 'email2']]
  },
  warningsExceptions: {
    fields: {
      email: { type: 'TEXT' }
    }
  },
  noNextMatch: {
    fields: {
      email: { type: 'TEXT' }
    }
  }
};

export default models;
