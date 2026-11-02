import { Injectable } from '@nestjs/common';

// ponytail: in-memory like the seed data, so a restart signs everyone out.
// Expired entries are dropped only when touched. Fine for one pilot.
@Injectable()
export class SessionStore {
  private readonly expiresAt = new Map<string, number>();

  open(id: string, expiresAtMs: number): void {
    this.expiresAt.set(id, expiresAtMs);
  }

  isActive(id: string): boolean {
    const expiry = this.expiresAt.get(id);
    if (expiry === undefined) return false;
    if (expiry <= Date.now()) {
      this.expiresAt.delete(id);
      return false;
    }
    return true;
  }

  close(id: string): void {
    this.expiresAt.delete(id);
  }
}
