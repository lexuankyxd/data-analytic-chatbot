import React from 'react';

/**
 * Component for displaying key-value data in a table format
 * @param {Object} props
 * @param {Array<{label: string, value: string|number}>} props.data - Array of data objects with label and value
 */
const DataTable = ({ data }) => {
  return (
    <div className="space-y-1">
      {data.map((item, index) => (
        <div key={index} className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-300">{item.label}</p>
          <p className="text-gray-200 font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DataTable;
