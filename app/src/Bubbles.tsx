import * as React from "react";
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';


const query = loader('./IntrospectionQuery.graphql')
const selectBubbleType = ({__schema: {types}}: any) => types.filter((t: any) => t.name === 'Bubble')[0]

function BubbleGrid({bubbleType: {fields}}: {bubbleType: {fields: {name: string}[]}}): JSX.Element {
  const fieldNames = fields.map((f) => f.name)
  return(
    <div>
      {JSON.stringify(fieldNames)}
    </div>
  )
}

export const Bubbles = () => {
  const { loading, error, data } = useQuery(query);

  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  
  const bubbleType = selectBubbleType(data)

  return (
    <div >
      <BubbleGrid  bubbleType={bubbleType} />
    </div>
  );
}
