// This file can be used for types that are shared across client and server
// and are not specific to the DB schema, or for re-exporting DB types.

// Re-exporting types from db.ts for consistency if needed elsewhere,
// or define UI-specific variations.
export type { MenuItem, OrderItem, Order } from '@/lib/db';
