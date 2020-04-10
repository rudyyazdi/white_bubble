import {
  DocumentNode,
  DefinitionNode,
  OperationDefinitionNode,
  SelectionSetNode,
  SelectionNode,
  FieldNode,
  NameNode
} from 'graphql'

class Document implements DocumentNode {
  readonly kind = 'Document'
  definitions: ReadonlyArray<DefinitionNode>
  constructor({definitions}: {definitions: ReadonlyArray<DefinitionNode>}) {
    this.definitions = definitions
  }
}

class OperationDefinition implements OperationDefinitionNode {
  readonly kind = "OperationDefinition"
  readonly operation = "query"
  selectionSet: SelectionSetNode
  constructor({selectionSet}: {selectionSet: SelectionSetNode}) {
    this.selectionSet = selectionSet
  }
}

class SelectionSet implements SelectionSetNode {
  readonly kind = 'SelectionSet'
  selections: ReadonlyArray<SelectionNode>
  constructor({selections}: {selections: ReadonlyArray<SelectionNode>}) {
    this.selections = selections
  }
}

class Field implements FieldNode {
  readonly kind = 'Field'
  name: NameNode
  selectionSet?: SelectionSetNode
  constructor({name, selectionSet}: {name: NameNode, selectionSet?: SelectionSetNode}){
    this.name = name
    this.selectionSet = selectionSet
  }
}

class Name implements NameNode {
  readonly kind = 'Name'
  value: string
  constructor({value}: {value: string}) {
    this.value = value
  }
}

export {
  Document,
  OperationDefinition,
  SelectionSet,
  Field,
  Name,
}