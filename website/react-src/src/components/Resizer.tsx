import React, { useEffect, useRef } from 'react';

interface ResizerProps {
  leftElement: React.RefObject<HTMLDivElement>;
  rightElement: React.RefObject<HTMLDivElement>;
}

function Resizer({ leftElement, rightElement }: ResizerProps): JSX.Element {
  const resizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizer = resizerRef.current;
    let x = 0;
    let y = 0;
    let leftWidth = 0;

    const mouseDownHandler = function (e: MouseEvent) {
      x = e.clientX;
      y = e.clientY;

      if (leftElement.current) {
        leftWidth = leftElement.current.getBoundingClientRect().width;
      }

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);

      if (resizer) {
        resizer.classList.add('active');
      }
    };

    const mouseMoveHandler = function (e: MouseEvent) {
      if (!leftElement.current || !rightElement.current) return;

      const dx = e.clientX - x;
      const dy = e.clientY - y;

      const container = document.querySelector<HTMLDivElement>('.container');
      if (!container) return;

      const containerWidth = container.getBoundingClientRect().width;

      // Adjust dimensions based on window width
      if (window.innerWidth >= 992) {
        // Horizontal mode
        const newLeftWidth = ((leftWidth + dx) * 100) / containerWidth;
        leftElement.current.style.flex = `0 0 ${newLeftWidth}%`;
        rightElement.current.style.flex = `0 0 ${100 - newLeftWidth}%`;
      } else {
        // Vertical mode
        const containerHeight = container.getBoundingClientRect().height;
        const chatHeight = leftElement.current.getBoundingClientRect().height;
        const newChatHeight = ((chatHeight + dy) * 100) / containerHeight;
        leftElement.current.style.flex = `0 0 ${newChatHeight}%`;
        rightElement.current.style.flex = `0 0 ${100 - newChatHeight}%`;
      }

      document.body.style.cursor = window.innerWidth >= 992 ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    };

    const mouseUpHandler = function () {
      if (resizer) {
        resizer.classList.remove('active');
      }

      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');

      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Attach the handler
    if (resizer) {
      resizer.addEventListener('mousedown', mouseDownHandler);
    }

    // Handle window resize
    const handleResize = function () {
      if (window.innerWidth < 992) {
        if (leftElement.current) leftElement.current.style.flex = '';
        if (rightElement.current) rightElement.current.style.flex = '';
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (resizer) {
        resizer.removeEventListener('mousedown', mouseDownHandler);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
  }, [leftElement, rightElement]);

  return <div className="resizer" ref={resizerRef}></div>;
}

export default Resizer;
