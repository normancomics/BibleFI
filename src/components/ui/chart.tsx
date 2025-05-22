
import React from 'react';

interface CircularProgressBarProps {
  value: number;
  strokeWidth?: number;
  size?: number;
  strokeColor?: string;
  trailColor?: string;
  className?: string;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  value,
  strokeWidth = 8,
  size = 100,
  strokeColor = 'currentColor',
  trailColor = 'rgba(255, 255, 255, 0.1)',
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trailColor}
        strokeWidth={strokeWidth}
      />
      
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
};
