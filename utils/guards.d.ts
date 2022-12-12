import type { IMarkdownViewerProps } from '@stoplight/markdown-viewer';
import { IHttpOperation, IHttpService } from '@stoplight/types';
import { JSONSchema7 } from 'json-schema';
export declare function isSMDASTRoot(maybeAst: unknown): maybeAst is IMarkdownViewerProps['markdown'];
export declare function isJSONSchema(maybeSchema: unknown): maybeSchema is JSONSchema7;
export declare function isHttpService(maybeHttpService: unknown): maybeHttpService is IHttpService;
export declare function isHttpOperation(maybeHttpOperation: unknown): maybeHttpOperation is IHttpOperation;
export declare function isProperUrl(url: string): boolean;
