'use server';

import { id } from '@instantdb/core';
import { sha256 } from '@noble/hashes/sha2.js';

import { db } from '@/config/database';

export async function addAccount(props: { id: string }): Promise<string> {
  const { id } = props;

  if (!id) {
    // return {}
  }

  // TO-DO
  // Format pubkey

  // Find if customer exist
  const query = {
    store: {
      $: {
        where: {
          id: id || '',
        },
      },
    },
  };

  const { store } = await db.query(query);

  if (store && store.length > 0) {
    // @ts-ignore
    return store[0]?.id;
  }

  // If not exist, create
  const newId = id();

  // await db.transact(
  //   // @ts-ignore
  //   db.tx.customer[newId].update({
  //     // Data
  //     name,
  //     email,
  //     pubkey,

  //     // Status
  //     created_at: Date.now(),
  //   }),
  // );

  return newId;
}
