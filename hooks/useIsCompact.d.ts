import { Ref } from 'react';
import { DocsProps } from '../components/Docs';
export declare function useIsCompact(layoutOptions: DocsProps['layoutOptions']): {
    ref: Ref<HTMLDivElement>;
    isCompact: boolean;
};
