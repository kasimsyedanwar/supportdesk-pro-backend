import { loginSchema, registerSchema } from '../../modules/auth/auth.schemas';

describe('auth schemas', () => {
  it('validates login input', () => {
    const result = loginSchema.parse({
      email: 'kasim.customer@supportdeskpro.dev',
      password: 'Password@123',
    });

    expect(result).toEqual({
      email: 'kasim.customer@supportdeskpro.dev',
      password: 'Password@123',
    });
  });

  it('rejects invalid email in login', () => {
    expect(() =>
      loginSchema.parse({
        email: 'not-an-email',
        password: 'Password@123',
      }),
    ).toThrow();
  });

  it('validates register input without accepting role', () => {
    const result = registerSchema.parse({
      name: 'New Customer',
      email: 'new.customer@example.com',
      password: 'Password@123',
    });

    expect(result).toEqual({
      name: 'New Customer',
      email: 'new.customer@example.com',
      password: 'Password@123',
    });
  });
});
