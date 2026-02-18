import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginPromoCard } from '@/components/newui/login-promo-card';

describe('LoginPromoCard', () => {
  it('links to login with root next target', () => {
    render(<LoginPromoCard />);

    expect(screen.getByRole('link', { name: 'Zum Login' })).toHaveAttribute('href', '/stundenplan/login?next=/');
  });
});
