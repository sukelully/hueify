import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '../app/not-found';

test('NotFound', () => {
  render(<NotFound />);
  expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeDefined();
});
