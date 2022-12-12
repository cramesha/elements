import * as React from 'react';
import type { DocsProps } from '../components/Docs';
export declare type ElementsOptionsContextProps = Pick<DocsProps, 'nodeHasChanged'>;
export declare const ElementsOptionsContext: React.Context<ElementsOptionsContextProps>;
export declare const useOptionsCtx: () => ElementsOptionsContextProps;
export declare type ProviderProps = Partial<ElementsOptionsContextProps> & {
    children: React.ReactNode;
};
export declare function ElementsOptionsProvider({ children, nodeHasChanged }: ProviderProps): JSX.Element;
