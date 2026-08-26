import React from 'react';

interface LogoProps {
  className?: string;
  markClassName?: string;
  inverted?: boolean;
  alwaysShowWordmark?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className = 'flex items-center gap-3',
  markClassName = 'w-9 h-9',
  inverted = false,
  alwaysShowWordmark = false,
}) => {
  return (
    <span className={className}>
      <span
        className={`${markClassName} rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          inverted ? 'bg-paper text-ink' : 'bg-ink text-paper'
        }`}
      >
        <svg viewBox="0 0 32 32" className="w-[18px] h-[18px]" fill="none" aria-hidden="true">
          <path d="M10 12.5V11a2 2 0 0 1 2-2h1.5" stroke="currentColor" className="text-accent" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M18.5 9H20a2 2 0 0 1 2 2v1.5" stroke="currentColor" className="text-accent" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M22 19.5V21a2 2 0 0 1-2 2h-1.5" stroke="currentColor" className="text-accent" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M13.5 23H12a2 2 0 0 1-2-2v-1.5" stroke="currentColor" className="text-accent" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M8 16h16" stroke="currentColor" className="text-accent" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className={`text-[1.15rem] font-display font-bold tracking-tight leading-none ${alwaysShowWordmark ? 'block' : 'hidden sm:block'} ${inverted ? 'text-paper' : 'text-ink'}`}>
        SiteScanner <span className="text-accent">Pro</span>
      </span>
    </span>
  );
};

export default Logo;
