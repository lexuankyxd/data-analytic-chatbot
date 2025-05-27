import React, { useState } from 'react';
import { Code, Database, List, Search, Table, FileText, ChevronDown, ChevronUp, Bug } from 'lucide-react';

// Tool Result Display Component
const ToolResult = ({ type, data, timestamp, expanded, onToggle }) => {
  // Helper function to get the appropriate icon for each tool type
  const getToolIcon = (toolType) => {
    switch (toolType) {
      case '000': // Tool Call
        return <Code size={18} className="text-blue-600" />;
      case '001': // Schema Gen
        return <Database size={18} className="text-green-600" />;
      case '002': // List Table
        return <List size={18} className="text-amber-600" />;
      case '003': // List Database
        return <Database size={18} className="text-purple-600" />;
      case '004': // RAG Query
        return <Search size={18} className="text-red-600" />;
      case '005': // SQL Query
        return <Table size={18} className="text-indigo-600" />;
      case 'ERR':
        return <Bug size={18} className="text-red-600" />
      default:
        return <FileText size={18} className="text-gray-600" />;
    }
  };

  // Helper function to get the tool name from type code
  const getToolName = (toolType) => {
    switch (toolType) {
      case '000': return 'Tool Call';
      case '001': return 'Schema Gen';
      case '002': return 'List Table';
      case '003': return 'List Database';
      case '004': return 'RAG Query';
      case '005': return 'SQL Query';
      case 'ERR': return 'Error message'
      default: return 'Unknown Tool';
    }
  };

  // Tool-specific rendering
  const renderToolContent = () => {
    switch (type) {
      case '000': // Tool Call
        return renderToolCall(data);
      case '001': // Schema Gen
        return renderSchemaGen(data);
      case '002': // List Table
        return renderListTable(data);
      case '003': // List Database
        return renderListDatabase(data);
      case '004': // RAG Query
        return renderRagQuery(data);
      case '005': // SQL Query
        return renderSqlQuery(data);
      case 'ERR':
        return renderError(data);
      default:
        return <div className="text-gray-700">Unknown tool type or no data available</div>;
    }
  };

  const renderError = (data) => {
    console.log(data)
    return (
      <div className="space-y-2">
        <h4 className="text-gray-900 font-medium">Error occurred</h4>
        <h4 className="text-red-600 font-medium">{data.error}</h4>
      </div>
    );
  }

  // Render functions for each tool type
  const renderToolCall = (data) => {
    return (
      <div className="space-y-2">
        <h4 className="text-gray-900 font-medium">Tool name: {data.name}</h4>
        {Object.keys(data.arguments).length > 0 ?
          <>
            <h4 className="text-gray-900 font-medium">Arguments:</h4>
            <div className="bg-gray-100 p-2 rounded-md">
              {Object.entries(data?.arguments || {}).map(([key, value], index) => (
                <div key={index} className="flex py-1">
                  <span className="text-blue-700 mr-2">{key}:</span>
                  <span className="text-gray-700">{JSON.stringify(value)}</span>
                </div >
              ))}
            </div>
          </> :
          <h4 className="text-gray-900 font-medium">No arguments</h4>}
      </div>
    );
  };

  const renderSchemaGen = (data) => {
    return (
      <div className="space-y-4">
        {(data?.tables || []).map((table, tableIndex) => (
          <div key={tableIndex} className="bg-gray-100 p-3 rounded-lg">
            <h4 className="text-green-700 font-medium mb-2">{table.name}</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1 text-gray-600">Field</th>
                  <th className="text-left py-1 text-gray-600">Type</th>
                  <th className="text-left py-1 text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {(table.fields || []).map((field, fieldIndex) => (
                  <tr key={fieldIndex} className="border-b border-gray-200">
                    <td className="py-1 text-gray-900">{field.name}</td>
                    <td className="py-1 text-gray-700">{field.type}</td>
                    <td className="py-1 text-gray-600">{field.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const renderListTable = (data) => {
    return (
      <div className="space-y-2">
        <h4 className="text-gray-900 font-medium">Tables:</h4>
        <ul className="bg-gray-100 rounded-lg p-2 divide-y divide-gray-300">
          {(data?.tables || []).map((table, index) => (
            <li key={index} className="py-2 flex items-center">
              <Table size={16} className="text-amber-600 mr-2" />
              <span className="text-gray-800">{table}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderListDatabase = (data) => {
    return (
      <div className="space-y-2">
        <h4 className="text-gray-900 font-medium">Databases:</h4>
        <ul className="bg-gray-100 rounded-lg p-2 divide-y divide-gray-300">
          {(data?.databases || []).map((db, index) => (
            <li key={index} className="py-2 flex items-center">
              <Database size={16} className="text-purple-600 mr-2" />
              <span className="text-gray-800">{db}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const DocumentItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false);

    // Shorten text to this character length
    const maxSourceLength = 50;
    const maxDataLength = 200;

    // Format source text
    const source = item.metadata.source || 'Unknown source';
    const sourceTruncated = source.length > maxSourceLength;
    const displaySource = sourceTruncated && !expanded
      ? source.substring(0, maxSourceLength) + '...'
      : source;

    // Format data text
    let content = '';
    if (typeof item.data === 'string') {
      content = item.data;
    } else if (Array.isArray(item.data)) {
      content = item.data.join('\n');
    } else {
      content = JSON.stringify(item.data);
    }

    const contentTruncated = content.length > maxDataLength;
    console.log(content.length, source.length)
    const displayContent = contentTruncated && !expanded
      ? content.substring(0, maxDataLength) + '...'
      : content;

    const needsExpandButton = sourceTruncated || contentTruncated;

    return (
      <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
        <div className="flex items-center mb-2">
          <FileText size={16} className="text-red-600 mr-2" />
          <span className="text-gray-700 text-sm">
            {displaySource}
            {item.metadata.page && ` (Page ${item.metadata.page})`}
          </span>
        </div>

        <p className="text-gray-900 text-sm whitespace-pre-wrap">
          {displayContent}
        </p>

        {needsExpandButton && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center mt-2 text-blue-600 text-xs hover:text-blue-700"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} className="mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={14} className="mr-1" />
                Show more
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderRagQuery = (data) => {
    if (data.length === 0) {
      return <div className="text-gray-700">No documents found</div>;
    }

    return (
      <div className="space-y-4">
        <h4 className="text-gray-900 font-medium">Documents:</h4>
        {data.map((item, index) => {
          return <DocumentItem key={index} item={item} />;
        })}
      </div>
    );
  };

  const renderSqlQuery = (data) => {
    if (data.headers.length == 0) {
      return <div className="text-gray-700">No query results</div>;
    }

    const headers = data.headers;
    const rows = data.data;

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-100 text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                {headers.map((header, i) => (
                  <th key={i} className="text-left py-2 px-3 text-gray-700">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-2 px-3 text-gray-900">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-3 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div
        className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center">
          {getToolIcon(type)}
          <span className="ml-2 font-medium text-gray-900">{getToolName(type)}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-600">{timestamp}</span>
          <span className="ml-2">
            {expanded ?
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg> :
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            }
          </span>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white">
          {renderToolContent()}
        </div>
      )}
    </div>
  );
};

export default ToolResult;
