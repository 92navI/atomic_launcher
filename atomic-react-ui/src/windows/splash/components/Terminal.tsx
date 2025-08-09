import React, { forwardRef, useImperativeHandle } from 'react';
import { useArrayState } from '../../../utils/hooks';
import './Terminal.css';

export type TerminalItem = React.ReactNode;

export interface TerminalHandle {
  pushLine: (item: TerminalItem) => void;
  pushLines: (items: TerminalItem[]) => void;
}

export const Terminal = forwardRef<TerminalHandle>((_, ref) => {
  const [lines, { add, addMult }] = useArrayState<TerminalItem>([
    'Launching app.',
    'Cracking launch codes...',
    'Checking for guidance firmware updates...',
  ]);

  // Expose imperative methods via the ref
  useImperativeHandle(ref, () => ({
    pushLine(item: TerminalItem) {
      add(item);
    },
    pushLines(items: TerminalItem[]) {
      addMult(items);
    },
  }));

  return (
    <>
      <div className="shade" />
      <div className="terminal">
        {lines.map((item, index) => (
          <div key={index} className="terminal-line">
            <span style={{ marginRight: '7px' }}>{'> '}</span>
            {item}
          </div>
        ))}
      </div>
    </>
  );
});

Terminal.displayName = 'Terminal';
