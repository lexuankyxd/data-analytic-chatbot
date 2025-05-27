const TabContent = ({ title, children, active }) => {
  if (!active) return null;
  return (
    <div className="bg-white rounded-lg p-4 h-full overflow-y-auto border border-gray-200">
      <h3 className="text-lg font-medium mb-4 text-gray-800">{title}</h3>
      {children}
    </div>
  );
};

export default TabContent;
