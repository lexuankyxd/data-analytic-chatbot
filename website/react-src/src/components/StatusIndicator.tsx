import React from 'react';

/**
 * Component for displaying a status with colored indicator
 * @param {Object} props
 * @param {string} props.status - Status text
 * @param {string} props.color - Color for the indicator (e.g., 'green', 'red', 'yellow')
 */
const StatusIndicator = ({ status, color = 'green' }) => {
  return (
    <div className="flex items-center mb-2">
      <div className={`w-3 h-3 bg-${color}-400 rounded-full mr-2`}></div>
      <p className="text-sm text-gray-200">{status}</p>
    </div>
  );
};

export default StatusIndicator;
