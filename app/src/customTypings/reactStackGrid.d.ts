declare module 'react-stack-grid' {
  interface StackGridProps {
    columnWidth: number
  }
  
  class StackGrid extends React.Component<StackGridProps & any, any> {}

  export = StackGrid
}