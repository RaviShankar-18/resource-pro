/// <reference types="vite/client" />

// Add type declarations for path aliases
declare module '@contexts/*' {
  import { FC, ReactNode } from 'react';
  const component: FC<{ children?: ReactNode }>;
  export default component;
}

declare module '@components/ui/*' {
  import { FC, ReactNode, HTMLAttributes } from 'react';
  const component: FC<HTMLAttributes<HTMLElement>>;
  export default component;
}

declare module '@pages/*' {
  import { FC, ReactNode } from 'react';
  const component: FC;
  export default component;
}
