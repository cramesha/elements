import { IHttpOperationResponse } from '@stoplight/types';
interface ResponsesProps {
    responses: IHttpOperationResponse[];
    defaultExpandedDepth: number | undefined;
    onMediaTypeChange(mediaType: string): void;
    onStatusCodeChange(statusCode: string): void;
}
export declare const Responses: {
    ({ responses: unsortedResponses, defaultExpandedDepth, onStatusCodeChange, onMediaTypeChange }: ResponsesProps): JSX.Element | null;
    displayName: string;
};
export {};
