import { TableOfContentsItem } from '@stoplight/elements-core';
import { OperationNode, SchemaNode, ServiceChildNode, ServiceNode, WebhookNode } from '../../utils/oas/types';
declare type GroupableNode = OperationNode | WebhookNode | SchemaNode;
export declare type TagGroup<T extends GroupableNode> = {
    title: string;
    items: T[];
};
export declare function computeTagGroups<T extends GroupableNode>(serviceNode: ServiceNode, nodeType: T['type']): {
    groups: TagGroup<T>[];
    ungrouped: T[];
};
interface ComputeAPITreeConfig {
    hideSchemas?: boolean;
    hideInternal?: boolean;
}
export declare const computeAPITree: (serviceNode: ServiceNode, config?: ComputeAPITreeConfig) => TableOfContentsItem[];
export declare const findFirstNodeSlug: (tree: TableOfContentsItem[]) => string | void;
export declare const isInternal: (node: ServiceChildNode | ServiceNode) => boolean;
export declare const resolveRelativePath: (currentPath: string, basePath: string, outerRouter: boolean) => string;
export {};
