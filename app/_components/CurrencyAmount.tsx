'use client';

export function CurrencyAmount({
  amount,
  className = '',
}: {
  amount: number;
  className?: string;
}) {
  const formatted = new Intl.NumberFormat(
    typeof navigator !== 'undefined' ? navigator.language : 'en-US',
    { style: 'currency', currency: 'USD' }
  ).format(amount);

  return (
    <span suppressHydrationWarning className={className}>
      {formatted}
    </span>
  );
}
