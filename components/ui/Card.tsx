import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const CardRoot: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-secondary-dark rounded-xl overflow-hidden border border-border-dark ${className}`}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return <div className={`p-5 border-b border-border-dark flex items-center ${className}`}>{children}</div>;
};

const CardTitle: React.FC<CardProps> = ({ children, className }) => {
  return <h3 className={`text-lg font-semibold text-gray-100 ${className}`}>{children}</h3>;
};

const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

type CardComponent = React.FC<CardProps> & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Content: typeof CardContent;
};

export const Card: CardComponent = CardRoot as CardComponent;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;