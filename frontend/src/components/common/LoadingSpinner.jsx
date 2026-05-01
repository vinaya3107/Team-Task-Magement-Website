export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClass = size === 'lg' ? 'spinner-lg' : size === 'sm' ? 'spinner-sm' : 'spinner-md';
  return (
    <div className="spinner-wrapper">
      <div className={`spinner ${sizeClass}`} />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
