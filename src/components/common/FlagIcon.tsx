import { getFlagUrl } from '@/lib/utils/flags';

export const FlagIcon = ({ country, className = "w-4 h-3" }: { country: string, className?: string }) => {
  const url = getFlagUrl(country);
  if (!url) return <span className="text-sm">🌍</span>;
  return <img src={url} alt={country} className={`${className} object-cover rounded-sm shadow-sm`} />;
};
