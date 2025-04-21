import React, { useState, useRef } from 'react';
import Header from './components/Header';
import ChatContainer from './components/ChatContainer';
import DbContainer from './components/DbContainer';
import Resizer from './components/Resizer';
import Toast from './components/Toast';

function App(): JSX.Element {
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [selectedTables, setSelectedTables] = useState<boolean[]>([]);
  const [tableContext, setTableContext] = useState<any[][]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dbContainerRef = useRef<HTMLDivElement>(null);

  const displayToast = (message: string, duration: number = 2000): void => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  return (
    <>
      <Header />
      <div className="container">
        <ChatContainer
          ref={chatContainerRef}
          tableContext={tableContext}
          displayToast={displayToast}
        />

        <Resizer
          leftElement={chatContainerRef}
          rightElement={dbContainerRef}
        />

        <DbContainer
          ref={dbContainerRef}
          displayToast={displayToast}
          selectedTables={selectedTables}
          setSelectedTables={setSelectedTables}
          setTableContext={setTableContext}
        />
      </div>

      <Toast
        message={toastMessage}
        show={showToast}
      />
    </>
  );
}

export default App;
