import { useCallback, useEffect, useRef } from "react";
import type { ResumeData } from "../data";

const MAX_HISTORY = 30;

/**
 * Wraps an `onUpdate` function to provide undo / redo.
 *
 * Usage:
 *   const { wrappedUpdate, undo, redo, canUndo, canRedo } = useUndoRedo(resume, onUpdate);
 *
 * – Call `wrappedUpdate(fn)` instead of `onUpdate(fn)`.
 * – Every call pushes the *previous* state onto the undo stack.
 */
export function useUndoRedo(
  current: ResumeData,
  onUpdate: (fn: (d: ResumeData) => ResumeData) => void,
) {
  const undoStack = useRef<ResumeData[]>([]);
  const redoStack = useRef<ResumeData[]>([]);
  // Keep a ref to "current" so keyboard handler sees latest value
  const currentRef = useRef(current);
  currentRef.current = current;

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  /** Wrap every update so we can snapshot before mutation. */
  const wrappedUpdate = useCallback(
    (fn: (d: ResumeData) => ResumeData) => {
      // Push current state onto undo stack (deep clone)
      undoStack.current = [
        ...undoStack.current.slice(-(MAX_HISTORY - 1)),
        JSON.parse(JSON.stringify(currentRef.current)),
      ];
      // Clear redo whenever a new change is made
      redoStack.current = [];
      onUpdate(fn);
    },
    [onUpdate],
  );

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    // Push current state onto redo stack
    redoStack.current = [
      ...redoStack.current,
      JSON.parse(JSON.stringify(currentRef.current)),
    ];
    onUpdate(() => prev);
  }, [onUpdate]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current[redoStack.current.length - 1];
    redoStack.current = redoStack.current.slice(0, -1);
    // Push current state onto undo stack
    undoStack.current = [
      ...undoStack.current,
      JSON.parse(JSON.stringify(currentRef.current)),
    ];
    onUpdate(() => next);
  }, [onUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return { wrappedUpdate, undo, redo, canUndo, canRedo };
}
