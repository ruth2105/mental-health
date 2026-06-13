import { useEffect, useState } from 'react';

interface EthiopianGreetingProps {
  name?: string;
  className?: string;
}

export default function EthiopianGreeting({ name, className = '' }: EthiopianGreetingProps) {
  const [greeting, setGreeting] = useState('');
  const [amharicGreeting, setAmharicGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      setGreeting('Good Morning');
      setAmharicGreeting('እንደምን አደሩ');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
      setAmharicGreeting('እንደምን ዋሉ');
    } else {
      setGreeting('Good Evening');
      setAmharicGreeting('እንደምን አመሹ');
    }
  }, []);

  return (
    <div className={`eth-animate-fade-in ${className}`}>
      <h1 className="eth-heading-xl mb-2">
        {amharicGreeting}{name ? `, ${name}` : ''}! 👋
      </h1>
      <p className="text-sm eth-text-ethiopic opacity-75">
        {greeting}{name ? `, ${name}` : ''}
      </p>
    </div>
  );
}