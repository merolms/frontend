import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';

const SlashCommandsList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef(new Map());

  useEffect(() => setSelectedIndex(0), [items]);

  useEffect(() => {
    itemRefs.current.get(selectedIndex)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  const selectItem = (index) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="lh-slash-menu">
        <div className="lh-slash-empty">No results</div>
      </div>
    );
  }

  return (
    <div className="lh-slash-menu">
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => (el ? itemRefs.current.set(index, el) : itemRefs.current.delete(index))}
          className={`lh-slash-item${index === selectedIndex ? ' is-selected' : ''}`}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <span className="lh-slash-icon">{item.icon}</span>
          <span className="lh-slash-text">
            <span className="lh-slash-title">{item.title}</span>
            <span className="lh-slash-desc">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});

SlashCommandsList.displayName = 'SlashCommandsList';
export default SlashCommandsList;
