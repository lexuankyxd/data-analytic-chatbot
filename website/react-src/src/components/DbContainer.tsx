import React, { useState, useRef, forwardRef, ForwardedRef } from 'react';
import { executeSQL } from '../utils/api';
import { QueryResult } from '../types';

interface DbContainerProps {
  displayToast: (message: string, duration?: number) => void;
  selectedTables: boolean[];
  setSelectedTables: React.Dispatch<React.SetStateAction<boolean[]>>;
  setTableContext: React.Dispatch<React.SetStateAction<any[][]>>;
}

const DbContainer = forwardRef<HTMLDivElement, DbContainerProps>(
  ({ displayToast, selectedTables, setSelectedTables, setTableContext }, ref: ForwardedRef<HTMLDivElement>) => {
    const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
    const [sqlQuery, setSqlQuery] = useState<string>('');
    const dbDisplayRef = useRef<HTMLDivElement>(null);

    const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setSqlQuery(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === 'Enter') {
        handleExecuteSQL();
      }
    };

    const tableToArray = (tableElement: HTMLTableElement): string[][] => {
      if (!tableElement || !tableElement.rows) return [];

      const rows = tableElement.rows;
      const result: string[][] = [];

      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].children;
        const rowData: string[] = [];

        for (let j = 0; j < cells.length; j++) {
          rowData.push((cells[j] as HTMLElement).innerText);
        }

        result.push(rowData);
      }

      return result;
    };

    const handleExecuteSQL = async (): Promise<void> => {
      if (sqlQuery.trim() === '') return;

      try {
        displayToast('Executing query...');

        const result = await executeSQL(sqlQuery);

        // Process the table HTML
        const processedHTML = processTableHTML(result);

        // Add to query results
        const newQueryResult: QueryResult = {
          id: Date.now(),
          query: sqlQuery,
          html: processedHTML,
          selected: false
        };

        setQueryResults(prev => {
          // Limit to 5 results
          const updated = [newQueryResult, ...prev].slice(0, 5);
          setSelectedTables(updated.map(item => item.selected));

          // Update table context
          updateTableContext(updated);

          return updated;
        });

        setSqlQuery('');
        displayToast('Query executed successfully');

        // Scroll to top
        if (dbDisplayRef.current) {
          dbDisplayRef.current.scrollTop = 0;
        }
      } catch (error: any) {
        console.error('Error executing SQL:', error);

        // Add error message
        const errorResult: QueryResult = {
          id: Date.now(),
          query: sqlQuery,
          error: error.message,
          selected: false
        };

        setQueryResults(prev => [errorResult, ...prev].slice(0, 5));
        displayToast('Error executing query');
      }
    };

    const toggleTableSelection = (index: number): void => {
      setQueryResults(prev => {
        const updated = [...prev];
        updated[index].selected = !updated[index].selected;

        // Update selected tables array
        setSelectedTables(updated.map(item => item.selected));

        // Update table context
        updateTableContext(updated);

        return updated;
      });
    };

    const updateTableContext = (results: QueryResult[]): void => {
      const context: any[][] = [];

      // For each selected table result, extract table data
      results.forEach(result => {
        if (result.selected && !result.error) {
          // In a real app, we would get the actual table element
          // and convert it to an array of data
          const tableData: any[] = []; // tableToArray(tableElement);
          context.push(tableData);
        }
      });

      setTableContext(context);
    };

    const processTableHTML = (html: string): string => {
      // Check if the HTML contains a table
      if (html.includes('<table')) {
        // Simple regex to find table tags and wrap them
        return html.replace(
          /(<table[\s\S]*?<\/table>)/g,
          '<div class="table-container"><div class="table-wrapper">$1</div></div>'
        );
      }
      return html;
    };

    return (
      <div className="db-container" ref={ref}>
        <div className="db-box">
          <div className="db-header">
            <div className="avatar">DB</div>
            <div className="info">
              <h2>Database Explorer</h2>
              <p>View tables and run queries</p>
            </div>
          </div>

          <div className="db-display" ref={dbDisplayRef}>
            <div className="table-info" style={{ display: 'none' }}>
              <h3>Available Tables</h3>
              <ul id="tableList">
                <li>Loading tables...</li>
              </ul>
            </div>

            {queryResults.map((result, index) => (
              <div
                key={result.id}
                className="table-info"
                style={{ backgroundColor: result.selected ? 'red' : '#fff3e0' }}
                onClick={() => toggleTableSelection(index)}
              >
                <h3>{result.query}</h3>
                <div className="query-result">
                  {result.error ? (
                    <p>Error: {result.error}</p>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: result.html || '' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="sql-input">
            <textarea
              value={sqlQuery}
              onChange={handleQueryChange}
              onKeyDown={handleKeyPress}
              placeholder="Type your SQL query here..."
            ></textarea>
            <button onClick={handleExecuteSQL}>Run</button>
          </div>
        </div>
      </div>
    );
  }
);

export default DbContainer;
