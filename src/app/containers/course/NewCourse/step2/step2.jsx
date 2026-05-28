import React, { memo, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, Header, Icon, Grid, Divider } from '@tabler/icons-react';
import { useDrag, useDrop } from 'react-dnd';
import { produce } from 'immer';
import { faker } from '@faker-js/faker';
import CreateLesson from '@/app/containers/course/NewCourse/step2/CreateLesson/CreateLesson';
import CreateContent from '@/app/containers/course/NewCourse/step2/CreateContent/CreateContent';

const ItemTypes = { PARENT: 'parent', CHILD: 'child' };

const ChildItem = memo(({ id, text, moveCard }) => {
  const ref = useRef(null);
  const [{ isDragging }, connectDrag] = useDrag({ item: { id, type: ItemTypes.CHILD }, collect: (monitor) => ({ isDragging: monitor.isDragging() }) });
  const [, connectDrop] = useDrop({ accept: ItemTypes.CHILD, hover({ id: draggedId }) { if (draggedId !== id) moveCard(draggedId, id); } });
  connectDrag(ref); connectDrop(ref);
  const opacity = isDragging ? 0 : 1;
  return (
    <div className="child-container" ref={ref} style={{ opacity }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', border: '1px solid #e8e8e8', borderRadius: 4, marginBottom: 4, background: '#fff' }}>
        <Icon name="move" size={14} style={{ cursor: 'move', marginRight: 8 }} />
        <span style={{ flex: 1 }}>{text}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Icon name="pencil" size={14} style={{ cursor: 'pointer' }} />
          <Icon name="trash" size={14} style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
});

class ChildContainer extends React.Component {
  constructor(props) { super(props); this.state = buildCardData(); this.drawFrame = this.drawFrame.bind(this); this.moveCard = this.moveCard.bind(this); this.scheduleUpdate = this.scheduleUpdate.bind(this); }
  drawFrame() { if (this.pendingUpdateFn) { this.setState(this.pendingUpdateFn); this.pendingUpdateFn = undefined; this.requestedFrame = undefined; } }
  moveCard(id, afterId) {
    const { cardsById, cardsByIndex } = this.state;
    const card = cardsById[id]; const afterCard = cardsById[afterId];
    const cardIndex = cardsByIndex.indexOf(card); const afterIndex = cardsByIndex.indexOf(afterCard);
    this.scheduleUpdate((draft) => { const [removed] = draft.cardsByIndex.splice(cardIndex, 1); draft.cardsByIndex.splice(afterIndex, 0, removed); });
  }
  componentWillUnmount() { if (this.requestedFrame !== undefined) cancelAnimationFrame(this.requestedFrame); }
  render() { const { cardsByIndex } = this.state; return (<>{cardsByIndex.map((card) => (<ChildItem key={card.id} id={card.id} text={card.text} moveCard={this.moveCard} />))}</>); }
  scheduleUpdate(updater) { this.pendingUpdateFn = produce(this.state, updater); if (!this.requestedFrame) this.requestedFrame = requestAnimationFrame(this.drawFrame); }
}

const ParentItem = memo(({ id, text, moveCard, Icon }) => {
  const [open, setOpen] = useState(true);
  const ref = useRef(null);
  const [{ isDragging }, connectDrag] = useDrag({ item: { id, type: ItemTypes.PARENT }, collect: (monitor) => ({ isDragging: monitor.isDragging() }) });
  const [, connectDrop] = useDrop({ accept: ItemTypes.PARENT, hover({ id: draggedId }) { if (draggedId !== id) moveCard(draggedId, id); } });
  connectDrag(ref); connectDrop(ref);
  const opacity = isDragging ? 0 : 1;
  const onAccordion = () => setOpen(!open);
  return (
    <div className="parent-container" ref={ref} style={{ opacity, marginBottom: 8, border: '1px solid #e8e8e8', borderRadius: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px' }}>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="move" size={14} style={{ cursor: 'move' }} />
          <span style={{ fontWeight: 600 }}>Unit {id + 1}: {text}</span>
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name="pencil" size={14} style={{ cursor: 'pointer' }} />
          <Icon name="trash" size={14} style={{ cursor: 'pointer' }} />
          <button onClick={onAccordion} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name={open ? 'angle up' : 'angle down'} size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div style={{ padding: '8px 12px' }}>
          <ChildContainer />
          <CreateContent />
        </div>
      )}
    </div>
  );
});

function buildCardData() {
  const cardsById = {}; const cardsByIndex = [];
  for (let i = 0; i < 3; i++) { const card = { id: i, text: faker.person.fullName() }; cardsById[card.id] = card; cardsByIndex[i] = card; }
  return { cardsById, cardsByIndex };
}

class ParentContainer extends React.Component {
  constructor(props) { super(props); this.state = buildCardData(); this.drawFrame = this.drawFrame.bind(this); this.moveCard = this.moveCard.bind(this); this.scheduleUpdate = this.scheduleUpdate.bind(this); }
  drawFrame() { if (this.pendingUpdateFn) { this.setState(this.pendingUpdateFn); this.pendingUpdateFn = undefined; this.requestedFrame = undefined; } }
  moveCard(id, afterId) {
    const { cardsById, cardsByIndex } = this.state;
    const card = cardsById[id]; const afterCard = cardsById[afterId];
    const cardIndex = cardsByIndex.indexOf(card); const afterIndex = cardsByIndex.indexOf(afterCard);
    this.scheduleUpdate((draft) => { const [removed] = draft.cardsByIndex.splice(cardIndex, 1); draft.cardsByIndex.splice(afterIndex, 0, removed); });
  }
  componentWillUnmount() { if (this.requestedFrame !== undefined) cancelAnimationFrame(this.requestedFrame); }
  render() {
    const { cardsByIndex } = this.state;
    return (<>{cardsByIndex.map((card) => (<ParentItem key={card.id} id={card.id} text={card.text} moveCard={this.moveCard} Icon={Icon} />))}</>);
  }
  scheduleUpdate(updater) { this.pendingUpdateFn = produce(this.state, updater); if (!this.requestedFrame) this.requestedFrame = requestAnimationFrame(this.drawFrame); }
}

const Container = () => { const [shouldRender, setShouldRender] = useState(false); useEffect(() => setShouldRender(true), []); return <>{shouldRender && <ParentContainer />}</>; };

function Step2() { return (<div><DndProvider backend={HTML5Backend}><Container /></DndProvider></div>); }
export default Step2;
