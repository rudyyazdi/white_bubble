import * as React from "react";
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  Document,
  OperationDefinition,
  SelectionSet,
  Field,
  Name,
} from './GraphAst'

import {DocumentNode} from 'graphql'

const introspectionQuery = loader('./IntrospectionQuery.graphql')
const selectBubbleType = ({__schema: {types}}: any) => types.filter((t: any) => t.name === 'Bubble')[0]

const bubblesQuery: DocumentNode = new Document({
  definitions: [
    new OperationDefinition({
      selectionSet: new SelectionSet({
        selections: [
          new Field({
            name: new Name({
              value: 'searchBubbles'
            }),
            selectionSet: new SelectionSet({
              selections: [
                new Field({
                  name: new Name({
                    value: 'text'
                  })
                })
              ]
            })
          })
        ]
      })
    })
  ]
})

function BubbleGrid({bubbleType: {fields}}: {bubbleType: {fields: {name: string}[]}}): JSX.Element {
  const fieldNames = fields.map((f) => f.name)

  const { loading, error, data } = useQuery(bubblesQuery);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return(
    <div>
      {JSON.stringify(data)}
    </div>
  )
}

export const Bubbles = () => {
  const { loading, error, data } = useQuery(introspectionQuery);

  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  
  const bubbleType = selectBubbleType(data)

  return (
    <div >
      <BubbleGrid  bubbleType={bubbleType} />
    </div>
  );
}
