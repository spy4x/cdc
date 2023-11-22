// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import type { Session } from '@server/auth/misc';
import type { User } from '@shared';

declare global {
  namespace App {
    interface Locals {
      user: null | User;
      session: null | Session;
    }
    // interface PageData {}
    // interface Error {}
    // interface Platform {}
  }
}
