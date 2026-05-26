import { isAdminOrGmUser } from '../utils/userRole';

describe('isAdminOrGmUser', () => {
  it('allows GM and Admin roles', () => {
    expect(isAdminOrGmUser('GM')).toBe(true);
    expect(isAdminOrGmUser('gm')).toBe(true);
    expect(isAdminOrGmUser('Admin')).toBe(true);
    expect(isAdminOrGmUser('ADMIN')).toBe(true);
  });

  it('denies regular members', () => {
    expect(isAdminOrGmUser('Member')).toBe(false);
    expect(isAdminOrGmUser(undefined)).toBe(false);
  });
});
