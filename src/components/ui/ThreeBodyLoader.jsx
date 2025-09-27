import React from 'react';

const ThreeBodyLoader = ({ 
  size = '35px', 
  speed = '0.8s', 
  color = '#5D3FD3',
  className = '',
  overlay = false,
  message = 'Loading...'
}) => {
  const loaderStyle = {
    '--uib-size': size,
    '--uib-speed': speed,
    '--uib-color': color,
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div 
          className="three-body" 
          style={loaderStyle}
        >
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className="three-body" 
        style={loaderStyle}
      >
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
    </div>
  );
};

export default ThreeBodyLoader;
