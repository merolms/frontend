import React,{ memo, useMemo, useRef, useState, useEffect} from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {Button, Header, Icon, Grid, Divider } from 'semantic-ui-react';
import { useDrag, useDrop } from 'react-dnd'
import update from 'immutability-helper'
import faker from 'faker'

import "./step2.scss"
import CreateLesson from './CreateLesson/CreateLesson';
import CreateContent from './CreateContent/CreateContent';



const ItemTypes = {
    PARENT: 'parent',
    CHILD: 'child',
}
const ChildItem=memo(({ id, text, moveCard }) => {
    const ref = useRef(null)
    const [{ isDragging }, connectDrag] = useDrag({
      item: { id, type: ItemTypes.CHILD },
      collect: (monitor) => {
        const result = {
          isDragging: monitor.isDragging(),
        }
        return result
      },
    })
    const [, connectDrop] = useDrop({
      accept: ItemTypes.CHILD,
      hover({ id: draggedId }) {
        if (draggedId !== id) {
          moveCard(draggedId, id)
        }
      },
    })
    connectDrag(ref)
    connectDrop(ref)
    const opacity = isDragging ? 0 : 1
    const containerStyle = useMemo(() => ({ opacity }), [opacity])
    return (
            <div className="child-container" ref={ref} style={containerStyle}>
                <Grid textAlign='left' className="grid-item child">
                    <Grid.Column width={12} style={{display: 'flex', alignItems:"baseline"}}>
                        <Header as="h5" color="grey">
                        <Icon name='move' size="mini" style={{cursor: "move"}}/>
                        {text}</Header>
                    </Grid.Column>
                    <Grid.Column floated='right' width={2}style={{display: 'flex', justifyContent:'space-around'}}>
                        <Icon name='pencil' />
                        <Icon name='trash' />
                    </Grid.Column>
                </Grid>
            </div>
    )
})
class ChildContainer extends React.Component{
    constructor(props) {
        super(props)
        this.drawFrame = () => {
          const nextState = update(this.state, this.pendingUpdateFn)
          this.setState(nextState)
          this.pendingUpdateFn = undefined
          this.requestedFrame = undefined
        }
        this.moveCard = (id, afterId) => {
          const { cardsById, cardsByIndex } = this.state
          const card = cardsById[id]
          const afterCard = cardsById[afterId]
          const cardIndex = cardsByIndex.indexOf(card)
          const afterIndex = cardsByIndex.indexOf(afterCard)
          this.scheduleUpdate({
            cardsByIndex: {
              $splice: [
                [cardIndex, 1],
                [afterIndex, 0, card],
              ],
            },
          })
        }
        this.state = buildCardData()
      }
      componentWillUnmount() {
        if (this.requestedFrame !== undefined) {
          cancelAnimationFrame(this.requestedFrame)
        }
      }
      render(){
        const { cardsByIndex } = this.state
          return(
            <React.Fragment>
                {cardsByIndex.map((card) => (
                    <ChildItem
                    key={card.id}
                    id={card.id}
                    text={card.text}
                    moveCard={this.moveCard}
                    />
                ))}
            </React.Fragment>
          )
      }
      scheduleUpdate(updateFn) {
        this.pendingUpdateFn = updateFn
        if (!this.requestedFrame) {
          this.requestedFrame = requestAnimationFrame(this.drawFrame)
        }
      }
}
const ParentItem=memo(({ id, text, moveCard }) => {
    const [open,setOpen]=useState(true)
    const [accrodion,setAccrodion]=useState("inherit")
    const ref = useRef(null)
    const [{ isDragging }, connectDrag] = useDrag({
      item: { id, type: ItemTypes.PARENT },
      collect: (monitor) => {
        const result = {
          isDragging: monitor.isDragging(),
        }
        return result
      },
    })
    const [, connectDrop] = useDrop({
      accept: ItemTypes.PARENT,
      hover({ id: draggedId }) {
        if (draggedId !== id) {
          moveCard(draggedId, id)
        }
      },
    })
    connectDrag(ref)
    connectDrop(ref)
    const opacity = isDragging ? 0 : 1
    const containerStyle = useMemo(() => ({opacity }), [opacity])
    
    const onAccrodion=()=>{
        if (open) {
            setAccrodion("47px")
            
        } else {
            setAccrodion("inherit")
        }

        setOpen(!open)

        
    }
    return (
            <div className="parent-container" ref={ref} style={containerStyle, {maxHeight:accrodion}}>
                <Grid textAlign='left' className="grid-item parent">
                    <Grid.Column width={12} style={{display: 'flex', alignItems:"baseline"}}>
                        <Header as="h4" color="grey">
                            <Icon name='move' size="mini" style={{cursor: "move"}}/>
                            Unit {id+1}: {text}
                            </Header>
                    </Grid.Column>
                    <Grid.Column floated='right' width={2}style={{display: 'flex', justifyContent:'space-between'}}>
                        <Icon name='pencil' />
                        <Icon name='trash' />
                        <Button size={"large"} compact icon={open?"angle up": "angle down"} onClick={onAccrodion} style={{background: "transparent", padding: 0}}/>
                    </Grid.Column>
                </Grid>
                <Divider hidden />
                <div>
                    <ChildContainer />
                    <Divider hidden />
                    <div className="create-content-container">
                        <CreateContent />
                    </div>
                </div>
        </div>
    )
})
function buildCardData() {
    const cardsById = {}
    const cardsByIndex = []
    for (let i = 0; i < 3; i += 1) {
      const card = { id: i, text: faker.name.findName() }
      cardsById[card.id] = card
      cardsByIndex[i] = card
    }
    return {
      cardsById,
      cardsByIndex,
    }
  }
class ParentContainer extends React.Component{
    constructor(props) {
        super(props)
        this.drawFrame = () => {
          const nextState = update(this.state, this.pendingUpdateFn)
          this.setState(nextState)
          this.pendingUpdateFn = undefined
          this.requestedFrame = undefined
        }
        this.moveCard = (id, afterId) => {
          const { cardsById, cardsByIndex } = this.state
          const card = cardsById[id]
          const afterCard = cardsById[afterId]
          const cardIndex = cardsByIndex.indexOf(card)
          const afterIndex = cardsByIndex.indexOf(afterCard)
          this.scheduleUpdate({
            cardsByIndex: {
              $splice: [
                [cardIndex, 1],
                [afterIndex, 0, card],
              ],
            },
          })
        }
        this.state = buildCardData()
      }
      componentWillUnmount() {
        if (this.requestedFrame !== undefined) {
          cancelAnimationFrame(this.requestedFrame)
        }
      }
      render(){
        const { cardsByIndex } = this.state
          return(
            <React.Fragment>
            <div className="lesson-container">
                <CreateLesson />
            </div>
            <Divider hidden />
            {cardsByIndex.map((card) => (
                <ParentItem
                key={card.id}
                id={card.id}
                text={card.text}
                moveCard={this.moveCard}
                />
            ))}
        </React.Fragment>
          )
      }
      scheduleUpdate(updateFn) {
        this.pendingUpdateFn = updateFn
        if (!this.requestedFrame) {
          this.requestedFrame = requestAnimationFrame(this.drawFrame)
        }
      }
}
const Container = () => {
    // Avoid rendering on server because the big data list is generated
    const [shouldRender, setShouldRender] = useState(false)
    // Won't fire on server.
    useEffect(() => setShouldRender(true), [])
    return <>{shouldRender && <ParentContainer />}</>
  }
function Step2() {
    return (
        <div >
            <DndProvider backend={HTML5Backend}>
                <Container />
            </DndProvider>
        </div>
    )
}


export default Step2