const Avatar = ({ src, alt = 'User', size = 'md', className = '', online = false }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <img
        src={src || 'https://via.placeholder.com/150'}
        alt={alt}
        className="h-full w-full rounded-full object-cover"
      />
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
};

export default Avatar;
