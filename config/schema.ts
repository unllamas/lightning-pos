import { i } from '@instantdb/core';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    stores: i.entity({
      id: i.string().unique().indexed(),
      // Status
      status: i.string(),
      updated_at: i.date(),
      created_at: i.date(),
    }),
  },
  links: {
    // userStores: {
    //   forward: { on: 'stores', has: 'one', label: '$user' },
    //   reverse: { on: '$users', has: 'many', label: 'stores' },
    // },
    // storeProducts: {
    //   forward: { on: 'products', has: 'one', label: 'store' },
    //   reverse: { on: 'stores', has: 'many', label: 'products' },
    // },
  },
});

// This helps Typescript display better intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
