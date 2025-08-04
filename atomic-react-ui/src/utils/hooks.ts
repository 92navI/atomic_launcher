import { useState } from 'react';

type ArrayStateActions<T> = {
  add: (item: T) => void;
  addMult: (item: T[]) => void;
  addFirst: (item: T) => void;
  remove: (item: number) => void;
  removeItem: (item: T) => void;
  removeFirst: () => void;
  removeLast: () => void;
  clear: () => void;
};

export const useArrayState = <T>(
  initialItems: T[]
): [T[], ArrayStateActions<T>] => {
  const [items, setItems] = useState(initialItems);

  const add = (item: T) => setItems([...items, item]);

  const addMult = (item: T[]) => setItems([...items, ...item]);

  const addFirst = (item: T) => setItems([item, ...items]);

  const remove = (index: number) =>
    setItems((items) => items.filter((_, i) => i !== index));

  const removeFirst = () =>
    setItems((items) => items.filter((_, i) => i !== 0));

  const removeLast = () =>
    setItems((items) => items.filter((_, i) => i !== items.length - 1));

  const removeItem = (item: T) =>
    setItems((items) => items.filter((i) => i !== item));

  const clear = () => setItems([]);

  return [
    items,
    {
      add,
      addMult,
      addFirst,
      remove,
      removeItem,
      removeFirst,
      removeLast,
      clear,
    },
  ];
};
