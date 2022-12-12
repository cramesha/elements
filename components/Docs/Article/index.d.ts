import { IMarkdownViewerProps } from '@stoplight/markdown-viewer';
import { DocsComponentProps } from '..';
declare type ArticleProps = DocsComponentProps<IMarkdownViewerProps['markdown']>;
export declare const Article: import("react").FunctionComponent<ArticleProps & import("@stoplight/react-error-boundary").ErrorBoundaryProps<{}>>;
export {};
