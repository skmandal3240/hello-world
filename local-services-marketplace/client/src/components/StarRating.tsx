interface Props {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  count?: number;
}

export default function StarRating({ rating, size = 'md', showNumber = true, count }: Props) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <span className={`flex items-center gap-1 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= full ? 'text-yellow-400' : i === full + 1 && half ? 'text-yellow-300' : 'text-gray-300'}>
          ★
        </span>
      ))}
      {showNumber && (
        <span className="text-gray-600 text-sm ml-1">
          {rating.toFixed(1)}{count !== undefined ? ` (${count})` : ''}
        </span>
      )}
    </span>
  );
}
