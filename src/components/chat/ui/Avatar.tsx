
// Avatar Component
export const Avatar: React.FC<{
  src: string;
  alt: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ src, alt, isOnline, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover`}
      />
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
      )}
    </div>
  );
};
