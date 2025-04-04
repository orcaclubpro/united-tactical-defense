// Type declarations for react-chartjs-2
declare module 'react-chartjs-2' {
  import { ChartComponentProps } from 'chart.js';
  import * as React from 'react';
  
  export interface ChartProps extends ChartComponentProps {
    redraw?: boolean;
    datasetIdKey?: string;
    type?: string;
    data: object;
    options?: object;
    plugins?: object[];
  }
  
  export class Chart<T extends ChartProps = ChartProps> extends React.Component<T> {}
  export class Line extends Chart {}
  export class Bar extends Chart {}
  export class Pie extends Chart {}
  export class Doughnut extends Chart {}
  export class PolarArea extends Chart {}
  export class Radar extends Chart {}
  export class Bubble extends Chart {}
  export class Scatter extends Chart {}
} 