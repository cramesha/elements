import { IHttpOperation, IHttpService, IHttpWebhookOperation, NodeType } from '@stoplight/types';
import { JSONSchema7 } from 'json-schema';
export declare enum NodeTypes {
    Paths = "paths",
    Path = "path",
    Operation = "operation",
    Webhooks = "webhooks",
    Webhook = "webhook",
    Components = "components",
    Models = "models",
    Model = "model"
}
export interface ISourceNodeMap {
    type: string;
    match?: string;
    notMatch?: string;
    children?: ISourceNodeMap[];
}
declare type Node<T, D> = {
    type: T;
    uri: string;
    name: string;
    data: D;
    tags: string[];
};
export declare type ServiceNode = Node<NodeType.HttpService, IHttpService> & {
    children: ServiceChildNode[];
};
export declare type ServiceChildNode = OperationNode | WebhookNode | SchemaNode;
export declare type OperationNode = Node<NodeType.HttpOperation, IHttpOperation>;
export declare type WebhookNode = Node<NodeType.HttpWebhook, IHttpWebhookOperation>;
export declare type SchemaNode = Node<NodeType.Model, JSONSchema7>;
export {};
