import { init, User } from '@instantdb/react';

import { DATABASE_APP_ID } from '@/config/constants';

// Initialize the database
export const db = init({
  appId: DATABASE_APP_ID,
});
