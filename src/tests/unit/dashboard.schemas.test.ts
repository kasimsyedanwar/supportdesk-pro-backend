import { dashboardQuerySchema } from '../../modules/dashboard/dashboard.schemas';

describe('dashboardQuerySchema', () => {
  it('allows empty query', () => {
    const result = dashboardQuerySchema.parse({});

    expect(result).toEqual({});
  });

  it('coerces from and to dates', () => {
    const result = dashboardQuerySchema.parse({
      from: '2026-06-01',
      to: '2026-06-30',
    });

    expect(result.from).toBeInstanceOf(Date);
    expect(result.to).toBeInstanceOf(Date);
  });

  it('rejects from date after to date', () => {
    expect(() =>
      dashboardQuerySchema.parse({
        from: '2026-06-30',
        to: '2026-06-01',
      }),
    ).toThrow();
  });
});
