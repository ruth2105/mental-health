import { ReactNode } from 'react';

interface EthiopianCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  premium?: boolean;
  pattern?: 'cross' | 'weave' | 'traditional' | 'none';
  className?: string;
  onClick?: () => void;
}

export default function EthiopianCard({
  children,
  title,
  subtitle,
  premium = false,
  pattern = 'none',
  className = '',
  onClick
}: EthiopianCardProps) {
  const cardClasses = `
    ${premium ? 'eth-card-premium' : 'eth-card'}
    ${onClick ? 'cursor-pointer hover-lift' : ''}
    ${className}
  `.trim();

  const patternClasses = {
    cross: 'eth-pattern-cross',
    weave: 'eth-pattern-weave',
    traditional: 'eth-pattern-traditional',
    none: ''
  };

  return (
    <div 
      className={`${cardClasses} ${patternClasses[pattern]} p-6`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="eth-heading-md mb-2">{title}</h3>
          )}
          {subtitle && (
            <p className="eth-text-ethiopic">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}