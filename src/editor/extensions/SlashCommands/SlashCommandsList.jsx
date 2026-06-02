import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef, useCallback } from 'react'
import { categoryLabels, groupCommandsByCategory } from './slashCommandsConfig'

const SlashCommandsList = forwardRef(({ items, command, currentPlan = 'free' }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef(null)
  const itemRefs = useRef(new Map())

  useEffect(() => { setSelectedIndex(0) }, [items])

  useEffect(() => {
    const el = itemRefs.current.get(selectedIndex)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedIndex])

  const selectItem = useCallback((index) => {
    const item = items[index]
    if (item) command(item)
  }, [items, command])

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => prev <= 0 ? items.length - 1 : prev - 1)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => prev >= items.length - 1 ? 0 : prev + 1)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  const groupedCommands = groupCommandsByCategory(items)

  if (items.length === 0) {
    return (
      <div className="slash-commands-menu">
        <div className="slash-commands-empty">No results found</div>
      </div>
    )
  }

  let overallIndex = 0

  return (
    <div className="slash-commands-menu" ref={containerRef}>
      {Array.from(groupedCommands.entries()).map(([category, categoryItems]) => (
        <div key={category} className="slash-commands-category">
          <div className="slash-commands-category-label">{categoryLabels[category]}</div>
          {categoryItems.map((item) => {
            const currentIndex = overallIndex++
            return (
              <button
                key={item.id}
                ref={(el) => { if (el) itemRefs.current.set(currentIndex, el); else itemRefs.current.delete(currentIndex) }}
                className={`slash-commands-item ${currentIndex === selectedIndex ? 'is-selected' : ''}`}
                onClick={() => selectItem(currentIndex)}
                onMouseEnter={() => setSelectedIndex(currentIndex)}
              >
                <div className="slash-commands-item-icon">{item.icon}</div>
                <div className="slash-commands-item-content">
                  <div className="slash-commands-item-title">{item.title}</div>
                  <div className="slash-commands-item-description">{item.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
})

SlashCommandsList.displayName = 'SlashCommandsList'
export default SlashCommandsList
