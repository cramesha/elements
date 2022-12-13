import { IHttpOperation } from '@stoplight/types';
import * as React from 'react';
interface IRequestProps {
    operation: IHttpOperation;
    defaultExpandedDepth?: number;
    onChange: (requestBodyIndex: number) => void;
}
export declare const Request: React.FunctionComponent<IRequestProps>;
export {};
