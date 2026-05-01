import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CouponInput from './CouponInput';

describe('CouponInput', () => {
  const mockApply = vi.fn();

  beforeEach(() => {
    mockApply.mockClear();
  });

  it('renders the input field and Apply button', () => {
    render(<CouponInput onApply={mockApply} />);
    expect(screen.getByTestId('coupon-input')).toBeInTheDocument();
    expect(screen.getByTestId('coupon-apply-btn')).toBeInTheDocument();
  });

  it('Apply button is disabled when input is empty', () => {
    render(<CouponInput onApply={mockApply} />);
    expect(screen.getByTestId('coupon-apply-btn')).toBeDisabled();
  });

  it('Apply button enables when user types a code', async () => {
    render(<CouponInput onApply={mockApply} />);
    await userEvent.type(screen.getByTestId('coupon-input'), 'SAVE50');
    expect(screen.getByTestId('coupon-apply-btn')).not.toBeDisabled();
  });

  it('calls onApply with the entered code when Apply is clicked', async () => {
    render(<CouponInput onApply={mockApply} />);
    await userEvent.type(screen.getByTestId('coupon-input'), 'SAVE50');
    fireEvent.click(screen.getByTestId('coupon-apply-btn'));
    expect(mockApply).toHaveBeenCalledWith('SAVE50');
    expect(mockApply).toHaveBeenCalledTimes(1);
  });

  it('calls onApply when Enter is pressed in the input', async () => {
    render(<CouponInput onApply={mockApply} />);
    await userEvent.type(screen.getByTestId('coupon-input'), 'SAVE100{Enter}');
    expect(mockApply).toHaveBeenCalledWith('SAVE100');
  });

  it('converts input to uppercase automatically', async () => {
    render(<CouponInput onApply={mockApply} />);
    await userEvent.type(screen.getByTestId('coupon-input'), 'save50');
    fireEvent.click(screen.getByTestId('coupon-apply-btn'));
    expect(mockApply).toHaveBeenCalledWith('SAVE50');
  });

  it('shows success message when status type is success', () => {
    render(
      <CouponInput
        onApply={mockApply}
        status={{ message: 'Coupon "SAVE50" applied! You save ₹50', type: 'success' }}
      />
    );
    const feedback = screen.getByTestId('coupon-feedback');
    expect(feedback).toBeInTheDocument();
    expect(feedback).toHaveTextContent('SAVE50');
    expect(feedback).toHaveClass('text-green-600');
  });

  it('shows error message when status type is error', () => {
    render(
      <CouponInput
        onApply={mockApply}
        status={{ message: 'Invalid or unknown coupon code', type: 'error' }}
      />
    );
    const feedback = screen.getByTestId('coupon-feedback');
    expect(feedback).toBeInTheDocument();
    expect(feedback).toHaveTextContent('Invalid or unknown coupon code');
    expect(feedback).toHaveClass('text-red-500');
  });

  it('disables input and button when disabled prop is true', () => {
    render(<CouponInput onApply={mockApply} disabled={true} />);
    expect(screen.getByTestId('coupon-input')).toBeDisabled();
    expect(screen.getByTestId('coupon-apply-btn')).toBeDisabled();
  });

  it('locks input and button when applied prop is true', () => {
    render(
      <CouponInput
        onApply={mockApply}
        applied={true}
        status={{ message: 'Coupon applied!', type: 'success' }}
      />
    );
    expect(screen.getByTestId('coupon-input')).toBeDisabled();
    expect(screen.getByTestId('coupon-apply-btn')).toBeDisabled();
  });

  it('does not call onApply when input is only whitespace', async () => {
    render(<CouponInput onApply={mockApply} />);
    await userEvent.type(screen.getByTestId('coupon-input'), '   ');
    fireEvent.click(screen.getByTestId('coupon-apply-btn'));
    expect(mockApply).not.toHaveBeenCalled();
  });
});
