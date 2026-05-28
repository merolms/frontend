import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, NodeSelection } from '@tiptap/pm/state'
import { Slice, Fragment } from '@tiptap/pm/model'

const DRAG_HANDLE_KEY = new PluginKey('dragHandle')

function createDragHandlePlugin() {
  let dragHandle = null
  let dropIndicator = null
  let hoveredBlock = null
  let draggedBlockPos = null
  let hideTimeout = null

  function init(view) {
    dragHandle = document.createElement('div')
    dragHandle.className = 'lh-drag-handle'
    dragHandle.innerHTML = `
      <div class="lh-drag-grip" draggable="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="9" cy="19" r="2"/>
          <circle cx="15" cy="5" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="15" cy="19" r="2"/>
        </svg>
      </div>
      <button class="lh-drag-action" data-action="duplicate" title="Duplicate">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      </button>
      <button class="lh-drag-action lh-drag-delete" data-action="delete" title="Delete">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </button>
    `
    document.body.appendChild(dragHandle)

    dropIndicator = document.createElement('div')
    dropIndicator.className = 'lh-drop-indicator'
    document.body.appendChild(dropIndicator)

    view.dom.addEventListener('mousemove', handleMouseMove)
    view.dom.addEventListener('mouseleave', handleMouseLeave)

    const dragGrip = dragHandle.querySelector('.lh-drag-grip')
    dragHandle.addEventListener('mouseenter', () => clearHideTimeout())
    dragHandle.addEventListener('mouseleave', () => { if (draggedBlockPos === null) scheduleHide() })
    dragHandle.addEventListener('click', handleActionClick)
    dragGrip.addEventListener('dragstart', handleDragStart)
    dragGrip.addEventListener('dragend', handleDragEnd)

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    function handleMouseMove(event) {
      if (!view.editable || draggedBlockPos !== null) return
      const block = findBlock(event.target, view)
      if (block) {
        hoveredBlock = block
        positionHandle(block)
        showHandle()
      }
    }

    function handleMouseLeave() { scheduleHide() }

    function handleActionClick(event) {
      const button = event.target.closest('button[data-action]')
      if (!button || !hoveredBlock) return
      event.preventDefault()
      event.stopPropagation()

      const nodePos = getNodePos(hoveredBlock, view)
      if (nodePos === null) return
      const node = view.state.doc.nodeAt(nodePos)
      if (!node) return

      if (button.dataset.action === 'delete') {
        view.dispatch(view.state.tr.delete(nodePos, nodePos + node.nodeSize))
      } else if (button.dataset.action === 'duplicate') {
        const slice = new Slice(Fragment.from(node), 0, 0)
        view.dispatch(view.state.tr.insert(nodePos + node.nodeSize, slice.content))
      }
      hideHandle()
    }

    function handleDragStart(event) {
      if (!hoveredBlock || !event.dataTransfer) return
      const nodePos = getNodePos(hoveredBlock, view)
      if (nodePos === null) return
      const node = view.state.doc.nodeAt(nodePos)
      if (!node) return

      draggedBlockPos = nodePos
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', '')

      const dragImage = hoveredBlock.cloneNode(true)
      Object.assign(dragImage.style, {
        position: 'absolute', top: '-9999px', opacity: '0.8',
        background: 'white', padding: '8px', borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '300px',
      })
      document.body.appendChild(dragImage)
      event.dataTransfer.setDragImage(dragImage, 20, 20)
      setTimeout(() => dragImage.remove(), 0)

      view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos)))
      hoveredBlock.classList.add('lh-is-dragging')
      dragHandle.classList.add('lh-is-dragging')
    }

    function handleDragEnd() {
      hoveredBlock?.classList.remove('lh-is-dragging')
      dragHandle?.classList.remove('lh-is-dragging')
      dropIndicator?.classList.remove('lh-visible')
      draggedBlockPos = null
      hideHandle()
    }

    function handleDragOver(event) {
      if (draggedBlockPos === null) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      const dropTarget = getDropTarget(event.clientY, view)
      if (dropTarget) showDropIndicator(dropTarget.rect, dropTarget.position, view)
      else dropIndicator?.classList.remove('lh-visible')
    }

    function handleDrop(event) {
      if (draggedBlockPos === null) return
      event.preventDefault()
      const dropTarget = getDropTarget(event.clientY, view)
      if (!dropTarget) return

      const { state } = view
      const node = state.doc.nodeAt(draggedBlockPos)
      if (!node) return

      const nodeSize = node.nodeSize
      let targetPos = dropTarget.pos
      if (targetPos === draggedBlockPos || targetPos === draggedBlockPos + nodeSize) return

      const slice = new Slice(Fragment.from(node), 0, 0)
      let tr = state.tr

      if (targetPos > draggedBlockPos) {
        tr = tr.delete(draggedBlockPos, draggedBlockPos + nodeSize)
        targetPos -= nodeSize
      } else {
        tr = tr.delete(draggedBlockPos, draggedBlockPos + nodeSize)
      }
      view.dispatch(tr.insert(targetPos, slice.content))
    }

    function findBlock(target, view) {
      let el = target
      while (el && el.parentElement) {
        if (el.parentElement === view.dom) return el
        el = el.parentElement
      }
      return null
    }

    function getNodePos(element, view) {
      try {
        const pos = view.posAtDOM(element, 0)
        const $pos = view.state.doc.resolve(pos)
        return $pos.depth > 0 ? $pos.before($pos.depth) : pos
      } catch {
        const children = Array.from(view.dom.children)
        const index = children.indexOf(element)
        if (index === -1) return null
        let currentPos = 0
        for (let i = 0; i < view.state.doc.childCount; i++) {
          if (i === index) return currentPos
          currentPos += view.state.doc.child(i).nodeSize
        }
        return null
      }
    }

    function getDropTarget(clientY, view) {
      const children = Array.from(view.dom.children)
      let closest = null

      for (const block of children) {
        if (block === hoveredBlock || block.nodeType !== Node.ELEMENT_NODE) continue
        const rect = block.getBoundingClientRect()
        const midY = rect.top + rect.height / 2
        if (clientY >= rect.top - 30 && clientY <= rect.bottom + 30) {
          const position = clientY < midY ? 'before' : 'after'
          const distance = position === 'before'
            ? Math.abs(clientY - rect.top)
            : Math.abs(clientY - rect.bottom)
          if (!closest || distance < closest.distance) {
            closest = { element: block, distance, position }
          }
        }
      }

      if (!closest) return null
      try {
        const nodePos = getNodePos(closest.element, view)
        if (nodePos === null) return null
        const blockNode = view.state.doc.nodeAt(nodePos)
        if (!blockNode) return null
        return {
          pos: closest.position === 'before' ? nodePos : nodePos + blockNode.nodeSize,
          rect: closest.element.getBoundingClientRect(),
          position: closest.position,
        }
      } catch { return null }
    }

    function positionHandle(block) {
      if (!dragHandle) return
      const rect = block.getBoundingClientRect()
      dragHandle.style.left = `${rect.left - 52}px`
      dragHandle.style.top = `${rect.top + 4}px`
    }

    function showHandle() {
      clearHideTimeout()
      dragHandle?.classList.add('lh-visible')
    }

    function hideHandle() {
      dragHandle?.classList.remove('lh-visible')
      hoveredBlock = null
    }

    function scheduleHide() {
      clearHideTimeout()
      hideTimeout = setTimeout(hideHandle, 200)
    }

    function clearHideTimeout() {
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
    }

    function showDropIndicator(rect, position, view) {
      if (!dropIndicator) return
      const editorRect = view.dom.getBoundingClientRect()
      const y = position === 'before' ? rect.top : rect.bottom
      dropIndicator.style.left = `${editorRect.left + 10}px`
      dropIndicator.style.width = `${editorRect.width - 20}px`
      dropIndicator.style.top = `${y - 1}px`
      dropIndicator.classList.add('lh-visible')
    }

    return {
      destroy() {
        view.dom.removeEventListener('mousemove', handleMouseMove)
        view.dom.removeEventListener('mouseleave', handleMouseLeave)
        document.removeEventListener('dragover', handleDragOver)
        document.removeEventListener('drop', handleDrop)
        clearHideTimeout()
        dragHandle?.remove()
        dropIndicator?.remove()
      }
    }
  }

  return new Plugin({ key: DRAG_HANDLE_KEY, view: init })
}

export const DragHandle = Extension.create({
  name: 'dragHandle',
  addProseMirrorPlugins() {
    return [createDragHandlePlugin()]
  },
})

export default DragHandle
