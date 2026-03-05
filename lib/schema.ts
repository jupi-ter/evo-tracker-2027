import { pgTable, serial, text, numeric, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  hash: text('hash').notNull(),
});

export const budget = pgTable('budget', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  item: text('item').notNull(),
  price: numeric('price').notNull(),
});

export const savings = pgTable('savings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  amount: numeric('amount').notNull(),
});
