
export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `$${numPrice}`;
};

export const formatPercentage = (percentage: number, showSign: boolean = true): string => {
  const sign = showSign && percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getStatusColor = (status: 'OPEN' | 'CLOSED'): string => {
  return status === 'OPEN' ? '#06D6A0' : '#8E9AAF';
};

export const getPercentageColor = (percentage: number): string => {
  return percentage >= 0 ? '#06D6A0' : '#FF6B6B';
};

