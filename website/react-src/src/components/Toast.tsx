import React from 'react';

interface ToastProps {
  message: string;
  show: boolean;
}

function Toast({ message, show }: ToastProps): JSX.Element {
  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      {message}
    </div>
  );
}

export default Toast;
