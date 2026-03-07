"use client";

type Props = {
  amount: number;
  nacionalidade?: string;
  className?: string;
};

const currencyMap: Record<string, string> = {
  brasil: "BRL",
  paraguay: "PYG",
  usa: "USD",
};

function getCurrency(nacionalidade?: string) {
  if (!nacionalidade) return "USD";
  return currencyMap[nacionalidade.toLowerCase()] || "USD";
}

export function CurrencyAmount({
  amount,
  nacionalidade,
  className = "",
}: Props) {
  const currency = getCurrency(nacionalidade);

  // Garante que não quebre no SSR usando locale padrão
  const formatted = new Intl.NumberFormat(
    typeof navigator !== "undefined" ? navigator.language : "en-US",
    { style: "currency", currency },
  ).format(amount);

  return (
    <span suppressHydrationWarning className={className}>
      {formatted}
    </span>
  );
}
