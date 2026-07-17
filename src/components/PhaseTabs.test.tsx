import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhaseTabs from './PhaseTabs';

describe('PhaseTabs', () => {
  it('renders all four phases and marks the active one', () => {
    render(<PhaseTabs active="ovulasi" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: /Menstruasi/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ovulasi/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange with the clicked phase', async () => {
    const onChange = vi.fn();
    render(<PhaseTabs active="menstruasi" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: /Luteal/i }));
    expect(onChange).toHaveBeenCalledWith('luteal');
  });
});
