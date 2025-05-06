import React from 'react';

/**
 * Component for displaying information cards in the dashboard
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 */
const InfoCard = ({ title, children }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-4 shadow-inner">
      <h3 className="text-gray-300 text-sm uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
};

export default InfoCard;
