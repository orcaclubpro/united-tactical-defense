// Type declarations for react-dom/client
declare module 'react-dom/client' {
  import { Root } from 'react-dom';
  
  export function createRoot(
    container: Element | DocumentFragment | null,
    options?: { hydrate?: boolean }
  ): Root;

  export function hydrateRoot(
    container: Element | DocumentFragment,
    initialChildren: React.ReactNode,
    options?: { onRecoverableError?: (error: Error) => void }
  ): Root;
} 