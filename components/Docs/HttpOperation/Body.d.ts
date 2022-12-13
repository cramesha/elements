import { IHttpOperationRequestBody } from '@stoplight/types';
export interface BodyProps {
    body: IHttpOperationRequestBody;
    defaultExpandedDepth?: number;
    onChange: (requestBodyIndex: number) => void;
}
export declare const isBodyEmpty: (body?: IHttpOperationRequestBody<false> | undefined) => boolean;
export declare const Body: {
    ({ body, defaultExpandedDepth, onChange }: BodyProps): JSX.Element | null;
    displayName: string;
};
