import React from 'react';
import { Navigation } from "./Navigation";
import { Bubbles } from "./Bubbles";
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

const client = new ApolloClient();

function App() {
  return (
    <ApolloProvider client={client}>
      <div >
        <Navigation />
        <Bubbles />
      </div>
    </ApolloProvider>
  );
}

export default App;