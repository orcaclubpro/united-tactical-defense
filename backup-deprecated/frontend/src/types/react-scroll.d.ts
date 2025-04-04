declare module 'react-scroll' {
  import * as React from 'react';

  export interface Link extends React.FC<LinkProps> {}
  export interface Element extends React.FC<ElementProps> {}
  export interface Events extends React.FC<EventsProps> {}
  export interface scroll {
    animateScroll: {
      scrollTo: (to: number, options?: ScrollOptions) => void;
      scrollToTop: (options?: ScrollOptions) => void;
      scrollToBottom: (options?: ScrollOptions) => void;
      scrollMore: (distance: number, options?: ScrollOptions) => void;
    };
    scrollTo: (to: string | number, options?: ScrollOptions) => void;
    scrollToTop: (options?: ScrollOptions) => void;
    scrollToBottom: (options?: ScrollOptions) => void;
    scrollMore: (distance: number, options?: ScrollOptions) => void;
  }

  export interface ScrollOptions {
    duration?: number;
    delay?: number;
    smooth?: boolean | string;
    offset?: number;
    containerId?: string;
  }

  export interface LinkProps {
    to: string;
    containerId?: string;
    activeClass?: string;
    activeStyle?: React.CSSProperties;
    spy?: boolean;
    smooth?: boolean | string;
    offset?: number;
    duration?: number;
    delay?: number;
    isDynamic?: boolean;
    onSetActive?: (to: string) => void;
    onSetInactive?: () => void;
    ignoreCancelEvents?: boolean;
    hashSpy?: boolean;
    saveHashHistory?: boolean;
    spyThrottle?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  }

  export interface ElementProps {
    name: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export interface EventsProps {
    target?: string;
    end?: () => void;
    begin?: () => void;
  }

  export const Link: Link;
  export const Element: Element;
  export const Events: Events;
  export const scroller: scroll;
  export const scrollSpy: {
    update: () => void;
  };
} 