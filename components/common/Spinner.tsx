
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-600 border-r-green-600 animate-spin" style={{ animationDuration: '900ms' }}></div>
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-green-300 border-l-green-300 animate-spin" style={{ animationDuration: '1400ms', animationDirection: 'reverse' as any }}></div>
      </div>
    </div>
  );
};

export default Spinner;
