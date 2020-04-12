import React, { useState } from "react";
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  Document,
  OperationDefinition,
  SelectionSet,
  Field,
} from './GraphAst'
import StackGrid from 'react-stack-grid';
import { 
  Button,
  Card,
  Elevation,
  Overlay,
  FormGroup,
  InputGroup,
} from "@blueprintjs/core";

import {DocumentNode} from 'graphql'

export interface IBubble {
  text: string
  id?: string
  [key: string]: boolean | string | number | undefined
}

export interface IbubbleType {
  fields: {name: string}[]
}

export interface IAddBubbleType {
  args: {[key: string]: any}[]
}

const introspectionQuery = loader('./IntrospectionQuery.graphql')
const selectType = (type: string) => ({__schema: {types}}: any) => types.filter((t: any) => t.name === type)[0]

const fieldNamesToQuery = (() => {
  let fieldNamesString: string;
  let query: DocumentNode;

  return (fieldNames: string[]): DocumentNode => {
    if (fieldNames.join(",") === fieldNamesString) return query
    fieldNamesString = fieldNames.join(",")
    query = new Document({
      definitions: [
        new OperationDefinition({
          selectionSet: new SelectionSet({
            selections: [
              new Field({
                name: 'searchBubbles',
                selectionSet: new SelectionSet({
                  selections: fieldNames.map((name) => new Field({name}))
                })
              })
            ]
          })
        })
      ]
    })
    return query
  }
})()

const AddBubbleCard = ({AddBubbleType}: {AddBubbleType: IAddBubbleType}) => {
  const [isOpen, setIsOpen] = useState(false)
  const extraInputTypes = AddBubbleType.args.filter((t) => !['text', 'id'].includes(t.name))
  console.log(extraInputTypes);
  
  return(<Card elevation={Elevation.TWO} interactive onClick={()=> setIsOpen(true)}>
  <Overlay isOpen={isOpen} onClose={()=> setIsOpen(false)}> 
    <div style={{textAlign: 'center',  width: '100%', marginTop: '100px', height: '0px'}}>
      <div style={{width: '400px', margin: 'auto'}}>
        <Card>
          <FormGroup>
            <InputGroup placeholder='text ...' />
          </FormGroup>
        </Card>
      </div>
    </div>
  </Overlay>
  <p style={{textAlign: 'center', fontSize: '1.7em'}} >+</p>
</Card>)
}

const Bubble = ({bubble}: {bubble: IBubble}) => <Card elevation={Elevation.TWO} interactive>
  <p>{bubble.text}</p>
</Card>

function BubbleGrid({bubbleType: {fields}, AddBubbleType}: {bubbleType: IbubbleType, AddBubbleType: IAddBubbleType}): JSX.Element {
  const fieldNames = fields.map((f) => f.name)
  
  const { loading, error, data } = useQuery(fieldNamesToQuery(fieldNames), {pollInterval: 500});
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return(
    <div style={{marginTop: '15px'}}>
      <StackGrid columnWidth={350}>
        <AddBubbleCard AddBubbleType={AddBubbleType}/>
        {data.searchBubbles.map((bubble: IBubble) => <Bubble bubble={bubble} key={bubble.id} />)}
      </StackGrid>
    </div>
  )
}

export const Bubbles = () => {
  const { loading, error, data } = useQuery(introspectionQuery);

  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

    console.log(data);
    
  
  const bubbleType = selectType('Bubble')(data)
  const MutationType = selectType('Mutation')(data)
  const AddBubbleType = MutationType.fields.filter(({name}: any) => name === 'addBubble')[0]

  return (
    <div >
      <BubbleGrid  bubbleType={bubbleType} AddBubbleType={AddBubbleType} />
    </div>
  );
}
