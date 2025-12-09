'use server';

import { id } from '@instantdb/core';
import { sha256 } from '@noble/hashes/sha2.js';

import { db } from '@/config/database';

export async function addAccount(props: { name: string; email: string; pubkey: string }): Promise<string> {
  const { name = null, email = null, pubkey = null } = props;

  if (!email && !pubkey) {
    // return {}
  }

  // TO-DO
  // Format pubkey

  // Find if customer exist
  const query = {
    customer: {
      $: {
        where: {
          email: email || '',
          pubkey: pubkey || '',
        },
      },
    },
  };

  const { customer } = await db.query(query);

  if (customer && customer.length > 0) {
    // @ts-ignore
    return customer[0]?.id;
  }

  // If not exist, create
  const newId = id();

  await db.transact(
    // @ts-ignore
    db.tx.customer[newId].update({
      // Data
      name,
      email,
      pubkey,

      // Status
      created_at: Date.now(),
    }),
  );

  return newId;
}
