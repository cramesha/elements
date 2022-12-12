import type { ErrorBoundaryProps } from '@stoplight/react-error-boundary';
import type { Meta, Story } from '@storybook/react';
import * as React from 'react';
declare type DocsProps = {
    data: unknown;
} & ErrorBoundaryProps;
interface HelperReturn<P extends Partial<DocsProps>> {
    meta: Meta<P>;
    createStory(name: string, input: Partial<P>): Story<P>;
    createHoistedStory(input: Partial<P>): Story<P>;
}
export declare const createStoriesForDocsComponent: <P extends Partial<DocsProps> = DocsProps>(Component: React.ComponentType<P>, title?: string | undefined) => HelperReturn<P>;
export {};
