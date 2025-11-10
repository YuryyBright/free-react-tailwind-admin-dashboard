// IconButton Component
export const IconButton: React.FC<{
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'ghost' | 'primary';
  className?: string;
  title?: string;
}> = ({ icon, onClick, variant = 'ghost', className = '', title }) => {
  const variants = {
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  };
  
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-full transition ${variants[variant]} ${className}`}
    >
      {icon}
    </button>
  );
};