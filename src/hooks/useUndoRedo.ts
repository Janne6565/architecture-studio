import { useState, useCallback, useRef } from 'react';

interface State<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialPresent: T) {
  const [state, setState] = useState<State<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });
  
  const skipRef = useRef(false);

  const set = useCallback((newPresent: T, skipHistory = false) => {
    if (skipHistory) {
      skipRef.current = true;
      setState(s => ({ ...s, present: newPresent }));
      return;
    }
    setState(s => ({
      past: [...s.past.slice(-50), s.present],
      present: newPresent,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setState(s => {
      if (s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1];
      return {
        past: s.past.slice(0, -1),
        present: previous,
        future: [s.present, ...s.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(s => {
      if (s.future.length === 0) return s;
      const next = s.future[0];
      return {
        past: [...s.past, s.present],
        present: next,
        future: s.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({ past: [], present: newPresent, future: [] });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
