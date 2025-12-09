import { init } from '@instantdb/admin';

import { DATABASE_ADMIN_ID, DATABASE_APP_ID } from './constants';

// Initialize the database
export const db = init({
  appId: DATABASE_APP_ID,
  adminToken: DATABASE_ADMIN_ID,
});
