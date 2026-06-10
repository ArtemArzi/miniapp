import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Подождите..." />);
    expect(screen.getByText('Подождите...')).toBeInTheDocument();
  });
});