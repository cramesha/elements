import { __rest, __awaiter } from 'tslib';
import * as React from 'react';
import React__default, { useContext, useMemo } from 'react';
import { resolveInlineRef, hasRef, isPlainObject as isPlainObject$1, safeParse, safeStringify } from '@stoplight/json';
import isArray from 'lodash/isArray.js';
import isPlainObject from 'lodash/isPlainObject.js';
import { NodeType, HttpParamStyles } from '@stoplight/types';
import { parse } from '@stoplight/yaml';
import { isArray as isArray$1, Box, Panel, CopyButton, Menu, Button, Text, Flex, Input, Icon, Select, FieldButton, Image, Link, useThemeIsDark, HStack, VStack, InvertTheme, Tooltip, Badge, LinkHeading as LinkHeading$1, NodeAnnotation, Tabs, TabList, Tab, TabPanels, TabPanel, Heading, useClipboard, useBreakpoints, useMosaicContext, Provider as Provider$1 } from '@stoplight/mosaic';
import isObject from 'lodash/isObject.js';
import { withErrorBoundary } from '@stoplight/react-error-boundary';
import { MarkdownViewer as MarkdownViewer$1, DefaultSMDComponents, MarkdownViewerProvider } from '@stoplight/markdown-viewer';
export { DefaultSMDComponents } from '@stoplight/markdown-viewer';
import cn from 'classnames';
import { atomWithStorage, useAtomValue } from 'jotai/utils';
import { atom, useAtom, Provider } from 'jotai';
import URI from 'urijs';
import { CodeViewer } from '@stoplight/mosaic-code-viewer';
import HTTPSnippet from 'httpsnippet';
import flatten from 'lodash/flatten.js';
import capitalize from 'lodash/capitalize.js';
import filter from 'lodash/filter.js';
import { nanoid } from 'nanoid';
import curry from 'lodash/curry.js';
import omit from 'lodash/omit.js';
import keyBy from 'lodash/keyBy.js';
import map from 'lodash/map.js';
import mapValues from 'lodash/mapValues.js';
import isString from 'lodash/isString.js';
import pickBy from 'lodash/pickBy.js';
import { CodeEditor } from '@stoplight/mosaic-code-editor';
import * as Sampler from '@stoplight/json-schema-sampler';
import compact from 'lodash/compact.js';
import uniq from 'lodash/uniq.js';
import orderBy from 'lodash/orderBy.js';
import uniqBy from 'lodash/uniqBy.js';
import formatXml from 'xml-formatter';
import entries from 'lodash/entries.js';
import keys from 'lodash/keys.js';
import { useLocation, BrowserRouter, MemoryRouter, HashRouter, StaticRouter, Route } from 'react-router-dom';
import { JsonSchemaViewer } from '@stoplight/json-schema-viewer';
import sortBy from 'lodash/sortBy.js';
import { HashLink } from 'react-router-hash-link';
import { QueryClient, useQueryClient, QueryClientProvider } from 'react-query';
import $RefParser from '@stoplight/json-schema-ref-parser';
import * as PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual.js';
import * as ReactDOM from 'react-dom';

const defaultResolver = (contextObject) => ({ pointer }, _, currentObject) => {
    const activeObject = contextObject !== null && contextObject !== void 0 ? contextObject : currentObject;
    if (pointer === null) {
        return null;
    }
    if (pointer === '#') {
        return activeObject;
    }
    const resolved = resolveInlineRef(activeObject, pointer);
    if (resolved)
        return resolved;
    throw new ReferenceError(`Could not resolve '${pointer}`);
};

const originalObjectSymbol = Symbol('OriginalObject');
const createResolvedObject = (currentObject, options = {}) => recursivelyCreateResolvedObject(currentObject, currentObject, [], new Map(), options);
const recursivelyCreateResolvedObject = (currentObject, rootCurrentObject, propertyPath, objectToProxiedObjectCache, options = {}) => {
    if (isResolvedObjectProxy(currentObject))
        return currentObject;
    if (objectToProxiedObjectCache.has(currentObject))
        return objectToProxiedObjectCache.get(currentObject);
    const mergedOptions = {
        contextObject: options.contextObject || currentObject,
        resolver: options.resolver || defaultResolver(options.contextObject || currentObject),
    };
    const resolvedObjectProxy = new Proxy(currentObject, {
        get(target, name) {
            if (name === originalObjectSymbol)
                return currentObject;
            const value = target[name];
            const newPropertyPath = [...propertyPath, name.toString()];
            let resolvedValue;
            if (isReference(value)) {
                try {
                    resolvedValue = mergedOptions.resolver({ pointer: value.$ref, source: null }, newPropertyPath, rootCurrentObject);
                }
                catch (e) {
                    resolvedValue = Object.assign(Object.assign({}, value), { $error: e.message });
                }
            }
            else {
                resolvedValue = value;
            }
            if (isPlainObject(resolvedValue) || isArray(resolvedValue)) {
                return recursivelyCreateResolvedObject(resolvedValue, rootCurrentObject, newPropertyPath, objectToProxiedObjectCache, mergedOptions);
            }
            return resolvedValue;
        },
    });
    objectToProxiedObjectCache.set(currentObject, resolvedObjectProxy);
    return resolvedObjectProxy;
};
const isResolvedObjectProxy = (someObject) => {
    return !!someObject[originalObjectSymbol];
};
const getOriginalObject = (resolvedObject) => {
    return resolvedObject[originalObjectSymbol] || resolvedObject;
};
const isReference = hasRef;

const InlineRefResolverContext = React.createContext(undefined);
InlineRefResolverContext.displayName = 'InlineRefResolverContext';
const DocumentContext = React.createContext(undefined);
DocumentContext.displayName = 'DocumentContext';
const InlineRefResolverProvider = ({ children, document: maybeDocument, resolver, }) => {
    const document = isPlainObject$1(maybeDocument) ? maybeDocument : undefined;
    const computedResolver = React.useMemo(() => resolver || (document !== undefined ? defaultResolver(document) : undefined), [document, resolver]);
    return (React.createElement(InlineRefResolverContext.Provider, { value: computedResolver },
        React.createElement(DocumentContext.Provider, { value: document }, children)));
};
const useInlineRefResolver = () => useContext(InlineRefResolverContext);
const useDocument = () => useContext(DocumentContext);
const useResolvedObject = (currentObject) => {
    const document = useDocument();
    const resolver = useInlineRefResolver();
    return React.useMemo(() => createResolvedObject(currentObject, { contextObject: document, resolver }), [currentObject, document, resolver]);
};

const DEFAULT_CONTEXT = {};
const ElementsOptionsContext = React.createContext(DEFAULT_CONTEXT);
const useOptionsCtx = () => {
    return React.useContext(ElementsOptionsContext) || DEFAULT_CONTEXT;
};
function ElementsOptionsProvider({ children, nodeHasChanged }) {
    return (React.createElement(ElementsOptionsContext.Provider, { value: Object.assign({}, DEFAULT_CONTEXT, { nodeHasChanged }) }, children));
}

function isSMDASTRoot(maybeAst) {
    return isObject(maybeAst) && maybeAst['type'] === 'root' && isArray$1(maybeAst['children']);
}
function isJSONSchema(maybeSchema) {
    return isPlainObject(maybeSchema);
}
function isStoplightNode(maybeNode) {
    return isObject(maybeNode) && 'id' in maybeNode;
}
function isHttpService(maybeHttpService) {
    return isStoplightNode(maybeHttpService) && 'name' in maybeHttpService && 'version' in maybeHttpService;
}
function isHttpOperation(maybeHttpOperation) {
    return isStoplightNode(maybeHttpOperation) && 'method' in maybeHttpOperation && 'path' in maybeHttpOperation;
}
const properUrl = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
function isProperUrl(url) {
    return properUrl.test(url);
}

function useParsedData(nodeType, data) {
    return React.useMemo(() => { var _a; return (_a = parserMap[nodeType]) === null || _a === void 0 ? void 0 : _a.call(parserMap, data); }, [nodeType, data]);
}
const parserMap = {
    [NodeType.Article]: parseArticleData,
    [NodeType.HttpOperation]: parseHttpOperation,
    [NodeType.HttpService]: parseHttpService,
    [NodeType.Model]: parseModel,
    [NodeType.HttpServer]: parseUnknown,
    [NodeType.Generic]: parseUnknown,
    [NodeType.TableOfContents]: parseUnknown,
    [NodeType.SpectralRuleset]: parseUnknown,
    [NodeType.Styleguide]: parseUnknown,
    [NodeType.Image]: parseUnknown,
    [NodeType.Unknown]: parseUnknown,
};
function parseArticleData(rawData) {
    if (typeof rawData === 'string' || isSMDASTRoot(rawData)) {
        return {
            type: NodeType.Article,
            data: rawData,
        };
    }
    return undefined;
}
function parseHttpOperation(rawData) {
    const data = tryParseYamlOrObject(rawData);
    if (isHttpOperation(data)) {
        return {
            type: NodeType.HttpOperation,
            data: data,
        };
    }
    return undefined;
}
function parseHttpService(rawData) {
    const data = tryParseYamlOrObject(rawData);
    if (isHttpService(data)) {
        return {
            type: NodeType.HttpService,
            data: data,
        };
    }
    return undefined;
}
function parseModel(rawData) {
    const data = tryParseYamlOrObject(rawData);
    if (isJSONSchema(data)) {
        return {
            type: NodeType.Model,
            data: data,
        };
    }
    return undefined;
}
function tryParseYamlOrObject(yamlOrObject) {
    if (typeof yamlOrObject === 'object' && yamlOrObject !== null)
        return yamlOrObject;
    if (typeof yamlOrObject === 'string') {
        try {
            return parse(yamlOrObject);
        }
        catch (e) { }
    }
    return undefined;
}
function parseUnknown() {
    return undefined;
}

const MarkdownViewer = (props) => {
    return React.createElement(MarkdownViewer$1, Object.assign({}, props));
};
MarkdownViewer.displayName = 'MarkdownViewer';

const ArticleComponent = React.memo(({ data }) => {
    return (React.createElement(Box, { className: "sl-elements-article" },
        React.createElement(MarkdownViewer, { className: "sl-elements-article-content", markdown: data, includeToc: true })));
});
const Article = withErrorBoundary(ArticleComponent, { recoverableProps: ['data'] });

/*!
 * Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2022 Fonticons, Inc.
 */
var faBolt = {
  prefix: 'fas',
  iconName: 'bolt',
  icon: [384, 512, [9889, "zap"], "f0e7", "M240.5 224H352C365.3 224 377.3 232.3 381.1 244.7C386.6 257.2 383.1 271.3 373.1 280.1L117.1 504.1C105.8 513.9 89.27 514.7 77.19 505.9C65.1 497.1 60.7 481.1 66.59 467.4L143.5 288H31.1C18.67 288 6.733 279.7 2.044 267.3C-2.645 254.8 .8944 240.7 10.93 231.9L266.9 7.918C278.2-1.92 294.7-2.669 306.8 6.114C318.9 14.9 323.3 30.87 317.4 44.61L240.5 224z"]
};
var faBookOpen = {
  prefix: 'fas',
  iconName: 'book-open',
  icon: [576, 512, [128366, 128214], "f518", "M144.3 32.04C106.9 31.29 63.7 41.44 18.6 61.29c-11.42 5.026-18.6 16.67-18.6 29.15l0 357.6c0 11.55 11.99 19.55 22.45 14.65c126.3-59.14 219.8 11 223.8 14.01C249.1 478.9 252.5 480 256 480c12.4 0 16-11.38 16-15.98V80.04c0-5.203-2.531-10.08-6.781-13.08C263.3 65.58 216.7 33.35 144.3 32.04zM557.4 61.29c-45.11-19.79-88.48-29.61-125.7-29.26c-72.44 1.312-118.1 33.55-120.9 34.92C306.5 69.96 304 74.83 304 80.04v383.1C304 468.4 307.5 480 320 480c3.484 0 6.938-1.125 9.781-3.328c3.925-3.018 97.44-73.16 223.8-14c10.46 4.896 22.45-3.105 22.45-14.65l.0001-357.6C575.1 77.97 568.8 66.31 557.4 61.29z"]
};
var faCircleQuestion = {
  prefix: 'fas',
  iconName: 'circle-question',
  icon: [512, 512, [62108, "question-circle"], "f059", "M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 400c-18 0-32-14-32-32s13.1-32 32-32c17.1 0 32 14 32 32S273.1 400 256 400zM325.1 258L280 286V288c0 13-11 24-24 24S232 301 232 288V272c0-8 4-16 12-21l57-34C308 213 312 206 312 198C312 186 301.1 176 289.1 176h-51.1C225.1 176 216 186 216 198c0 13-11 24-24 24s-24-11-24-24C168 159 199 128 237.1 128h51.1C329 128 360 159 360 198C360 222 347 245 325.1 258z"]
};
var faQuestionCircle = faCircleQuestion;
var faCloud = {
  prefix: 'fas',
  iconName: 'cloud',
  icon: [640, 512, [9729], "f0c2", "M96.2 200.1C96.07 197.4 96 194.7 96 192C96 103.6 167.6 32 256 32C315.3 32 367 64.25 394.7 112.2C409.9 101.1 428.3 96 448 96C501 96 544 138.1 544 192C544 204.2 541.7 215.8 537.6 226.6C596 238.4 640 290.1 640 352C640 422.7 582.7 480 512 480H144C64.47 480 0 415.5 0 336C0 273.2 40.17 219.8 96.2 200.1z"]
};
var faCrosshairs = {
  prefix: 'fas',
  iconName: 'crosshairs',
  icon: [512, 512, [], "f05b", "M224 256C224 238.3 238.3 224 256 224C273.7 224 288 238.3 288 256C288 273.7 273.7 288 256 288C238.3 288 224 273.7 224 256zM256 0C273.7 0 288 14.33 288 32V42.35C381.7 56.27 455.7 130.3 469.6 224H480C497.7 224 512 238.3 512 256C512 273.7 497.7 288 480 288H469.6C455.7 381.7 381.7 455.7 288 469.6V480C288 497.7 273.7 512 256 512C238.3 512 224 497.7 224 480V469.6C130.3 455.7 56.27 381.7 42.35 288H32C14.33 288 0 273.7 0 256C0 238.3 14.33 224 32 224H42.35C56.27 130.3 130.3 56.27 224 42.35V32C224 14.33 238.3 0 256 0V0zM224 404.6V384C224 366.3 238.3 352 256 352C273.7 352 288 366.3 288 384V404.6C346.3 392.1 392.1 346.3 404.6 288H384C366.3 288 352 273.7 352 256C352 238.3 366.3 224 384 224H404.6C392.1 165.7 346.3 119.9 288 107.4V128C288 145.7 273.7 160 256 160C238.3 160 224 145.7 224 128V107.4C165.7 119.9 119.9 165.7 107.4 224H128C145.7 224 160 238.3 160 256C160 273.7 145.7 288 128 288H107.4C119.9 346.3 165.7 392.1 224 404.6z"]
};
var faCube = {
  prefix: 'fas',
  iconName: 'cube',
  icon: [512, 512, [], "f1b2", "M234.5 5.709C248.4 .7377 263.6 .7377 277.5 5.709L469.5 74.28C494.1 83.38 512 107.5 512 134.6V377.4C512 404.5 494.1 428.6 469.5 437.7L277.5 506.3C263.6 511.3 248.4 511.3 234.5 506.3L42.47 437.7C17 428.6 0 404.5 0 377.4V134.6C0 107.5 17 83.38 42.47 74.28L234.5 5.709zM256 65.98L82.34 128L256 190L429.7 128L256 65.98zM288 434.6L448 377.4V189.4L288 246.6V434.6z"]
};
var faDatabase = {
  prefix: 'fas',
  iconName: 'database',
  icon: [448, 512, [], "f1c0", "M448 80V128C448 172.2 347.7 208 224 208C100.3 208 0 172.2 0 128V80C0 35.82 100.3 0 224 0C347.7 0 448 35.82 448 80zM393.2 214.7C413.1 207.3 433.1 197.8 448 186.1V288C448 332.2 347.7 368 224 368C100.3 368 0 332.2 0 288V186.1C14.93 197.8 34.02 207.3 54.85 214.7C99.66 230.7 159.5 240 224 240C288.5 240 348.3 230.7 393.2 214.7V214.7zM54.85 374.7C99.66 390.7 159.5 400 224 400C288.5 400 348.3 390.7 393.2 374.7C413.1 367.3 433.1 357.8 448 346.1V432C448 476.2 347.7 512 224 512C100.3 512 0 476.2 0 432V346.1C14.93 357.8 34.02 367.3 54.85 374.7z"]
};
var faEye = {
  prefix: 'fas',
  iconName: 'eye',
  icon: [576, 512, [128065], "f06e", "M279.6 160.4C282.4 160.1 285.2 160 288 160C341 160 384 202.1 384 256C384 309 341 352 288 352C234.1 352 192 309 192 256C192 253.2 192.1 250.4 192.4 247.6C201.7 252.1 212.5 256 224 256C259.3 256 288 227.3 288 192C288 180.5 284.1 169.7 279.6 160.4zM480.6 112.6C527.4 156 558.7 207.1 573.5 243.7C576.8 251.6 576.8 260.4 573.5 268.3C558.7 304 527.4 355.1 480.6 399.4C433.5 443.2 368.8 480 288 480C207.2 480 142.5 443.2 95.42 399.4C48.62 355.1 17.34 304 2.461 268.3C-.8205 260.4-.8205 251.6 2.461 243.7C17.34 207.1 48.62 156 95.42 112.6C142.5 68.84 207.2 32 288 32C368.8 32 433.5 68.84 480.6 112.6V112.6zM288 112C208.5 112 144 176.5 144 256C144 335.5 208.5 400 288 400C367.5 400 432 335.5 432 256C432 176.5 367.5 112 288 112z"]
};
var faImage = {
  prefix: 'fas',
  iconName: 'image',
  icon: [512, 512, [], "f03e", "M447.1 32h-384C28.64 32-.0091 60.65-.0091 96v320c0 35.35 28.65 64 63.1 64h384c35.35 0 64-28.65 64-64V96C511.1 60.65 483.3 32 447.1 32zM111.1 96c26.51 0 48 21.49 48 48S138.5 192 111.1 192s-48-21.49-48-48S85.48 96 111.1 96zM446.1 407.6C443.3 412.8 437.9 416 432 416H82.01c-6.021 0-11.53-3.379-14.26-8.75c-2.73-5.367-2.215-11.81 1.334-16.68l70-96C142.1 290.4 146.9 288 152 288s9.916 2.441 12.93 6.574l32.46 44.51l93.3-139.1C293.7 194.7 298.7 192 304 192s10.35 2.672 13.31 7.125l128 192C448.6 396 448.9 402.3 446.1 407.6z"]
};
var faServer = {
  prefix: 'fas',
  iconName: 'server',
  icon: [512, 512, [], "f233", "M480 288H32c-17.62 0-32 14.38-32 32v128c0 17.62 14.38 32 32 32h448c17.62 0 32-14.38 32-32v-128C512 302.4 497.6 288 480 288zM352 408c-13.25 0-24-10.75-24-24s10.75-24 24-24s24 10.75 24 24S365.3 408 352 408zM416 408c-13.25 0-24-10.75-24-24s10.75-24 24-24s24 10.75 24 24S429.3 408 416 408zM480 32H32C14.38 32 0 46.38 0 64v128c0 17.62 14.38 32 32 32h448c17.62 0 32-14.38 32-32V64C512 46.38 497.6 32 480 32zM352 152c-13.25 0-24-10.75-24-24S338.8 104 352 104S376 114.8 376 128S365.3 152 352 152zM416 152c-13.25 0-24-10.75-24-24S402.8 104 416 104S440 114.8 440 128S429.3 152 416 152z"]
};

const NodeTypeColors = {
    http_operation: '#6a6acb',
    http_service: '#e056fd',
    article: '#399da6',
    model: '#ef932b',
    http_server: '',
    generic: '',
    unknown: '',
    table_of_contents: '',
    spectral_ruleset: '',
    styleguide: '',
    image: '',
};
const NodeTypePrettyName = {
    http_operation: 'Endpoint',
    http_service: 'API',
    article: 'Article',
    model: 'Model',
    http_server: 'Server',
    generic: '',
    unknown: '',
    table_of_contents: '',
    spectral_ruleset: '',
    styleguide: '',
    image: '',
};
const NodeTypeIconDefs = {
    http_operation: faCrosshairs,
    http_service: faCloud,
    article: faBookOpen,
    model: faCube,
    http_server: faDatabase,
    unknown: faQuestionCircle,
    generic: faQuestionCircle,
    table_of_contents: faQuestionCircle,
    spectral_ruleset: faQuestionCircle,
    styleguide: faQuestionCircle,
    image: faImage,
};
const HttpMethodColors = {
    get: 'success',
    post: 'primary',
    put: 'warning',
    patch: 'warning',
    delete: 'danger',
};
const HttpCodeColor = {
    0: 'red',
    1: 'gray',
    2: 'green',
    3: 'yellow',
    4: 'orange',
    5: 'red',
};
const HttpCodeDescriptions = {
    100: 'Continue',
    101: 'Switching Protocols',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    422: 'Unprocessable Entity',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: '(Unused)',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect (experiemental)',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot (RFC 2324)",
    420: 'Enhance Your Calm (Twitter)',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    444: 'No Response (Nginx)',
    449: 'Retry With (Microsoft)',
    450: 'Blocked by Windows Parental Controls (Microsoft)',
    451: 'Unavailable For Legal Reasons',
    499: 'Client Closed Request (Nginx)',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates (Experimental)',
    507: 'Insufficient Storage (WebDAV)',
    508: 'Loop Detected (WebDAV)',
    509: 'Bandwidth Limit Exceeded (Apache)',
    510: 'Not Extended',
    511: 'Network Authentication Required',
    598: 'Network read timeout error',
    599: 'Network connect timeout error',
};
const badgeDefaultBackgroundColor = '#293742';
const badgeDefaultColor = '#FFFFFF';

const MockingContext = createNamedContext('MockingContext', { mockUrl: undefined, hideMocking: undefined });
const MockingProvider = ({ mockUrl, hideMocking, children }) => {
    const info = {
        mockUrl,
        hideMocking: hideMocking || !mockUrl,
    };
    return React.createElement(MockingContext.Provider, { value: info }, children);
};
function createNamedContext(name, defaultValue) {
    const context = React.createContext(defaultValue);
    context.displayName = name;
    return context;
}

const ALPHANUMERIC = /[^A-Za-z0-9]+$/;
function useChosenServerUrl(chosenServerUrl) {
    const match = ALPHANUMERIC.exec(chosenServerUrl);
    if (match === null) {
        return {
            leading: chosenServerUrl,
            trailing: null,
        };
    }
    return {
        leading: chosenServerUrl.substring(0, match.index),
        trailing: chosenServerUrl.substring(match.index),
    };
}

const chosenServerAtom = atom(undefined);

function isValidServer(server) {
    return server.url !== null && isProperUrl(server.url);
}
const getServersToDisplay = (originalServers, mockUrl) => {
    const servers = originalServers
        .map((server, i) => {
        const fallbackDescription = originalServers.length === 1 ? 'Live Server' : `Server ${i + 1}`;
        return Object.assign(Object.assign({}, server), { url: getServerUrlWithDefaultValues(server), description: server.description || fallbackDescription });
    })
        .filter(isValidServer);
    if (mockUrl) {
        servers.push({
            id: 'mock',
            description: 'Mock Server',
            url: mockUrl,
        });
    }
    return servers;
};
const getServerUrlWithDefaultValues = (server) => {
    var _a;
    let urlString = server.url;
    const variables = Object.entries((_a = server.variables) !== null && _a !== void 0 ? _a : {});
    variables.forEach(([variableName, variableInfo]) => {
        urlString = urlString.replace(`{${variableName}}`, variableInfo.default);
    });
    let url;
    try {
        url = URI(urlString);
    }
    catch (_b) {
        return null;
    }
    if (url.is('relative') && typeof window !== 'undefined') {
        url = url.absoluteTo(window.location.origin);
    }
    const stringifiedUrl = url.toString();
    return stringifiedUrl.endsWith('/') ? stringifiedUrl.slice(0, -1) : stringifiedUrl;
};

const persistAtom = (key, atomInstance) => {
    if (typeof window === 'undefined' || window.localStorage === undefined) {
        return atomInstance;
    }
    return atom(get => {
        var _a;
        const localStorageValue = window.localStorage.getItem(key);
        const atomValue = get(atomInstance);
        if (localStorageValue === null)
            return atomValue;
        return (_a = safeParse(localStorageValue)) !== null && _a !== void 0 ? _a : atomValue;
    }, (_, set, update) => {
        try {
            window.localStorage.setItem(key, JSON.stringify(update));
        }
        catch (error) {
            console.error(error);
        }
        set(atomInstance, update);
    });
};

const convertRequestToSample = (language, library, request) => {
    try {
        const snippet = new HTTPSnippet(request);
        return snippet.convert(language, library) || null;
    }
    catch (err) {
        console.error(err);
        return null;
    }
};

const requestSampleConfigs = {
    Shell: {
        mosaicCodeViewerLanguage: 'bash',
        httpSnippetLanguage: 'shell',
        libraries: {
            cURL: {
                httpSnippetLibrary: 'curl',
            },
            HTTPie: {
                httpSnippetLibrary: 'httpie',
            },
            Wget: {
                httpSnippetLibrary: 'wget',
            },
        },
    },
    JavaScript: {
        mosaicCodeViewerLanguage: 'javascript',
        httpSnippetLanguage: 'javascript',
        libraries: {
            Fetch: {
                httpSnippetLibrary: 'fetch',
            },
            XMLHttpRequest: {
                httpSnippetLibrary: 'xmlhttprequest',
            },
            jQuery: {
                httpSnippetLibrary: 'jquery',
            },
            Axios: {
                httpSnippetLibrary: 'axios',
            },
        },
    },
    Node: {
        mosaicCodeViewerLanguage: 'javascript',
        httpSnippetLanguage: 'node',
        libraries: {
            Native: {
                httpSnippetLibrary: 'native',
            },
            Request: {
                httpSnippetLibrary: 'request',
            },
            Unirest: {
                httpSnippetLibrary: 'unirest',
            },
            Fetch: {
                httpSnippetLibrary: 'fetch',
            },
            Axios: {
                httpSnippetLibrary: 'axios',
            },
        },
    },
    Python: {
        mosaicCodeViewerLanguage: 'python',
        httpSnippetLanguage: 'python',
        libraries: {
            'Python 3': {
                httpSnippetLibrary: 'python3',
            },
            Requests: {
                httpSnippetLibrary: 'requests',
            },
        },
    },
    Go: {
        mosaicCodeViewerLanguage: 'go',
        httpSnippetLanguage: 'go',
    },
    C: {
        mosaicCodeViewerLanguage: 'c',
        httpSnippetLanguage: 'c',
    },
    'Obj-C': {
        mosaicCodeViewerLanguage: 'objectivec',
        httpSnippetLanguage: 'objc',
    },
    OCaml: {
        mosaicCodeViewerLanguage: 'ocaml',
        httpSnippetLanguage: 'ocaml',
    },
    'C#': {
        mosaicCodeViewerLanguage: 'csharp',
        httpSnippetLanguage: 'csharp',
        libraries: {
            HttpClient: {
                httpSnippetLibrary: 'httpclient',
            },
            RestSharp: {
                httpSnippetLibrary: 'restsharp',
            },
        },
    },
    Java: {
        mosaicCodeViewerLanguage: 'java',
        httpSnippetLanguage: 'java',
        libraries: {
            AsyncHttp: {
                httpSnippetLibrary: 'asynchttp',
            },
            NetHttp: {
                httpSnippetLibrary: 'nethttp',
            },
            OkHttp: {
                httpSnippetLibrary: 'okhttp',
            },
            Unirest: {
                httpSnippetLibrary: 'unirest',
            },
        },
    },
    Http: {
        mosaicCodeViewerLanguage: 'http',
        httpSnippetLanguage: 'http',
    },
    Clojure: {
        mosaicCodeViewerLanguage: 'clojure',
        httpSnippetLanguage: 'clojure',
    },
    Kotlin: {
        mosaicCodeViewerLanguage: 'kotlin',
        httpSnippetLanguage: 'kotlin',
    },
    PHP: {
        mosaicCodeViewerLanguage: 'php',
        httpSnippetLanguage: 'php',
        libraries: {
            cURL: {
                httpSnippetLibrary: 'curl',
            },
            guzzle: {
                httpSnippetLibrary: 'guzzle',
            },
        },
    },
    Powershell: {
        mosaicCodeViewerLanguage: 'powershell',
        httpSnippetLanguage: 'powershell',
        libraries: {
            WebRequest: {
                httpSnippetLibrary: 'webrequest',
            },
            RestMethod: {
                httpSnippetLibrary: 'restmethod',
            },
        },
    },
    R: {
        mosaicCodeViewerLanguage: 'r',
        httpSnippetLanguage: 'r',
    },
    Ruby: {
        mosaicCodeViewerLanguage: 'ruby',
        httpSnippetLanguage: 'ruby',
    },
    Swift: {
        mosaicCodeViewerLanguage: 'swift',
        httpSnippetLanguage: 'swift',
    },
};
const getConfigFor = (language, library) => {
    var _a;
    const languageConfig = requestSampleConfigs[language];
    const libraryConfig = ((_a = languageConfig.libraries) === null || _a === void 0 ? void 0 : _a[library]) || {};
    return Object.assign(Object.assign({}, languageConfig), libraryConfig);
};

const selectedLanguageAtom = persistAtom('RequestSamples_selectedLanguage', atom('Shell'));
const selectedLibraryAtom = persistAtom('RequestSamples_selectedLibrary', atom('cURL'));
const fallbackText = 'Unable to generate code example';
const RequestSamples = React__default.memo(({ request, embeddedInMd = false }) => {
    const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
    const [selectedLibrary, setSelectedLibrary] = useAtom(selectedLibraryAtom);
    const { httpSnippetLanguage, httpSnippetLibrary, mosaicCodeViewerLanguage } = getConfigFor(selectedLanguage, selectedLibrary);
    const requestSample = convertRequestToSample(httpSnippetLanguage, httpSnippetLibrary, request);
    const menuItems = useMemo(() => {
        const items = Object.entries(requestSampleConfigs).map(([language, config]) => {
            const hasLibraries = config.libraries && Object.keys(config.libraries).length > 0;
            return {
                id: language,
                title: language,
                isChecked: selectedLanguage === language,
                onPress: hasLibraries
                    ? undefined
                    : () => {
                        setSelectedLanguage(language);
                        setSelectedLibrary('');
                    },
                children: config.libraries
                    ? Object.keys(config.libraries).map(library => ({
                        id: `${language}-${library}`,
                        title: library,
                        isChecked: selectedLanguage === language && selectedLibrary === library,
                        onPress: () => {
                            setSelectedLanguage(language);
                            setSelectedLibrary(library);
                        },
                    }))
                    : undefined,
            };
        });
        return items;
    }, [selectedLanguage, selectedLibrary, setSelectedLanguage, setSelectedLibrary]);
    return (React__default.createElement(Panel, { rounded: embeddedInMd ? undefined : true, isCollapsible: embeddedInMd },
        React__default.createElement(Panel.Titlebar, { rightComponent: React__default.createElement(CopyButton, { size: "sm", copyValue: requestSample || '' }) },
            React__default.createElement(Box, { ml: -2 },
                React__default.createElement(Menu, { "aria-label": "Request Sample Language", closeOnPress: true, items: menuItems, renderTrigger: ({ isOpen }) => (React__default.createElement(Button, { size: "sm", iconRight: "chevron-down", appearance: "minimal", active: isOpen },
                        "Request Sample: ",
                        selectedLanguage,
                        " ",
                        selectedLibrary ? ` / ${selectedLibrary}` : '')) }))),
        React__default.createElement(Panel.Content, { p: 0 },
            React__default.createElement(CodeViewer, { "aria-label": requestSample !== null && requestSample !== void 0 ? requestSample : fallbackText, noCopyButton: true, maxHeight: "400px", language: mosaicCodeViewerLanguage, value: requestSample || fallbackText, style: embeddedInMd
                    ? undefined
                    :
                        {
                            '--fs-code': 12,
                        } }))));
});

function getReadableSecurityName(securityScheme, includeKey = false) {
    let name = '';
    switch (securityScheme.type) {
        case 'apiKey':
            name = 'API Key';
            break;
        case 'http':
            name = `${capitalize(securityScheme.scheme)} Auth`;
            break;
        case 'oauth2':
            name = 'OAuth 2.0';
            break;
        case 'openIdConnect':
            name = 'OpenID Connect';
            break;
        case 'mutualTLS':
            name = 'Mutual TLS';
            break;
    }
    return includeKey ? `${name} (${securityScheme.key})` : name;
}
const isOAuth2ImplicitFlow = (maybeFlow) => isObject(maybeFlow) && 'authorizationUrl' in maybeFlow && !('tokenUrl' in maybeFlow);
const isOauth2AuthorizationCodeFlow = (maybeFlow) => isObject(maybeFlow) && 'authorizationUrl' in maybeFlow && 'tokenUrl' in maybeFlow;
const isOauth2ClientCredentialsOrPasswordFlow = (maybeFlow) => isObject(maybeFlow) && !('authorizationUrl' in maybeFlow) && 'tokenUrl' in maybeFlow;
function shouldIncludeKey(schemes, type) {
    return filter(schemes, { type }).length > 1;
}

const useUniqueId = (prefix = 'id_') => React.useRef(`${prefix}${nanoid(8)}`).current;

const AuthTokenInput = ({ type, name, value, onChange }) => {
    const inputId = useUniqueId(`id_auth_${name}_`);
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { "aria-hidden": "true", htmlFor: inputId }, name),
        React.createElement(Text, { mx: 3 }, ":"),
        React.createElement(Flex, { flex: 1 },
            React.createElement(Input, { id: inputId, "aria-label": name, appearance: "minimal", flex: 1, placeholder: type === 'oauth2' ? 'Bearer 123' : '123', value: value, type: "text", required: true, onChange: e => onChange(e.currentTarget.value) }))));
};

const APIKeyAuth = ({ scheme, onChange, value }) => {
    return (React.createElement(Panel.Content, { className: "ParameterGrid" },
        React.createElement(AuthTokenInput, { type: "apiKey", name: scheme.name, value: value, onChange: onChange })));
};

const BasicAuth = ({ onChange, value }) => {
    const [username = '', password = ''] = decode(value).split(':');
    const onCredentialsChange = (username, password) => {
        onChange(encode(`${username}:${password}`));
    };
    return (React.createElement(Panel.Content, { className: "ParameterGrid" },
        React.createElement("div", null, "Username"),
        React.createElement(Text, { mx: 3 }, ":"),
        React.createElement(Flex, { flex: 1 },
            React.createElement(Input, { style: { paddingLeft: 15 }, "aria-label": "Username", appearance: "minimal", flex: 1, placeholder: "username", value: username, type: "text", required: true, onChange: e => onCredentialsChange(e.currentTarget.value, password) })),
        React.createElement("div", null, "Password"),
        React.createElement(Text, { mx: 3 }, ":"),
        React.createElement(Flex, { flex: 1 },
            React.createElement(Input, { style: { paddingLeft: 15 }, "aria-label": "Password", appearance: "minimal", flex: 1, placeholder: "password", value: password, type: "password", required: true, onChange: e => onCredentialsChange(username, e.currentTarget.value) }))));
};
function encode(value) {
    return btoa(value);
}
function decode(encoded) {
    try {
        return atob(encoded);
    }
    catch (_a) {
        return '';
    }
}

const BearerAuth = ({ value, onChange }) => {
    return (React.createElement(Panel.Content, { className: "ParameterGrid" },
        React.createElement(AuthTokenInput, { type: "http", name: "Token", value: value, onChange: onChange })));
};

const digestPlaceholder = `Digest username="User Name",
            realm="testrealm@host.com",
            nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",
            uri="/dir/index.html",
            qop=auth,
            nc=00000001,
            cnonce="0a4f113b",
            response="6629fae49393a05397450978507c4ef1",
            opaque="5ccc069c403ebaf9f0171e9517f40e41"
`;
const DigestAuth = ({ onChange, value }) => {
    return (React.createElement(Panel.Content, { className: "ParameterGrid" },
        React.createElement("div", null, "Authorization"),
        React.createElement(Text, { mx: 3 }, ":"),
        React.createElement("textarea", { className: "sl-relative sl-z-10 sl-w-full sl-text-base sl-bg-canvas-100 sl-p-1 sl-pr-2.5 sl-pl-2.5 sl-rounded sl-border-transparent hover:sl-border-input focus:sl-border-primary sl-border", "aria-label": "Authorization", placeholder: digestPlaceholder, value: value, onChange: e => onChange(e.currentTarget.value), rows: 9 })));
};

const OAuth2Auth = ({ value, onChange }) => {
    return (React.createElement(Panel.Content, { className: "ParameterGrid" },
        React.createElement(AuthTokenInput, { type: "oauth2", name: "Token", value: value, onChange: onChange })));
};

const TryItAuth = ({ operationSecurityScheme: operationAuth, onChange, value }) => {
    var _a;
    const operationSecurityArray = flatten(operationAuth);
    const filteredSecurityItems = operationSecurityArray.filter(scheme => securitySchemeKeys.includes(scheme === null || scheme === void 0 ? void 0 : scheme.type));
    const securityScheme = value ? value.scheme : filteredSecurityItems[0];
    const menuName = securityScheme ? getReadableSecurityName(securityScheme) : 'Security Scheme';
    const handleChange = (authValue) => {
        onChange(securityScheme && { scheme: securityScheme, authValue: authValue });
    };
    React.useEffect(() => {
        handleChange();
    }, []);
    const menuItems = React.useMemo(() => {
        const items = [
            {
                type: 'group',
                title: 'Security Schemes',
                children: filteredSecurityItems.map(auth => ({
                    id: `security-scheme-${auth.key}`,
                    title: getReadableSecurityName(auth, shouldIncludeKey(filteredSecurityItems, auth.type)),
                    isChecked: auth.key === (securityScheme === null || securityScheme === void 0 ? void 0 : securityScheme.key),
                    onPress: () => {
                        onChange({ scheme: auth, authValue: undefined });
                    },
                })),
            },
        ];
        return items;
    }, [filteredSecurityItems, onChange, securityScheme]);
    if (filteredSecurityItems.length === 0)
        return null;
    return (React.createElement(Panel, { defaultIsOpen: true },
        React.createElement(Panel.Titlebar, { rightComponent: filteredSecurityItems.length > 1 && (React.createElement(Menu, { "aria-label": "security-schemes", items: menuItems, closeOnPress: true, renderTrigger: ({ isOpen }) => (React.createElement(Button, { appearance: "minimal", size: "sm", iconRight: ['fas', 'sort'], active: isOpen }, menuName)) })) }, "Auth"),
        React.createElement(SecuritySchemeComponent, { scheme: value ? value.scheme : filteredSecurityItems[0], onChange: handleChange, value: (_a = (value && value.authValue)) !== null && _a !== void 0 ? _a : '' })));
};
const GenericMessageContainer = ({ scheme }) => {
    return React.createElement(Panel.Content, null,
        "Coming Soon: ",
        getReadableSecurityName(scheme));
};
const SecuritySchemeComponent = (_a) => {
    var { scheme } = _a, rest = __rest(_a, ["scheme"]);
    switch (scheme.type) {
        case 'apiKey':
            return React.createElement(APIKeyAuth, Object.assign({ scheme: scheme }, rest));
        case 'oauth2':
            return React.createElement(OAuth2Auth, Object.assign({ scheme: scheme }, rest));
        case 'http':
            switch (scheme.scheme) {
                case 'basic':
                    return React.createElement(BasicAuth, Object.assign({}, rest));
                case 'digest':
                    return React.createElement(DigestAuth, Object.assign({}, rest));
                case 'bearer':
                    return React.createElement(BearerAuth, Object.assign({ scheme: scheme }, rest));
                default:
                    return React.createElement(GenericMessageContainer, Object.assign({ scheme: scheme }, rest));
            }
        default:
            return React.createElement(GenericMessageContainer, Object.assign({ scheme: scheme }, rest));
    }
};
const securitySchemeKeys = ['apiKey', 'http', 'oauth2', 'openIdConnect'];

const caseInsensitivelyEquals = curry((a, b) => a.toUpperCase() === b.toUpperCase());
function slugify(name) {
    return name
        .replace(/\/|{|}|\s/g, '-')
        .replace(/-{2,}/, '-')
        .replace(/^-/, '')
        .replace(/-$/, '');
}

const isApiKeySecurityScheme = (maybeIApiKey) => isObject(maybeIApiKey) && maybeIApiKey.type === 'apiKey';
const isOAuth2SecurityScheme = (maybeIOAuth2) => isObject(maybeIOAuth2) && maybeIOAuth2.type === 'oauth2';
const isBasicSecurityScheme = (maybeIBasic) => isObject(maybeIBasic) && maybeIBasic.type === 'http' && maybeIBasic.scheme === 'basic';
const isBearerSecurityScheme = (maybeIBearer) => isObject(maybeIBearer) && maybeIBearer.type === 'http' && maybeIBearer.scheme === 'bearer';
const isDigestSecurityScheme = (maybeIBearer) => isObject(maybeIBearer) && maybeIBearer.type === 'http' && maybeIBearer.scheme === 'digest';
function filterOutAuthorizationParams(queryParams, securitySchemes = []) {
    const flattenedSecuritySchemes = flatten(securitySchemes);
    const securitySchemeNames = getSecuritySchemeNames(flattenedSecuritySchemes);
    return queryParams.filter(queryParam => !securitySchemeNames.some(caseInsensitivelyEquals(queryParam.name)));
}
const getSecuritySchemeNames = (securitySchemes) => securitySchemes.flatMap(scheme => {
    if (isApiKeySecurityScheme(scheme)) {
        return scheme.name;
    }
    if (isOAuth2SecurityScheme(scheme)) {
        return 'Authorization';
    }
    return [];
});
const securitySchemeValuesAtom = persistAtom('TryIt_securitySchemeValues', atom({}));
const usePersistedSecuritySchemeWithValues = () => {
    const [currentScheme, setCurrentScheme] = React__default.useState();
    const [securitySchemeValues, setSecuritySchemeValues] = useAtom(securitySchemeValuesAtom);
    const setPersistedAuthenticationSettings = (securitySchemeWithValues) => {
        setCurrentScheme(securitySchemeWithValues);
        if (securitySchemeWithValues) {
            const key = securitySchemeWithValues.scheme.key;
            const value = securitySchemeWithValues.authValue;
            if (value !== undefined) {
                setSecuritySchemeValues(Object.assign(Object.assign({}, securitySchemeValues), { [key]: value }));
            }
        }
    };
    const persistedSecuritySchemeValue = currentScheme && securitySchemeValues[currentScheme.scheme.key];
    const schemeWithPersistedValue = React__default.useMemo(() => {
        if (!currentScheme)
            return undefined;
        if (currentScheme.authValue)
            return currentScheme;
        return Object.assign(Object.assign({}, currentScheme), { authValue: persistedSecuritySchemeValue });
    }, [currentScheme, persistedSecuritySchemeValue]);
    return [schemeWithPersistedValue, setPersistedAuthenticationSettings];
};

const FileUploadParameterEditor = ({ parameter, value, onChange }) => {
    var _a;
    const parameterDisplayName = `${parameter.name}${parameter.required ? '*' : ''}`;
    const handleFileChange = (event) => {
        var _a;
        const file = (_a = event.currentTarget.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file === undefined)
            return;
        onChange(file);
    };
    const clearFile = () => {
        onChange(undefined);
    };
    const parameterInputId = useUniqueId(`id_${parameter.name}_`);
    const fileUploadInputId = `${parameterInputId}-file-input`;
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { "aria-hidden": "true", "data-testid": "param-label", htmlFor: parameterInputId }, parameterDisplayName),
        React.createElement(Text, { mx: 3 }, ":"),
        React.createElement(Flex, { flex: 1, alignItems: "center" },
            React.createElement(Input, { id: parameterInputId, style: { paddingLeft: 15 }, "aria-label": parameter.name, appearance: "minimal", flex: 1, placeholder: "pick a file", type: "text", required: true, value: (_a = value === null || value === void 0 ? void 0 : value.name) !== null && _a !== void 0 ? _a : '', disabled: true }),
            value && (React.createElement("button", { className: "sl-mr-3 sl-p-2", "aria-label": "Remove file", onClick: clearFile },
                React.createElement(Icon, { icon: "times" }))),
            React.createElement("div", null,
                React.createElement("label", { role: "button", htmlFor: fileUploadInputId }, "Upload"),
                React.createElement("input", { onChange: handleFileChange, type: "file", hidden: true, id: fileUploadInputId })))));
};

const booleanOptions = [
    { label: 'Not Set', value: '' },
    { label: 'False', value: 'false' },
    { label: 'True', value: 'true' },
];
function enumOptions(enumValues, required) {
    const options = map(enumValues, v => ({ value: typeof v === 'number' ? v : String(v) }));
    return required ? options : [{ label: 'Not Set', value: '' }, ...options];
}
function parameterOptions(parameter) {
    var _a, _b;
    return ((_a = parameter.schema) === null || _a === void 0 ? void 0 : _a.type) === 'boolean'
        ? booleanOptions
        : ((_b = parameter.schema) === null || _b === void 0 ? void 0 : _b.enum) !== undefined
            ? enumOptions(parameter.schema.enum, parameter.required)
            : null;
}
const selectExampleOption = { value: '', label: 'Pick an example' };
function exampleOptions(parameter) {
    var _a;
    return ((_a = parameter.examples) === null || _a === void 0 ? void 0 : _a.length) && parameter.examples.length > 1
        ? [
            selectExampleOption,
            ...parameter.examples.map(example => ({ label: example.key, value: exampleValue(example) })),
        ]
        : null;
}
function parameterSupportsFileUpload(parameter) {
    var _a, _b, _c;
    return (((_a = parameter.schema) === null || _a === void 0 ? void 0 : _a.type) === 'string' &&
        (((_b = parameter.schema) === null || _b === void 0 ? void 0 : _b.contentEncoding) === 'base64' ||
            ((_c = parameter.schema) === null || _c === void 0 ? void 0 : _c.contentMediaType) === 'application/octet-stream'));
}
function stringifyValue(value) {
    return typeof value === 'object' ? JSON.stringify(value) : escapeQuotes(String(value));
}
function exampleValue(example) {
    const value = 'value' in example ? example.value : example.externalValue;
    return stringifyValue(value);
}
function escapeQuotes(value) {
    return value.replace(/"/g, '\\"');
}
function getPlaceholderForParameter(parameter) {
    var _a, _b;
    const { value: parameterValue, isDefault } = getValueForParameter(parameter);
    if (parameterValue)
        return `${isDefault ? 'defaults to' : 'example'}: ${parameterValue}`;
    return String((_b = (_a = parameter.schema) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : '');
}
function retrieveDefaultFromSchema(parameter) {
    var _a;
    const defaultValue = (_a = parameter.schema) === null || _a === void 0 ? void 0 : _a.default;
    return isObject(defaultValue) ? safeStringify(defaultValue) : defaultValue;
}
const getValueForParameter = (parameter) => {
    var _a, _b, _c;
    const defaultValue = retrieveDefaultFromSchema(parameter);
    if (typeof defaultValue !== 'undefined') {
        return { value: stringifyValue(defaultValue), isDefault: true };
    }
    const examples = (_a = parameter.examples) !== null && _a !== void 0 ? _a : [];
    if (examples.length > 0) {
        return { value: exampleValue(examples[0]) };
    }
    const enums = (_c = (_b = parameter.schema) === null || _b === void 0 ? void 0 : _b.enum) !== null && _c !== void 0 ? _c : [];
    if (enums.length > 0) {
        return { value: stringifyValue(enums[0]) };
    }
    return { value: '' };
};
const getInitialValueForParameter = (parameter) => {
    const isRequired = !!parameter.required;
    if (!isRequired)
        return '';
    return getValueForParameter(parameter).value;
};
const initialParameterValues = params => {
    const paramsByName = keyBy(params, (param) => param.name);
    return mapValues(paramsByName, param => getInitialValueForParameter(param));
};
function mapSchemaPropertiesToParameters(properties, required) {
    return Object.entries(properties).map(([name, schema]) => (Object.assign({ name, schema: typeof schema !== 'boolean' ? schema : undefined, examples: typeof schema !== 'boolean' && schema.examples ? [{ key: 'example', value: schema.examples }] : undefined }, ((required === null || required === void 0 ? void 0 : required.includes(name)) && { required: true }))));
}

const ParameterEditor = ({ parameter, value, onChange, isOptional, onChangeOptional, canChangeOptional, validate, }) => {
    var _a, _b;
    const inputId = useUniqueId(`id_${parameter.name}_`);
    const inputCheckId = useUniqueId(`id_${parameter.name}_checked`);
    const parameterValueOptions = parameterOptions(parameter);
    const examples = exampleOptions(parameter);
    const selectedExample = (_a = examples === null || examples === void 0 ? void 0 : examples.find(e => e.value === value)) !== null && _a !== void 0 ? _a : selectExampleOption;
    const parameterDisplayName = `${parameter.name}${parameter.required ? '*' : ''}`;
    const requiredButEmpty = validate && parameter.required && !value;
    return (React.createElement(React.Fragment, null,
        React.createElement(Text, { as: "label", "aria-hidden": "true", "data-testid": "param-label", htmlFor: inputId, fontSize: "base" }, parameterDisplayName),
        React.createElement(Text, { mx: 3 }, ":"),
        React.createElement("div", null, parameterValueOptions ? (React.createElement(Select, { flex: 1, "aria-label": parameter.name, options: parameterValueOptions, value: value || '', onChange: onChange })) : (React.createElement(Flex, { flex: 1 },
            React.createElement(Input, { id: inputId, "aria-label": parameter.name, appearance: requiredButEmpty ? 'default' : 'minimal', flex: 1, placeholder: getPlaceholderForParameter(parameter), type: ((_b = parameter.schema) === null || _b === void 0 ? void 0 : _b.type) === 'number' ? 'number' : 'text', required: true, intent: requiredButEmpty ? 'danger' : 'default', value: value || '', onChange: e => onChange && onChange(e.currentTarget.value) }),
            examples && (React.createElement(Select, { "aria-label": `${parameter.name}-select`, flex: 1, value: selectedExample.value, options: examples, onChange: onChange }))))),
        canChangeOptional && !parameter.required && (React.createElement(React.Fragment, null,
            React.createElement("div", null),
            React.createElement("div", null),
            React.createElement("div", null,
                React.createElement(Flex, { flex: 1 },
                    React.createElement(Input, { className: "Checkbox", "aria-label": `${parameter.name}-checkbox`, id: inputCheckId, flex: 1, type: "checkbox", intent: "success", size: "sm", checked: isOptional, onChange: e => onChangeOptional(!e.target.checked) }),
                    React.createElement(Text, { className: "TextForCheckBox", flex: 1, as: "label", "aria-hidden": "true", "data-testid": "param-check", htmlFor: inputCheckId, fontSize: "base" },
                        "Omit ",
                        parameterDisplayName)))))));
};

const FormDataBody = ({ specification, values, onChangeValues, onChangeParameterAllow, isAllowedEmptyValues, }) => {
    const schema = specification.schema;
    const parameters = schema === null || schema === void 0 ? void 0 : schema.properties;
    const required = schema === null || schema === void 0 ? void 0 : schema.required;
    React.useEffect(() => {
        if (parameters === undefined) {
            console.warn(`Invalid schema in form data spec: ${safeStringify(schema)}`);
        }
    }, [parameters, schema]);
    if (parameters === undefined) {
        return null;
    }
    return (React.createElement(Panel, { defaultIsOpen: true },
        React.createElement(Panel.Titlebar, null, "Body"),
        React.createElement(Panel.Content, { className: "sl-overflow-y-auto ParameterGrid OperationParametersContent" }, mapSchemaPropertiesToParameters(parameters, required).map(parameter => {
            var _a;
            const supportsFileUpload = parameterSupportsFileUpload(parameter);
            const value = values[parameter.name];
            if (supportsFileUpload) {
                return (React.createElement(FileUploadParameterEditor, { key: parameter.name, parameter: parameter, value: value instanceof File ? value : undefined, onChange: newValue => newValue
                        ? onChangeValues(Object.assign(Object.assign({}, values), { [parameter.name]: newValue }))
                        : onChangeValues(omit(values, parameter.name)) }));
            }
            return (React.createElement(ParameterEditor, { key: parameter.name, parameter: parameter, value: typeof value === 'string' ? value : undefined, onChange: (value) => onChangeValues(Object.assign(Object.assign({}, values), { [parameter.name]: typeof value === 'number' ? String(value) : value })), onChangeOptional: value => onChangeParameterAllow(Object.assign(Object.assign({}, isAllowedEmptyValues), { [parameter.name]: value })), canChangeOptional: true, isOptional: (_a = isAllowedEmptyValues[parameter.name]) !== null && _a !== void 0 ? _a : false }));
        }))));
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result;
        const base64String = result.replace(/data:.*\/.*;base64,/g, '');
        resolve(base64String);
    };
    reader.onerror = () => reject(reader.error);
});

const isFormDataContent = (content) => isUrlEncodedContent(content) || isMultipartContent(content);
function isUrlEncodedContent(content) {
    return content.mediaType.toLowerCase() === 'application/x-www-form-urlencoded';
}
function isMultipartContent(content) {
    return content.mediaType.toLowerCase() === 'multipart/form-data';
}
function createRequestBody(mediaTypeContent, bodyParameterValues) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!mediaTypeContent)
            return undefined;
        const creator = (_a = (yield requestBodyCreators[mediaTypeContent.mediaType.toLowerCase()])) !== null && _a !== void 0 ? _a : createRawRequestBody;
        return creator({ mediaTypeContent, bodyParameterValues, rawBodyValue: '' });
    });
}
const createUrlEncodedRequestBody = ({ bodyParameterValues = {} }) => __awaiter(void 0, void 0, void 0, function* () {
    const filteredValues = pickBy(bodyParameterValues, isString);
    return new URLSearchParams(filteredValues);
});
const createMultipartRequestBody = ({ mediaTypeContent, bodyParameterValues = {} }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const formData = new FormData();
    for (const [key, value] of Object.entries(bodyParameterValues)) {
        const schema = (_b = (_a = mediaTypeContent.schema) === null || _a === void 0 ? void 0 : _a.properties) === null || _b === void 0 ? void 0 : _b[key];
        if (typeof schema !== 'object')
            continue;
        if (parameterSupportsFileUpload({ schema }) && schema.contentEncoding === 'base64' && value instanceof File) {
            try {
                formData.append(key, yield fileToBase64(value));
            }
            catch (_c) {
                continue;
            }
        }
        else {
            formData.append(key, value);
        }
    }
    return formData;
});
const createRawRequestBody = ({ rawBodyValue = '' }) => __awaiter(void 0, void 0, void 0, function* () { return rawBodyValue; });
const requestBodyCreators = {
    'application/x-www-form-urlencoded': createUrlEncodedRequestBody,
    'multipart/form-data': createMultipartRequestBody,
};
const useBodyParameterState = (mediaTypeContent) => {
    const isFormDataBody = mediaTypeContent && isFormDataContent(mediaTypeContent);
    const initialState = React.useMemo(() => {
        var _a, _b, _c;
        if (!isFormDataBody) {
            return {};
        }
        const properties = (_b = (_a = mediaTypeContent === null || mediaTypeContent === void 0 ? void 0 : mediaTypeContent.schema) === null || _a === void 0 ? void 0 : _a.properties) !== null && _b !== void 0 ? _b : {};
        const required = (_c = mediaTypeContent === null || mediaTypeContent === void 0 ? void 0 : mediaTypeContent.schema) === null || _c === void 0 ? void 0 : _c.required;
        const parameters = mapSchemaPropertiesToParameters(properties, required);
        return initialParameterValues(parameters);
    }, [isFormDataBody, mediaTypeContent]);
    const [bodyParameterValues, setBodyParameterValues] = React.useState(initialState);
    const [isAllowedEmptyValue, setAllowedEmptyValue] = React.useState({});
    React.useEffect(() => {
        setBodyParameterValues(initialState);
    }, [initialState]);
    if (isFormDataBody) {
        return [
            bodyParameterValues,
            setBodyParameterValues,
            isAllowedEmptyValue,
            setAllowedEmptyValue,
            { isFormDataBody: true, bodySpecification: mediaTypeContent },
        ];
    }
    else {
        return [
            bodyParameterValues,
            setBodyParameterValues,
            isAllowedEmptyValue,
            setAllowedEmptyValue,
            { isFormDataBody: false, bodySpecification: undefined },
        ];
    }
};

const RequestBody = ({ examples, requestBody, onChange }) => {
    return (React.createElement(Panel, { defaultIsOpen: true },
        React.createElement(Panel.Titlebar, { rightComponent: examples.length > 1 && React.createElement(ExampleMenu, { examples: examples, requestBody: requestBody, onChange: onChange }) }, "Body"),
        React.createElement(Panel.Content, { className: "TextRequestBody" },
            React.createElement(CodeEditor, { onChange: onChange, language: "json", value: requestBody, showLineNumbers: true, padding: 0, style: {
                    fontSize: 12,
                } }))));
};
function ExampleMenu({ examples, requestBody, onChange }) {
    const handleClick = React.useCallback((example) => {
        var _a;
        onChange((_a = safeStringify('value' in example ? example.value : example.externalValue, undefined, 2)) !== null && _a !== void 0 ? _a : requestBody);
    }, [onChange, requestBody]);
    const menuItems = React.useMemo(() => {
        const items = examples.map(example => ({
            id: `request-example-${example.key}`,
            title: example.key,
            onPress: () => handleClick(example),
        }));
        return items;
    }, [examples, handleClick]);
    return (React.createElement(Menu, { "aria-label": "Examples", items: menuItems, renderTrigger: ({ isOpen }) => (React.createElement(Button, { appearance: "minimal", size: "sm", iconRight: ['fas', 'sort'], active: isOpen }, "Examples")) }));
}

const useGenerateExampleFromMediaTypeContent = (mediaTypeContent, chosenExampleIndex, { skipReadOnly, skipWriteOnly, skipNonRequired, ticks } = {}) => {
    const document = useDocument();
    return React__default.useMemo(() => generateExampleFromMediaTypeContent(mediaTypeContent, document, chosenExampleIndex, {
        skipNonRequired,
        skipWriteOnly,
        skipReadOnly,
        ticks: ticks || 6000,
    }), [mediaTypeContent, document, chosenExampleIndex, skipNonRequired, skipWriteOnly, skipReadOnly, ticks]);
};
const generateExampleFromMediaTypeContent = (mediaTypeContent, document, chosenExampleIndex = 0, options) => {
    var _a, _b;
    const textRequestBodySchema = mediaTypeContent === null || mediaTypeContent === void 0 ? void 0 : mediaTypeContent.schema;
    const textRequestBodyExamples = mediaTypeContent === null || mediaTypeContent === void 0 ? void 0 : mediaTypeContent.examples;
    try {
        if (textRequestBodyExamples === null || textRequestBodyExamples === void 0 ? void 0 : textRequestBodyExamples.length) {
            return (_a = safeStringify(textRequestBodyExamples === null || textRequestBodyExamples === void 0 ? void 0 : textRequestBodyExamples[chosenExampleIndex]['value'], undefined, 2)) !== null && _a !== void 0 ? _a : '';
        }
        else if (textRequestBodySchema) {
            const generated = Sampler.sample(textRequestBodySchema, options, document);
            return generated !== null ? (_b = safeStringify(generated, undefined, 2)) !== null && _b !== void 0 ? _b : '' : '';
        }
    }
    catch (e) {
        console.warn(e);
        return `Example cannot be created for this schema\n${e}`;
    }
    return '';
};
const generateExamplesFromJsonSchema = (schema) => {
    var _a, _b;
    const examples = [];
    if (Array.isArray(schema === null || schema === void 0 ? void 0 : schema.examples)) {
        schema.examples.forEach((example, index) => {
            var _a;
            examples.push({
                data: (_a = safeStringify(example, undefined, 2)) !== null && _a !== void 0 ? _a : '',
                label: index === 0 ? 'default' : `example-${index}`,
            });
        });
    }
    else if (isPlainObject$1(schema === null || schema === void 0 ? void 0 : schema['x-examples'])) {
        for (const [label, example] of Object.entries(schema['x-examples'])) {
            if (isPlainObject$1(example)) {
                const val = example.hasOwnProperty('value') && Object.keys(example).length === 1 ? example.value : example;
                examples.push({
                    label,
                    data: (_a = safeStringify(val, undefined, 2)) !== null && _a !== void 0 ? _a : '',
                });
            }
        }
    }
    if (examples.length) {
        return examples;
    }
    try {
        const generated = Sampler.sample(schema, {
            maxSampleDepth: 4,
            ticks: 6000,
        });
        return generated !== null
            ? [
                {
                    label: 'default',
                    data: (_b = safeStringify(generated, undefined, 2)) !== null && _b !== void 0 ? _b : '',
                },
            ]
            : [{ label: 'default', data: '' }];
    }
    catch (e) {
        return [{ label: '', data: `Example cannot be created for this schema\n${e}` }];
    }
};
const exceedsSize = (example, size = 500) => {
    return example.split(/\r\n|\r|\n/).length > size;
};

const useTextRequestBodyState = (mediaTypeContent) => {
    const initialRequestBody = useGenerateExampleFromMediaTypeContent(mediaTypeContent, undefined, {
        skipReadOnly: true,
    });
    const [textRequestBody, setTextRequestBody] = React.useState(initialRequestBody);
    React.useEffect(() => {
        setTextRequestBody(initialRequestBody);
    }, [initialRequestBody]);
    return [textRequestBody, setTextRequestBody];
};

const nameAndValueObjectToPair = ({ name, value }) => [name, value];
const getServerUrl = ({ chosenServer, httpOperation, mockData, corsProxy, }) => {
    var _a;
    const server = chosenServer || ((_a = httpOperation.servers) === null || _a === void 0 ? void 0 : _a[0]);
    const chosenServerUrl = server && getServerUrlWithDefaultValues(server);
    const serverUrl = (mockData === null || mockData === void 0 ? void 0 : mockData.url) || chosenServerUrl || window.location.origin;
    if (corsProxy && !mockData) {
        return `${corsProxy}${serverUrl}`;
    }
    return serverUrl;
};
const delimiter = {
    [HttpParamStyles.Form]: ',',
    [HttpParamStyles.SpaceDelimited]: ' ',
    [HttpParamStyles.PipeDelimited]: '|',
};
const getQueryParams = ({ httpOperation, parameterValues, }) => {
    var _a;
    const query = (_a = httpOperation.request) === null || _a === void 0 ? void 0 : _a.query;
    if (!query)
        return [];
    return query.reduce((acc, param) => {
        var _a, _b, _c, _d, _e;
        const value = (_a = parameterValues[param.name]) !== null && _a !== void 0 ? _a : '';
        if (value.length === 0)
            return acc;
        const explode = (_b = param.explode) !== null && _b !== void 0 ? _b : true;
        if (((_c = param.schema) === null || _c === void 0 ? void 0 : _c.type) === 'object' && param.style === 'form' && value) {
            let nested;
            try {
                nested = JSON.parse(value);
                if (!(typeof nested === 'object' && nested !== null))
                    throw Error();
            }
            catch (e) {
                throw new Error(`Cannot use param value "${value}". JSON object expected.`);
            }
            if (explode) {
                acc.push(...Object.entries(nested).map(([name, value]) => ({ name, value: value.toString() })));
            }
            else {
                acc.push({
                    name: param.name,
                    value: Object.entries(nested)
                        .map(entry => entry.join(','))
                        .join(','),
                });
            }
        }
        else if (((_d = param.schema) === null || _d === void 0 ? void 0 : _d.type) === 'array' && value) {
            let nested;
            try {
                const parsed = JSON.parse(value);
                if (typeof parsed === 'string') {
                    nested = parsed.split(delimiter[param.style]);
                }
                else if (Array.isArray(parsed)) {
                    nested = parsed;
                }
                else {
                    throw Error();
                }
            }
            catch (e) {
                throw new Error(`Cannot use param value "${value}". JSON array expected.`);
            }
            if (explode) {
                acc.push(...nested.map(value => ({ name: param.name, value: value.toString() })));
            }
            else {
                acc.push({
                    name: param.name,
                    value: nested.join((_e = delimiter[param.style]) !== null && _e !== void 0 ? _e : delimiter[HttpParamStyles.Form]),
                });
            }
        }
        else {
            acc.push({ name: param.name, value });
        }
        return acc;
    }, []);
};
function buildFetchRequest({ httpOperation, mediaTypeContent, bodyInput, parameterValues, mockData, auth, chosenServer, credentials = 'omit', corsProxy, }) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const serverUrl = getServerUrl({ httpOperation, mockData, chosenServer, corsProxy });
        const shouldIncludeBody = ['PUT', 'POST', 'PATCH'].includes(httpOperation.method.toUpperCase());
        const queryParams = getQueryParams({ httpOperation, parameterValues });
        const rawHeaders = filterOutAuthorizationParams((_b = (_a = httpOperation.request) === null || _a === void 0 ? void 0 : _a.headers) !== null && _b !== void 0 ? _b : [], httpOperation.security)
            .map(header => { var _a; return ({ name: header.name, value: (_a = parameterValues[header.name]) !== null && _a !== void 0 ? _a : '' }); })
            .filter(({ value }) => value.length > 0);
        const [queryParamsWithAuth, headersWithAuth] = runAuthRequestEhancements(auth, queryParams, rawHeaders);
        const expandedPath = uriExpand(httpOperation.path, parameterValues);
        const urlObject = new URL(serverUrl + expandedPath);
        urlObject.search = new URLSearchParams(queryParamsWithAuth.map(nameAndValueObjectToPair)).toString();
        const body = typeof bodyInput === 'object' ? yield createRequestBody(mediaTypeContent, bodyInput) : bodyInput;
        const headers = Object.assign(Object.assign(Object.assign({}, ((mediaTypeContent === null || mediaTypeContent === void 0 ? void 0 : mediaTypeContent.mediaType) !== 'multipart/form-data' && {
            'Content-Type': (_c = mediaTypeContent === null || mediaTypeContent === void 0 ? void 0 : mediaTypeContent.mediaType) !== null && _c !== void 0 ? _c : 'application/json',
        })), Object.fromEntries(headersWithAuth.map(nameAndValueObjectToPair))), mockData === null || mockData === void 0 ? void 0 : mockData.header);
        return [
            urlObject.href,
            {
                credentials,
                method: httpOperation.method.toUpperCase(),
                headers,
                body: shouldIncludeBody ? body : undefined,
            },
        ];
    });
}
const runAuthRequestEhancements = (auth, queryParams, headers) => {
    var _a, _b, _c, _d, _e;
    if (!auth)
        return [queryParams, headers];
    const newQueryParams = [...queryParams];
    const newHeaders = [...headers];
    if (isApiKeySecurityScheme(auth.scheme)) {
        if (auth.scheme.in === 'query') {
            newQueryParams.push({
                name: auth.scheme.name,
                value: (_a = auth.authValue) !== null && _a !== void 0 ? _a : '',
            });
        }
        if (auth.scheme.in === 'header') {
            newHeaders.push({
                name: auth.scheme.name,
                value: (_b = auth.authValue) !== null && _b !== void 0 ? _b : '',
            });
        }
    }
    if (isOAuth2SecurityScheme(auth.scheme)) {
        newHeaders.push({
            name: 'Authorization',
            value: (_c = auth.authValue) !== null && _c !== void 0 ? _c : '',
        });
    }
    if (isBearerSecurityScheme(auth.scheme)) {
        newHeaders.push({
            name: 'Authorization',
            value: `Bearer ${auth.authValue}`,
        });
    }
    if (isDigestSecurityScheme(auth.scheme)) {
        newHeaders.push({
            name: 'Authorization',
            value: (_e = (_d = auth.authValue) === null || _d === void 0 ? void 0 : _d.replace(/\s\s+/g, ' ').trim()) !== null && _e !== void 0 ? _e : '',
        });
    }
    if (isBasicSecurityScheme(auth.scheme)) {
        newHeaders.push({
            name: 'Authorization',
            value: `Basic ${auth.authValue}`,
        });
    }
    return [newQueryParams, newHeaders];
};
function buildHarRequest({ httpOperation, bodyInput, parameterValues, mediaTypeContent, auth, mockData, chosenServer, corsProxy, }) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const serverUrl = getServerUrl({ httpOperation, mockData, chosenServer, corsProxy });
        const mimeType = (_a = mediaTypeContent === null || mediaTypeContent === void 0 ? void 0 : mediaTypeContent.mediaType) !== null && _a !== void 0 ? _a : 'application/json';
        const shouldIncludeBody = ['PUT', 'POST', 'PATCH'].includes(httpOperation.method.toUpperCase());
        const queryParams = getQueryParams({ httpOperation, parameterValues });
        const headerParams = (_d = (_c = (_b = httpOperation.request) === null || _b === void 0 ? void 0 : _b.headers) === null || _c === void 0 ? void 0 : _c.map(header => { var _a; return ({ name: header.name, value: (_a = parameterValues[header.name]) !== null && _a !== void 0 ? _a : '' }); })) !== null && _d !== void 0 ? _d : [];
        if (mockData === null || mockData === void 0 ? void 0 : mockData.header) {
            headerParams.push({ name: 'Prefer', value: mockData.header.Prefer });
        }
        const [queryParamsWithAuth, headerParamsWithAuth] = runAuthRequestEhancements(auth, queryParams, headerParams);
        const expandedPath = uriExpand(httpOperation.path, parameterValues);
        const urlObject = new URL(serverUrl + expandedPath);
        let postData = undefined;
        if (shouldIncludeBody && typeof bodyInput === 'string') {
            postData = { mimeType, text: bodyInput };
        }
        if (shouldIncludeBody && typeof bodyInput === 'object') {
            postData = {
                mimeType,
                params: Object.entries(bodyInput).map(([name, value]) => {
                    if (value instanceof File) {
                        return {
                            name,
                            fileName: value.name,
                            contentType: value.type,
                        };
                    }
                    return {
                        name,
                        value,
                    };
                }),
            };
        }
        return {
            method: httpOperation.method.toUpperCase(),
            url: urlObject.href,
            httpVersion: 'HTTP/1.1',
            cookies: [],
            headers: [{ name: 'Content-Type', value: mimeType }, ...headerParamsWithAuth],
            queryString: queryParamsWithAuth,
            postData: postData,
            headersSize: -1,
            bodySize: -1,
        };
    });
}
function uriExpand(uri, data) {
    if (!data) {
        return uri;
    }
    return uri.replace(/{([^#?]+?)}/g, (match, value) => {
        return data[value] || value;
    });
}

const formatMultiValueHeader = (...keyValuePairs) => {
    return keyValuePairs
        .map(item => {
        if (typeof item === 'string')
            return item;
        const [key, rawValue] = item;
        if (!rawValue)
            return key;
        const needsQuotes = rawValue.indexOf(',') > -1;
        const value = needsQuotes ? `"${rawValue}"` : rawValue;
        return `${key}=${value}`;
    })
        .join(', ');
};

function getMockData(url, httpOperation, { code, dynamic, example }) {
    return url ? { url, header: buildPreferHeader({ code, dynamic, example }, httpOperation) } : undefined;
}
function buildPreferHeader({ code, example, dynamic }, httpOperation) {
    if (!code) {
        return undefined;
    }
    const isCodeSupported = supportsResponseCode(httpOperation, code);
    const isExampleSupported = isCodeSupported && supportsExample(httpOperation, code, example);
    const args = compact([
        code && isCodeSupported ? ['code', code] : undefined,
        dynamic ? ['dynamic', String(dynamic)] : undefined,
        example && isExampleSupported ? ['example', example] : undefined,
    ]);
    const headerValue = formatMultiValueHeader(...args);
    return {
        Prefer: headerValue,
    };
}
function supportsResponseCode(httpOperation, code) {
    var _a;
    return ((_a = httpOperation.responses) === null || _a === void 0 ? void 0 : _a.find(response => response.code === code)) !== undefined;
}
function supportsExample(httpOperation, code, exampleKey) {
    var _a, _b;
    if (!exampleKey)
        return false;
    const response = (_a = httpOperation.responses) === null || _a === void 0 ? void 0 : _a.find(response => response.code === code);
    if (!response)
        return false;
    const exampleKeys = uniq((_b = response.contents) === null || _b === void 0 ? void 0 : _b.flatMap(c => c.examples || []).map(example => example.key));
    return exampleKeys.includes(exampleKey);
}

const MockingButton = ({ operation, options: { code, example, dynamic }, onOptionsChange, }) => {
    const operationResponses = operation.responses;
    const setMockingOptions = React.useCallback(({ code, example, dynamic }) => {
        onOptionsChange({ code, example, dynamic });
    }, [onOptionsChange]);
    const menuItems = React.useMemo(() => {
        var _a;
        const items = (_a = operationResponses === null || operationResponses === void 0 ? void 0 : operationResponses.filter(operationResponse => Number.isInteger(parseFloat(operationResponse.code)))) === null || _a === void 0 ? void 0 : _a.map(generateOperationResponseMenu);
        function generateOperationResponseMenu(operationResponse) {
            var _a;
            const menuId = `response-${operationResponse.code}`;
            const isActive = operationResponse.code === code;
            const exampleKeys = uniq((_a = operationResponse.contents) === null || _a === void 0 ? void 0 : _a.flatMap(c => c.examples || []).map(example => example.key));
            const exampleChildren = exampleKeys === null || exampleKeys === void 0 ? void 0 : exampleKeys.map(exampleKey => ({
                id: `${menuId}-example-${exampleKey}`,
                title: exampleKey,
                isChecked: isActive && exampleKey === example,
                onPress: () => {
                    setMockingOptions({ code: operationResponse.code, example: exampleKey });
                },
            }));
            const generationModeItems = [
                {
                    id: `${menuId}-gen-static`,
                    title: 'Statically Generated',
                    isChecked: isActive && dynamic === false,
                    onPress: () => {
                        setMockingOptions({ code: operationResponse.code, dynamic: false });
                    },
                },
                {
                    id: `${menuId}-gen-dynamic`,
                    title: 'Dynamically Generated',
                    isChecked: isActive && dynamic === true,
                    onPress: () => {
                        setMockingOptions({ code: operationResponse.code, dynamic: true });
                    },
                },
            ];
            const menuItem = {
                id: menuId,
                isChecked: isActive,
                title: operationResponse.code,
                onPress: () => {
                    setMockingOptions({ code: operationResponse.code, dynamic: false });
                },
                children: [
                    { type: 'group', children: generationModeItems },
                    { type: 'group', title: 'Examples', children: exampleChildren },
                ],
            };
            return menuItem;
        }
        return items;
    }, [code, dynamic, example, operationResponses, setMockingOptions]);
    return (React.createElement(Box, null,
        React.createElement(Menu, { "aria-label": "Mock settings", items: menuItems, renderTrigger: ({ isOpen }) => (React.createElement(FieldButton, { active: isOpen, size: "sm" }, "Mock Settings")) })));
};

const mockingOptionsAtom = atom({});
const useMockingOptions = () => useAtom(mockingOptionsAtom);

const OperationParameters = ({ parameters, values, onChangeValue, validate, }) => {
    return (React.createElement(Panel, { defaultIsOpen: true },
        React.createElement(Panel.Titlebar, null, "Parameters"),
        React.createElement(Panel.Content, { className: "sl-overflow-y-auto ParameterGrid OperationParametersContent" }, parameters.map(parameter => (React.createElement(ParameterEditor, { key: parameter.name, parameter: parameter, value: values[parameter.name], onChange: (value) => onChangeValue(parameter.name, String(value)), validate: validate, isOptional: false, canChangeOptional: false, onChangeOptional: () => { } }))))));
};

const persistedParameterValuesAtom = atom({});
const useRequestParameters = (httpOperation) => {
    const [persistedParameterValues, setPersistedParameterValues] = useAtom(persistedParameterValuesAtom);
    const allParameters = React.useMemo(() => extractAllParameters(httpOperation), [httpOperation]);
    const parameterDefaultValues = React.useMemo(() => initialParameterValues(allParameters), [allParameters]);
    const updateParameterValue = (name, value) => {
        const defaultValue = parameterDefaultValues[name];
        setPersistedParameterValues(prevState => {
            const valueToSave = value === defaultValue ? undefined : value;
            if (prevState[name] !== valueToSave) {
                return Object.assign(Object.assign({}, prevState), { [name]: valueToSave });
            }
            return prevState;
        });
    };
    const parameterValuesWithDefaults = React.useMemo(() => Object.fromEntries(allParameters.map(parameter => {
        var _a;
        return [
            parameter.name,
            (_a = persistedParameterValues[parameter.name]) !== null && _a !== void 0 ? _a : parameterDefaultValues[parameter.name],
        ];
    })), [allParameters, persistedParameterValues, parameterDefaultValues]);
    return {
        allParameters,
        parameterValuesWithDefaults,
        updateParameterValue,
    };
};
function extractAllParameters(httpOperation) {
    var _a, _b, _c, _d, _e, _f;
    const getRequired = (obj) => { var _a; return (_a = obj.required) !== null && _a !== void 0 ? _a : false; };
    const pathParameters = orderBy((_b = (_a = httpOperation.request) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : [], [getRequired, 'name'], ['desc', 'asc']);
    const queryParameters = filterOutAuthorizationParams(orderBy((_d = (_c = httpOperation.request) === null || _c === void 0 ? void 0 : _c.query) !== null && _d !== void 0 ? _d : [], [getRequired, 'name'], ['desc', 'asc']), httpOperation.security);
    const headerParameters = filterOutAuthorizationParams(orderBy((_f = (_e = httpOperation.request) === null || _e === void 0 ? void 0 : _e.headers) !== null && _f !== void 0 ? _f : [], [getRequired, 'name'], ['desc', 'asc']), httpOperation.security);
    return uniqBy([...pathParameters, ...queryParameters, ...headerParameters], p => p.name);
}

function getHttpCodeColor(code) {
    return HttpCodeColor[`${code}`[0]] || 'gray';
}

const useLineCount = ({ example }) => React.useMemo(() => {
    const lines = /\r?\n/g;
    return (example.match(lines) || []).length;
}, [example]);

const MAX_HIGHLIGHT_LINE_COUNT = 10000;
const ResponseCodeViewer = (_a) => {
    var { value } = _a, rest = __rest(_a, ["value"]);
    const lineCount = useLineCount({ example: value });
    if (lineCount < MAX_HIGHLIGHT_LINE_COUNT) {
        return React__default.createElement(CodeViewer, { language: "json", value: value });
    }
    return (React__default.createElement(CodeViewer, Object.assign({ language: "json", showAsRaw: MAX_HIGHLIGHT_LINE_COUNT < lineCount, style: {
            color: 'white',
        }, value: value }, rest)));
};

const bodyFormatMap = {
    image: ['preview'],
    json: ['preview', 'raw'],
    xml: ['preview', 'raw'],
    text: ['raw'],
};
const regex = {
    image: /image\/(.?)*(jpeg|gif|png|svg)/,
    json: /application\/(.?)*json/,
    xml: /(text|application)\/(.?)*(xml|html)/,
    text: /text\/.*/,
};
function getResponseType(contentType) {
    return Object.keys(regex).find(type => {
        const reg = regex[type];
        return reg.test(contentType);
    });
}
function parseBody(body, type) {
    switch (type) {
        case 'json':
            return safeStringify(safeParse(body), undefined, 2) || body;
        case 'xml':
            try {
                return formatXml(body);
            }
            catch (_a) {
                return body;
            }
        default:
            return body;
    }
}
const TryItResponse = ({ response }) => {
    var _a;
    const contentType = response.contentType;
    const responseType = contentType ? getResponseType(contentType) : undefined;
    const bodyFormats = responseType ? bodyFormatMap[responseType] : [];
    const [bodyFormat, setBodyFormat] = React.useState(bodyFormats.length ? bodyFormats[0] : undefined);
    return (React.createElement(Panel, { defaultIsOpen: true },
        React.createElement(Panel.Titlebar, { rightComponent: bodyFormat &&
                bodyFormats.length > 1 && React.createElement(ResponseMenu, { types: bodyFormats, type: bodyFormat, onChange: setBodyFormat }) }, "Response"),
        React.createElement(Panel.Content, null,
            React.createElement("div", null,
                React.createElement("div", { className: `sl-mb-3 sl-text-${getHttpCodeColor(response.status)}` }, `${response.status} ${(_a = HttpCodeDescriptions[response.status]) !== null && _a !== void 0 ? _a : ''}`),
                response.bodyText && responseType && ['json', 'xml', 'text'].includes(responseType) ? (React.createElement(ResponseCodeViewer, { language: "json", value: responseType && bodyFormat === 'preview'
                        ? parseBody(response.bodyText, responseType)
                        : response.bodyText })) : response.blob && responseType === 'image' ? (React.createElement(Flex, { justifyContent: "center" },
                    React.createElement(Image, { src: URL.createObjectURL(response.blob), alt: "response image" }))) : (React.createElement("p", null,
                    React.createElement(Box, { as: Icon, icon: ['fas', 'exclamation-circle'], mr: 2 }),
                    "No supported response body returned"))))));
};
const ResponseMenu = ({ types, type, onChange }) => {
    const menuItems = React.useMemo(() => {
        const items = types.map(type => ({
            id: type,
            title: capitalize(type),
            onPress: () => onChange(type),
        }));
        return items;
    }, [types, onChange]);
    return (React.createElement(Menu, { "aria-label": "Body Format", items: menuItems, renderTrigger: ({ isOpen }) => (React.createElement(Button, { appearance: "minimal", size: "sm", iconRight: ['fas', 'sort'], active: isOpen }, capitalize(type))) }));
};
const ResponseError = ({ state: { error } }) => (React.createElement(Panel, { defaultIsOpen: true },
    React.createElement(Panel.Titlebar, null, "Error"),
    React.createElement(Panel.Content, null, isNetworkError(error) ? React.createElement(NetworkErrorMessage, null) : React.createElement("p", null, error.message))));
const NetworkErrorMessage = () => (React.createElement(React.Fragment, null,
    React.createElement("p", { className: "sl-pb-2" },
        React.createElement("strong", null, "Network Error occurred.")),
    React.createElement("p", { className: "sl-pb-2" }, "1. Double check that your computer is connected to the internet."),
    React.createElement("p", { className: "sl-pb-2" }, "2. Make sure the API is actually running and available under the specified URL."),
    React.createElement("p", null,
        "3. If you've checked all of the above and still experiencing issues, check if the API supports",
        ' ',
        React.createElement(Link, { target: "_blank", rel: "noopener noreferrer", href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", fontWeight: "semibold" }, "CORS"),
        ".")));
class NetworkError extends Error {
}
const isNetworkError = (error) => error instanceof NetworkError;

const ServersDropdown = ({ servers }) => {
    const [chosenServer, setChosenServer] = useAtom(chosenServerAtom);
    const serverItems = [
        {
            type: 'option_group',
            title: 'Servers',
            value: (chosenServer === null || chosenServer === void 0 ? void 0 : chosenServer.url) || '',
            onChange: url => {
                const server = servers.find(server => server.url === url);
                setChosenServer(server);
            },
            children: [
                ...servers.map((server, i) => ({
                    id: server.url,
                    title: server.name || server.description,
                    description: server.name ? server.description || server.url : server.description ? server.url : undefined,
                    value: server.url,
                })),
            ],
        },
    ];
    return (React.createElement(Menu, { "aria-label": "Server", items: serverItems, closeOnPress: true, renderTrigger: ({ isOpen }) => (React.createElement(FieldButton, { icon: faServer, size: "sm", active: isOpen }, (chosenServer === null || chosenServer === void 0 ? void 0 : chosenServer.name) || (chosenServer === null || chosenServer === void 0 ? void 0 : chosenServer.description) || 'Server')) }));
};
ServersDropdown.displayName = 'ServersDropdown';

const defaultServers = [];
const TryIt = ({ httpOperation, mockUrl, onRequestChange, requestBodyIndex, embeddedInMd = false, tryItCredentialsPolicy, corsProxy, }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    TryIt.displayName = 'TryIt';
    const isDark = useThemeIsDark();
    const [response, setResponse] = React.useState();
    const [requestData, setRequestData] = React.useState();
    const [loading, setLoading] = React.useState(false);
    const [validateParameters, setValidateParameters] = React.useState(false);
    const mediaTypeContent = (_c = (_b = (_a = httpOperation.request) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.contents) === null || _c === void 0 ? void 0 : _c[requestBodyIndex !== null && requestBodyIndex !== void 0 ? requestBodyIndex : 0];
    const { allParameters, updateParameterValue, parameterValuesWithDefaults } = useRequestParameters(httpOperation);
    const [mockingOptions, setMockingOptions] = useMockingOptions();
    const [bodyParameterValues, setBodyParameterValues, isAllowedEmptyValues, setAllowedEmptyValues, formDataState] = useBodyParameterState(mediaTypeContent);
    const [textRequestBody, setTextRequestBody] = useTextRequestBodyState(mediaTypeContent);
    const [operationAuthValue, setOperationAuthValue] = usePersistedSecuritySchemeWithValues();
    const servers = React.useMemo(() => {
        const toDisplay = getServersToDisplay(httpOperation.servers || defaultServers, mockUrl);
        return toDisplay;
    }, [httpOperation.servers, mockUrl]);
    const firstServer = servers[0] || null;
    const [chosenServer, setChosenServer] = useAtom(chosenServerAtom);
    const isMockingEnabled = mockUrl && (chosenServer === null || chosenServer === void 0 ? void 0 : chosenServer.url) === mockUrl;
    const hasRequiredButEmptyParameters = allParameters.some(parameter => parameter.required && !parameterValuesWithDefaults[parameter.name]);
    const getValues = () => Object.keys(bodyParameterValues)
        .filter(param => { var _a; return (_a = !isAllowedEmptyValues[param]) !== null && _a !== void 0 ? _a : true; })
        .reduce((previousValue, currentValue) => {
        previousValue[currentValue] = bodyParameterValues[currentValue];
        return previousValue;
    }, {});
    React.useEffect(() => {
        const currentUrl = chosenServer === null || chosenServer === void 0 ? void 0 : chosenServer.url;
        const exists = currentUrl && servers.find(s => s.url === currentUrl);
        if (!exists) {
            setChosenServer(firstServer);
        }
        else if (exists !== chosenServer) {
            setChosenServer(exists);
        }
    }, [servers, firstServer, chosenServer, setChosenServer]);
    React.useEffect(() => {
        let isMounted = true;
        if (onRequestChange || embeddedInMd) {
            buildHarRequest(Object.assign(Object.assign({ mediaTypeContent, parameterValues: parameterValuesWithDefaults, httpOperation, bodyInput: formDataState.isFormDataBody ? getValues() : textRequestBody, auth: operationAuthValue }, (isMockingEnabled && { mockData: getMockData(mockUrl, httpOperation, mockingOptions) })), { chosenServer,
                corsProxy })).then(request => {
                if (isMounted) {
                    if (onRequestChange) {
                        onRequestChange(request);
                    }
                    if (embeddedInMd) {
                        setRequestData(request);
                    }
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [
        httpOperation,
        parameterValuesWithDefaults,
        formDataState.isFormDataBody,
        bodyParameterValues,
        isAllowedEmptyValues,
        textRequestBody,
        operationAuthValue,
        mockingOptions,
        chosenServer,
        corsProxy,
        embeddedInMd,
    ]);
    const handleSendRequest = () => __awaiter(void 0, void 0, void 0, function* () {
        setValidateParameters(true);
        if (hasRequiredButEmptyParameters)
            return;
        try {
            setLoading(true);
            const mockData = isMockingEnabled ? getMockData(mockUrl, httpOperation, mockingOptions) : undefined;
            const request = yield buildFetchRequest({
                parameterValues: parameterValuesWithDefaults,
                httpOperation,
                mediaTypeContent,
                bodyInput: formDataState.isFormDataBody ? getValues() : textRequestBody,
                mockData,
                auth: operationAuthValue,
                chosenServer,
                credentials: tryItCredentialsPolicy,
                corsProxy,
            });
            let response;
            try {
                response = yield fetch(...request);
            }
            catch (e) {
                setResponse({ error: new NetworkError(e.message) });
            }
            if (response) {
                const contentType = response.headers.get('Content-Type');
                const type = contentType ? getResponseType(contentType) : undefined;
                const bodyText = type !== 'image' ? yield response.text() : undefined;
                const blob = type === 'image' ? yield response.blob() : undefined;
                setResponse(undefined);
                setResponse({
                    status: response.status,
                    bodyText,
                    blob,
                    contentType,
                });
            }
        }
        catch (e) {
            setResponse({ error: e });
        }
        finally {
            setLoading(false);
        }
    });
    const isOnlySendButton = !((_d = httpOperation.security) === null || _d === void 0 ? void 0 : _d.length) && !allParameters.length && !formDataState.isFormDataBody && !mediaTypeContent;
    const tryItPanelContents = (React.createElement(React.Fragment, null,
        ((_e = httpOperation.security) === null || _e === void 0 ? void 0 : _e.length) ? (React.createElement(TryItAuth, { onChange: setOperationAuthValue, operationSecurityScheme: (_f = httpOperation.security) !== null && _f !== void 0 ? _f : [], value: operationAuthValue })) : null,
        allParameters.length > 0 && (React.createElement(OperationParameters, { parameters: allParameters, values: parameterValuesWithDefaults, onChangeValue: updateParameterValue, validate: validateParameters })),
        formDataState.isFormDataBody ? (React.createElement(FormDataBody, { specification: formDataState.bodySpecification, values: bodyParameterValues, onChangeValues: setBodyParameterValues, onChangeParameterAllow: setAllowedEmptyValues, isAllowedEmptyValues: isAllowedEmptyValues })) : mediaTypeContent ? (React.createElement(RequestBody, { examples: (_g = mediaTypeContent.examples) !== null && _g !== void 0 ? _g : [], requestBody: textRequestBody, onChange: setTextRequestBody })) : null,
        React.createElement(Panel.Content, { className: "SendButtonHolder", mt: 4, pt: !isOnlySendButton && !embeddedInMd ? 0 : undefined },
            React.createElement(HStack, { alignItems: "center", spacing: 2 },
                React.createElement(Button, { appearance: "primary", loading: loading, disabled: loading, onPress: handleSendRequest, size: "sm" }, "Send API Request"),
                servers.length > 1 && React.createElement(ServersDropdown, { servers: servers }),
                isMockingEnabled && (React.createElement(MockingButton, { options: mockingOptions, onOptionsChange: setMockingOptions, operation: httpOperation }))),
            validateParameters && hasRequiredButEmptyParameters && (React.createElement(Box, { mt: 4, color: "danger-light", fontSize: "sm" },
                React.createElement(Icon, { icon: ['fas', 'exclamation-triangle'], className: "sl-mr-1" }),
                "You didn't provide all of the required parameters!")))));
    let tryItPanelElem;
    if (embeddedInMd) {
        tryItPanelElem = (React.createElement(Panel, { isCollapsible: false, p: 0, className: "TryItPanel" },
            React.createElement(Panel.Titlebar, { bg: "canvas-300" },
                React.createElement(Box, { fontWeight: "bold", color: !isDark ? HttpMethodColors[httpOperation.method] : undefined }, httpOperation.method.toUpperCase()),
                React.createElement(Box, { fontWeight: "medium", ml: 2, textOverflow: "truncate", overflowX: "hidden" }, `${(chosenServer === null || chosenServer === void 0 ? void 0 : chosenServer.url) || ''}${httpOperation.path}`)),
            tryItPanelContents));
    }
    else {
        tryItPanelElem = (React.createElement(Box, { className: "TryItPanel", bg: "canvas-100", rounded: "lg" }, tryItPanelContents));
    }
    return (React.createElement(Box, { rounded: "lg", overflowY: "hidden" },
        tryItPanelElem,
        requestData && embeddedInMd && React.createElement(RequestSamples, { request: requestData, embeddedInMd: true }),
        response && !('error' in response) && React.createElement(TryItResponse, { response: response }),
        response && 'error' in response && React.createElement(ResponseError, { state: response })));
};

const LoadMore = ({ loading, onClick }) => {
    return (React.createElement(Flex, { flexDirection: "col", justifyContent: "center", alignItems: "center", style: { height: '400px' } },
        React.createElement(Button, { "aria-label": "load-example", onPress: onClick, appearance: "minimal", loading: loading, disabled: loading }, loading ? 'Loading...' : 'Load examples'),
        React.createElement(Text, { fontSize: "base", textAlign: "center" }, "Large examples are not rendered by default.")));
};

const ResponseExamples = ({ httpOperation, responseMediaType, responseStatusCode }) => {
    var _a;
    const [chosenExampleIndex, setChosenExampleIndex] = React__default.useState(0);
    const [show, setShow] = React__default.useState(false);
    const [loading, setLoading] = React__default.useState(false);
    const response = httpOperation.responses.find(response => response.code === responseStatusCode);
    const responseContents = (_a = response === null || response === void 0 ? void 0 : response.contents) === null || _a === void 0 ? void 0 : _a.find(content => content.mediaType === responseMediaType);
    let userDefinedExamples;
    if ((responseContents === null || responseContents === void 0 ? void 0 : responseContents.examples) && (responseContents === null || responseContents === void 0 ? void 0 : responseContents.examples.length) > 0) {
        userDefinedExamples = responseContents === null || responseContents === void 0 ? void 0 : responseContents.examples;
    }
    const responseExample = useGenerateExampleFromMediaTypeContent(responseContents, chosenExampleIndex, {
        skipWriteOnly: true,
    });
    const handleLoadMore = () => {
        setLoading(true);
        setTimeout(() => setShow(true), 50);
    };
    if (!userDefinedExamples && responseMediaType !== 'application/json')
        return null;
    if (!responseExample)
        return null;
    const examplesSelect = userDefinedExamples && userDefinedExamples.length > 1 && (React__default.createElement(Select, { "aria-label": "Response Example", value: String(chosenExampleIndex), options: userDefinedExamples.map((example, index) => ({ value: index, label: example.key })), onChange: (value) => setChosenExampleIndex(parseInt(String(value), 10)), size: "sm", triggerTextPrefix: "Response Example: " }));
    return (React__default.createElement(Panel, { rounded: true, isCollapsible: false },
        React__default.createElement(Panel.Titlebar, { rightComponent: React__default.createElement(CopyButton, { size: "sm", copyValue: responseExample || '' }) }, examplesSelect || React__default.createElement(Text, { color: "body" }, "Response Example")),
        React__default.createElement(Panel.Content, { p: 0 }, show || !exceedsSize(responseExample) ? (React__default.createElement(CodeViewer, { "aria-label": responseExample, noCopyButton: true, maxHeight: "500px", language: "json", value: responseExample, showLineNumbers: true, style: {
                '--fs-code': 12,
            } })) : (React__default.createElement(LoadMore, { loading: loading, onClick: handleLoadMore })))));
};

const TryItWithRequestSamples = (_a) => {
    var { hideTryIt } = _a, props = __rest(_a, ["hideTryIt"]);
    const [requestData, setRequestData] = React.useState();
    return (React.createElement(VStack, { spacing: 6 },
        !hideTryIt && (React.createElement(InvertTheme, null,
            React.createElement(Box, null,
                React.createElement(TryIt, Object.assign({}, props, { onRequestChange: setRequestData }))))),
        requestData && React.createElement(RequestSamples, { request: requestData }),
        React.createElement(ResponseExamples, Object.assign({}, props))));
};

const TwoColumnLayout = React__default.forwardRef(({ header, right, left, className }, ref) => (React__default.createElement(VStack, { ref: ref, w: "full", className: className, spacing: 8 },
    header,
    React__default.createElement(Flex, null,
        React__default.createElement(Box, { "data-testid": "two-column-left", w: 0, flex: 1 }, left),
        right && (React__default.createElement(Box, { "data-testid": "two-column-right", ml: 16, pos: "relative", w: "2/5", style: { maxWidth: 500 } }, right))))));

const DeprecatedBadge = () => (React__default.createElement(Tooltip, { renderTrigger: React__default.createElement(Badge, { intent: "warning", icon: ['fas', 'exclamation-circle'], "data-testid": "badge-deprecated" }, "Deprecated") }, "This operation has been marked as deprecated, which means it could be removed at some point in the future."));
const InternalBadge = ({ isHttpService }) => (React__default.createElement(Tooltip, { renderTrigger: React__default.createElement(Badge, { icon: faEye, "data-testid": "badge-internal", bg: "danger" }, "Internal") }, `This ${isHttpService ? 'operation' : 'model'} is marked as internal and won't be visible in public docs.`));
const VersionBadge = ({ value, backgroundColor }) => (React__default.createElement(Badge, { appearance: "solid", size: "sm", border: 0, style: {
        backgroundColor: backgroundColor || badgeDefaultBackgroundColor,
        color: badgeDefaultColor,
    } }, enhanceVersionString(value)));
const enhanceVersionString = (version) => {
    if (version[0] === 'v')
        return version;
    return `v${version}`;
};

const oauthFlowNames = {
    implicit: 'Implicit',
    authorizationCode: 'Authorization Code',
    clientCredentials: 'Client Credentials',
    password: 'Password',
};
function getDefaultDescription(scheme) {
    switch (scheme.type) {
        case 'apiKey':
            return getApiKeyDescription(scheme.in, scheme.name);
        case 'http':
            switch (scheme.scheme) {
                case 'basic':
                    return getBasicAuthDescription();
                case 'bearer':
                    return getBearerAuthDescription();
                case 'digest':
                    return getDigestAuthDescription();
            }
        case 'oauth2':
            return getOAuthDescription(scheme);
    }
    return '';
}
function getApiKeyDescription(inProperty, name) {
    return `An API key is a token that you provide when making API calls. Include the token in a ${inProperty} parameter called \`${name}\`.

  Example: ${inProperty === 'query' ? `\`?${name}=123\`` : `\`${name}: 123\``}`;
}
function getBasicAuthDescription() {
    return `Basic authentication is a simple authentication scheme built into the HTTP protocol.
  To use it, send your HTTP requests with an Authorization header that contains the word Basic
  followed by a space and a base64-encoded string \`username:password\`.

  Example: \`Authorization: Basic ZGVtbzpwQDU1dzByZA==\``;
}
function getBearerAuthDescription() {
    return `Provide your bearer token in the Authorization header when making requests to protected resources.

  Example: \`Authorization: Bearer 123\``;
}
function getDigestAuthDescription() {
    return `Provide your encrypted digest scheme data in the Authorization header when making requests to protected resources.

  Example: \`Authorization: Digest username=guest, realm="test", nonce="2", uri="/uri", response="123"\``;
}
function getOAuthDescription(scheme) {
    const flows = keys(scheme.flows);
    return flows.map(flow => getOAuthFlowDescription(oauthFlowNames[flow], scheme.flows[flow])).join('\n\n');
}
function getOAuthFlowDescription(title, flow) {
    let description = `**${title} OAuth Flow**`;
    description +=
        isOAuth2ImplicitFlow(flow) || isOauth2AuthorizationCodeFlow(flow)
            ? `\n\nAuthorize URL: ${flow.authorizationUrl}`
            : '';
    description +=
        isOauth2AuthorizationCodeFlow(flow) || isOauth2ClientCredentialsOrPasswordFlow(flow)
            ? `\n\nToken URL: ${flow.tokenUrl}`
            : '';
    description += flow.refreshUrl ? `\n\nRefresh URL: ${flow.refreshUrl}` : '';
    const scopes = entries(flow.scopes);
    if (scopes.length) {
        description += `\n\nScopes:
${scopes.map(([key, value]) => `- \`${key}\` - ${value}`).join('\n')}`;
    }
    return description;
}

const RouterTypeContext = React.createContext(null);
const useRouterType = () => {
    return React.useContext(RouterTypeContext);
};

const LinkHeading = React.memo(function LinkHeading(props) {
    const isUsingRouter = !!useRouterType();
    const Comp = isUsingRouter ? CustomLinkHeading : LinkHeading$1;
    return React.createElement(Comp, Object.assign({}, props));
});
const CustomLinkHeading = React.memo(function LinkHeading(_a) {
    var { id: _id } = _a, props = __rest(_a, ["id"]);
    const { pathname } = useLocation();
    const routerKind = React.useContext(RouterTypeContext);
    const route = pathname.split('#')[0];
    const id = routerKind === 'hash' ? `${route}#${_id}` : _id;
    return React.createElement(LinkHeading$1, Object.assign({ id: id }, props));
});

const SectionTitle = ({ title, id, size = 2, children }) => {
    return (React.createElement(Flex, { w: "full" },
        React.createElement(Box, { py: 1, pr: 6, as: LinkHeading, size: size, "aria-label": title, id: id || slugify(title) }, title),
        React.createElement(Box, { alignSelf: 'center', py: 1, flexGrow: true, style: { minWidth: 0 } }, children)));
};
const SectionSubtitle = props => {
    return React.createElement(SectionTitle, Object.assign({}, props, { size: 3 }));
};
const SubSectionPanel = ({ title, children, hasContent, rightComponent, defaultIsOpen = true, onChange, }) => {
    return (React.createElement(Panel, { isCollapsible: hasContent, defaultIsOpen: defaultIsOpen, onChange: onChange, appearance: "outlined" },
        React.createElement(Panel.Titlebar, { fontWeight: "medium", rightComponent: rightComponent },
            React.createElement("div", { role: "heading" }, title)),
        hasContent !== false && React.createElement(Panel.Content, null, children)));
};

const isBodyEmpty = (body) => {
    if (!body)
        return true;
    const { contents = [], description } = body;
    return contents.length === 0 && !(description === null || description === void 0 ? void 0 : description.trim());
};
const Body = ({ body, defaultExpandedDepth, onChange }) => {
    var _a;
    const refResolver = useInlineRefResolver();
    const [chosenContent, setChosenContent] = React.useState(0);
    const { nodeHasChanged } = useOptionsCtx();
    React.useEffect(() => {
        onChange(chosenContent);
    }, [chosenContent]);
    if (isBodyEmpty(body))
        return null;
    const { contents = [], description } = body;
    const schema = (_a = contents[chosenContent]) === null || _a === void 0 ? void 0 : _a.schema;
    const descriptionChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: body.id, attr: 'description' });
    return (React.createElement(VStack, { spacing: 6 },
        React.createElement(SectionSubtitle, { title: "Body", id: "request-body" }, contents.length > 0 && (React.createElement(Flex, { flex: 1, justify: "end" },
            React.createElement(Select, { "aria-label": "Request Body Content Type", value: String(chosenContent), onChange: (value) => setChosenContent(parseInt(String(value), 10)), options: contents.map((content, index) => ({ label: content.mediaType, value: index })), size: "sm" })))),
        description && (React.createElement(Box, { pos: "relative" },
            React.createElement(MarkdownViewer, { markdown: description }),
            React.createElement(NodeAnnotation, { change: descriptionChanged }))),
        isJSONSchema(schema) && (React.createElement(JsonSchemaViewer, { resolveRef: refResolver, schema: getOriginalObject(schema), viewMode: "write", renderRootTreeLines: true, nodeHasChanged: nodeHasChanged, defaultExpandedDepth: defaultExpandedDepth || 2 }))));
};
Body.displayName = 'HttpOperation.Body';

const isNodeExample = (example) => {
    return example.hasOwnProperty('value');
};

const readableStyles = {
    [HttpParamStyles.PipeDelimited]: 'Pipe separated values',
    [HttpParamStyles.SpaceDelimited]: 'Space separated values',
    [HttpParamStyles.CommaDelimited]: 'Comma separated values',
    [HttpParamStyles.Simple]: 'Comma separated values',
    [HttpParamStyles.Matrix]: 'Path style values',
    [HttpParamStyles.Label]: 'Label style values',
    [HttpParamStyles.Form]: 'Form style values',
};
const defaultStyle = {
    query: HttpParamStyles.Form,
    header: HttpParamStyles.Simple,
    path: HttpParamStyles.Simple,
    cookie: HttpParamStyles.Form,
};
const Parameters = ({ parameters, parameterType }) => {
    const { nodeHasChanged } = useOptionsCtx();
    const refResolver = useInlineRefResolver();
    const schema = React.useMemo(() => httpOperationParamsToSchema({ parameters, parameterType }), [parameters, parameterType]);
    if (!schema)
        return null;
    return (React.createElement(JsonSchemaViewer, { resolveRef: refResolver, schema: schema, disableCrumbs: true, nodeHasChanged: nodeHasChanged, defaultExpandedDepth: 2 }));
};
Parameters.displayName = 'HttpOperation.Parameters';
const httpOperationParamsToSchema = ({ parameters, parameterType }) => {
    if (!parameters || !parameters.length)
        return null;
    const schema = {
        properties: {},
        required: [],
    };
    const sortedParams = sortBy(parameters, ['required', 'name']);
    for (const p of sortedParams) {
        const { name, description, required, deprecated, examples, style } = p;
        const paramSchema = isPlainObject$1(p.schema) ? p.schema : {};
        const paramExamples = (examples === null || examples === void 0 ? void 0 : examples.map(example => {
            if (isNodeExample(example)) {
                return example.value;
            }
            return example.externalValue;
        })) || [];
        const schemaExamples = paramSchema.examples;
        const schemaExamplesArray = Array.isArray(schemaExamples) ? schemaExamples : [];
        const paramDescription = description || paramSchema.description;
        const paramDeprecated = !!(deprecated || paramSchema.deprecated);
        const paramStyle = style && defaultStyle[parameterType] !== style ? readableStyles[style] || style : undefined;
        if (isPlainObject$1(schema.properties)) {
            schema.properties[p.name] = Object.assign(Object.assign({}, paramSchema), { description: paramDescription, examples: [...paramExamples, ...schemaExamplesArray], deprecated: paramDeprecated, style: paramStyle, 'x-stoplight': Object.assign(Object.assign({}, (isPlainObject$1(paramSchema['x-stoplight']) ? paramSchema['x-stoplight'] : {})), { id: p.id }) });
        }
        if (required && Array.isArray(schema.required)) {
            schema.required.push(name);
        }
    }
    return schema;
};

const Request = ({ operation: { request, request: { path: pathParams = [], headers: headerParams = [], cookie: cookieParams = [], body, query: queryParams = [], } = {}, security, }, defaultExpandedDepth, onChange, }) => {
    if (!request || typeof request !== 'object')
        return null;
    const bodyIsEmpty = isBodyEmpty(body);
    const securitySchemes = flatten(security);
    const hasRequestData = Boolean(securitySchemes.length ||
        pathParams.length ||
        queryParams.length ||
        headerParams.length ||
        cookieParams.length ||
        !bodyIsEmpty);
    if (!hasRequestData)
        return null;
    return (React.createElement(VStack, { spacing: 8 },
        React.createElement(SectionTitle, { title: "Request" }),
        React.createElement(SecuritySchemes$1, { schemes: securitySchemes }),
        pathParams.length > 0 && (React.createElement(VStack, { spacing: 5 },
            React.createElement(SectionSubtitle, { title: "Path Parameters" }),
            React.createElement(Parameters, { parameterType: "path", parameters: pathParams }))),
        queryParams.length > 0 && (React.createElement(VStack, { spacing: 5 },
            React.createElement(SectionSubtitle, { title: "Query Parameters" }),
            React.createElement(Parameters, { parameterType: "query", parameters: queryParams }))),
        headerParams.length > 0 && (React.createElement(VStack, { spacing: 5 },
            React.createElement(SectionSubtitle, { title: "Headers", id: "request-headers" }),
            React.createElement(Parameters, { parameterType: "header", parameters: headerParams }))),
        cookieParams.length > 0 && (React.createElement(VStack, { spacing: 5 },
            React.createElement(SectionSubtitle, { title: "Cookies", id: "request-cookies" }),
            React.createElement(Parameters, { parameterType: "cookie", parameters: cookieParams }))),
        body && React.createElement(Body, { onChange: onChange, body: body, defaultExpandedDepth: defaultExpandedDepth })));
};
Request.displayName = 'HttpOperation.Request';
const schemeExpandedState = atomWithStorage('HttpOperation_security_expanded', {});
const SecurityPanel = ({ scheme, includeKey }) => {
    const [expandedState, setExpanded] = useAtom(schemeExpandedState);
    return (React.createElement(SubSectionPanel, { title: `Security: ${getReadableSecurityName(scheme, includeKey)}`, defaultIsOpen: !!expandedState[scheme.key], onChange: isOpen => setExpanded(Object.assign(Object.assign({}, expandedState), { [scheme.key]: isOpen })) },
        React.createElement(MarkdownViewer, { style: { fontSize: 12 }, markdown: `${scheme.description || ''}\n\n` + getDefaultDescription(scheme) })));
};
const SecuritySchemes$1 = ({ schemes }) => {
    const { nodeHasChanged } = useOptionsCtx();
    if (!schemes.length) {
        return null;
    }
    return (React.createElement(VStack, { spacing: 3 }, schemes.map((scheme, i) => (React.createElement(Box, { pos: "relative", key: i },
        React.createElement(SecurityPanel, { scheme: scheme, includeKey: shouldIncludeKey(schemes, scheme.type) }),
        React.createElement(NodeAnnotation, { change: nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: scheme.id }) }))))));
};

const Responses = ({ responses: unsortedResponses, defaultExpandedDepth, onStatusCodeChange, onMediaTypeChange, }) => {
    var _a, _b;
    const responses = sortBy(uniqBy(unsortedResponses, r => r.code), r => r.code);
    const [activeResponseId, setActiveResponseId] = React.useState((_b = (_a = responses[0]) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : '');
    React.useEffect(() => {
        onStatusCodeChange(activeResponseId);
    }, [activeResponseId]);
    if (!responses.length)
        return null;
    return (React.createElement(VStack, { spacing: 8, as: Tabs, selectedId: activeResponseId, onChange: setActiveResponseId, appearance: "pill" },
        React.createElement(SectionTitle, { title: "Responses" },
            React.createElement(TabList, { density: "compact" }, responses.map(({ code }) => (React.createElement(Tab, { key: code, id: code, intent: codeToIntentVal(code) }, code))))),
        React.createElement(TabPanels, { p: 0 }, responses.map(response => (React.createElement(TabPanel, { key: response.code, id: response.code },
            React.createElement(Response, { response: response, defaultExpandedDepth: defaultExpandedDepth, onMediaTypeChange: onMediaTypeChange })))))));
};
Responses.displayName = 'HttpOperation.Responses';
const Response = ({ response, defaultExpandedDepth, onMediaTypeChange }) => {
    const { contents = [], headers = [], description } = response;
    const [chosenContent, setChosenContent] = React.useState(0);
    const refResolver = useInlineRefResolver();
    const { nodeHasChanged } = useOptionsCtx();
    const responseContent = contents[chosenContent];
    const schema = responseContent === null || responseContent === void 0 ? void 0 : responseContent.schema;
    React.useEffect(() => {
        responseContent && onMediaTypeChange(responseContent.mediaType);
    }, [responseContent]);
    const descriptionChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: response.id, attr: 'description' });
    return (React.createElement(VStack, { spacing: 8, pt: 8 },
        description && (React.createElement(Box, { pos: "relative" },
            React.createElement(MarkdownViewer, { markdown: description }),
            React.createElement(NodeAnnotation, { change: descriptionChanged }))),
        headers.length > 0 && (React.createElement(VStack, { spacing: 5 },
            React.createElement(SectionSubtitle, { title: "Headers", id: "response-headers" }),
            React.createElement(Parameters, { parameterType: "header", parameters: headers }))),
        contents.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement(SectionSubtitle, { title: "Body", id: "response-body" },
                React.createElement(Flex, { flex: 1, justify: "end" },
                    React.createElement(Select, { "aria-label": "Response Body Content Type", value: String(chosenContent), onChange: (value) => setChosenContent(parseInt(String(value), 10)), options: contents.map((content, index) => ({ label: content.mediaType, value: index })), size: "sm" }))),
            schema && (React.createElement(JsonSchemaViewer, { schema: getOriginalObject(schema), resolveRef: refResolver, viewMode: "read", parentCrumbs: ['responses', response.code], renderRootTreeLines: true, nodeHasChanged: nodeHasChanged, defaultExpandedDepth: defaultExpandedDepth || 2 }))))));
};
Response.displayName = 'HttpOperation.Response';
const codeToIntentVal = (code) => {
    const firstChar = code.charAt(0);
    switch (firstChar) {
        case '2':
            return 'success';
        case '4':
            return 'warning';
        case '5':
            return 'danger';
        default:
            return 'default';
    }
};

const HttpOperationComponent = React.memo(({ className, data: unresolvedData, layoutOptions, tryItCredentialsPolicy, tryItCorsProxy }) => {
    const { nodeHasChanged } = useOptionsCtx();
    const data = useResolvedObject(unresolvedData);
    const mocking = React.useContext(MockingContext);
    const isDeprecated = !!data.deprecated;
    const isInternal = !!data.internal;
    const [responseMediaType, setResponseMediaType] = React.useState('');
    const [responseStatusCode, setResponseStatusCode] = React.useState('');
    const [requestBodyIndex, setTextRequestBodyIndex] = React.useState(0);
    const prettyName = (data.summary || data.iid || '').trim();
    const hasBadges = isDeprecated || isInternal;
    const header = (React.createElement(OperationHeader, { id: data.id, method: data.method, path: data.path, noHeading: layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.noHeading, hasBadges: hasBadges, name: prettyName, isDeprecated: isDeprecated, isInternal: isInternal }));
    const descriptionChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: data.id, attr: 'description' });
    const description = (React.createElement(VStack, { spacing: 10 },
        data.description && (React.createElement(Box, { pos: "relative" },
            React.createElement(MarkdownViewer, { className: "HttpOperation__Description", markdown: data.description }),
            React.createElement(NodeAnnotation, { change: descriptionChanged }))),
        React.createElement(Request, { onChange: setTextRequestBodyIndex, operation: data, defaultExpandedDepth: layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.defaultExpandedDepth }),
        data.responses && (React.createElement(Responses, { responses: data.responses, defaultExpandedDepth: layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.defaultExpandedDepth, onMediaTypeChange: setResponseMediaType, onStatusCodeChange: setResponseStatusCode }))));
    const tryItPanel = !(layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.hideTryItPanel) && (React.createElement(TryItWithRequestSamples, { httpOperation: data, responseMediaType: responseMediaType, responseStatusCode: responseStatusCode, requestBodyIndex: requestBodyIndex, hideTryIt: layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.hideTryIt, tryItCredentialsPolicy: tryItCredentialsPolicy, mockUrl: mocking.hideMocking ? undefined : mocking.mockUrl, corsProxy: tryItCorsProxy }));
    return (React.createElement(TwoColumnLayout, { className: cn('HttpOperation', className), header: header, left: description, right: tryItPanel }));
});
HttpOperationComponent.displayName = 'HttpOperation.Component';
const HttpOperation = withErrorBoundary(HttpOperationComponent, {
    recoverableProps: ['data'],
});
function MethodPath({ method, path }) {
    const chosenServer = useAtomValue(chosenServerAtom);
    let chosenServerUrl = '';
    if (chosenServer) {
        chosenServerUrl = chosenServer.url.endsWith('/') ? chosenServer.url.slice(0, -1) : chosenServer.url;
    }
    return (React.createElement(Box, null,
        React.createElement(MethodPathInner, { method: method, path: path, chosenServerUrl: chosenServerUrl })));
}
function MethodPathInner({ method, path, chosenServerUrl }) {
    const isDark = useThemeIsDark();
    const fullUrl = `${chosenServerUrl}${path}`;
    const { leading, trailing } = useChosenServerUrl(chosenServerUrl);
    const pathElem = (React.createElement(Flex, { overflowX: "hidden", fontSize: "lg", userSelect: "all" },
        React.createElement(Box, { dir: "rtl", color: "muted", textOverflow: "truncate", overflowX: "hidden" },
            leading,
            trailing !== null && (React.createElement(Box, { as: "span", dir: "ltr", style: { unicodeBidi: 'bidi-override' } }, trailing))),
        React.createElement(Box, { fontWeight: "semibold", flex: 1 }, path)));
    return (React.createElement(HStack, { spacing: 3, pl: 2.5, pr: 4, py: 2, bg: "canvas-50", rounded: "lg", fontFamily: "mono", display: "inline-flex", maxW: "full", title: fullUrl },
        React.createElement(Box, { py: 1, px: 2.5, rounded: "lg", bg: !isDark ? HttpMethodColors[method] : 'canvas-100', color: !isDark ? 'on-primary' : 'body', fontSize: "lg", fontWeight: "semibold", textTransform: "uppercase" }, method),
        pathElem));
}
function OperationHeader({ id, noHeading, hasBadges, name, isDeprecated, isInternal, method, path, }) {
    const { nodeHasChanged } = useOptionsCtx();
    if (noHeading && !hasBadges) {
        return null;
    }
    const lineOneChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: id, attr: ['iid', 'summary', 'deprecated', 'internal'] });
    const lineTwoChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: id, attr: ['method', 'path'] });
    return (React.createElement(VStack, { spacing: 5 },
        React.createElement(Box, { pos: "relative" },
            React.createElement(HStack, { spacing: 5 },
                !noHeading && name ? (React.createElement(Heading, { size: 1, fontWeight: "semibold" }, name)) : null,
                React.createElement(HStack, { spacing: 2 },
                    isDeprecated && React.createElement(DeprecatedBadge, null),
                    isInternal && React.createElement(InternalBadge, { isHttpService: true }))),
            React.createElement(NodeAnnotation, { change: lineOneChanged })),
        React.createElement(Box, { pos: "relative" },
            React.createElement(MethodPath, { method: method, path: path }),
            React.createElement(NodeAnnotation, { change: lineTwoChanged }))));
}

const AdditionalInfo = ({ id, termsOfService, contact, license }) => {
    const { nodeHasChanged } = useOptionsCtx();
    const hasChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: id, attr: ['termsOfService', 'contact', 'license'] });
    const contactLink = (contact === null || contact === void 0 ? void 0 : contact.name) && (contact === null || contact === void 0 ? void 0 : contact.url)
        ? `[Contact ${contact.name}](${contact.url})`
        : (contact === null || contact === void 0 ? void 0 : contact.email)
            ? `[Contact ${contact.name || contact.email}](mailto:${contact.email})`
            : '';
    const licenseUrl = (license === null || license === void 0 ? void 0 : license.url) || `https://spdx.org/licenses/${license === null || license === void 0 ? void 0 : license.identifier}.html`;
    const licenseLink = (license === null || license === void 0 ? void 0 : license.name) && licenseUrl ? `[${license.name} License](${licenseUrl})` : '';
    const tosLink = termsOfService ? `[Terms of Service](${termsOfService})` : '';
    return contactLink || licenseLink || tosLink ? (React__default.createElement(Panel, { rounded: true, isCollapsible: false, pos: "relative" },
        React__default.createElement(Panel.Titlebar, { bg: "canvas-300" },
            React__default.createElement("span", { role: "heading" }, "Additional Information")),
        React__default.createElement(Panel.Content, { p: 0 },
            React__default.createElement(Panel.Content, null,
                React__default.createElement(MarkdownViewer, { style: { fontSize: 12 }, markdown: `${contactLink}\n \n${licenseLink}\n \n ${tosLink}` }))),
        React__default.createElement(NodeAnnotation, { change: hasChanged }))) : null;
};

const ExportButton = ({ original, bundled }) => {
    const menuItems = React.useMemo(() => {
        const items = [
            Object.assign({ id: 'original', title: 'Original' }, original),
            Object.assign({ id: 'bundled', title: 'Bundled References' }, bundled),
        ];
        return items;
    }, [original, bundled]);
    return (React.createElement(Box, null,
        React.createElement(Menu, { "aria-label": "Export", items: menuItems, placement: "bottom right", renderTrigger: ({ isOpen }) => (React.createElement(Button, { iconRight: "chevron-down", appearance: "default", ml: 2, active: isOpen, size: "sm" }, "Export")) })));
};

const SecuritySchemes = ({ schemes, defaultScheme, defaultCollapsed = false, }) => {
    return (React__default.createElement(Panel, { rounded: true, isCollapsible: defaultCollapsed },
        React__default.createElement(Panel.Titlebar, { bg: "canvas-300" },
            React__default.createElement(Box, { as: "span", role: "heading" }, "Security")),
        React__default.createElement(Panel.Content, { p: 0 }, sortBy(schemes, 'type').map((scheme, i) => (React__default.createElement(SecurityScheme, { key: i, scheme: scheme, defaultIsOpen: defaultScheme ? scheme.key === defaultScheme : i === 0, isCollapsible: schemes.length > 1, showSchemeKey: shouldIncludeKey(schemes, scheme.type) }))))));
};
const SecurityScheme = ({ scheme, defaultIsOpen, isCollapsible, showSchemeKey }) => {
    const { nodeHasChanged } = useOptionsCtx();
    const hasChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: scheme.id });
    return (React__default.createElement(Panel, { defaultIsOpen: defaultIsOpen, isCollapsible: isCollapsible, pos: "relative" },
        React__default.createElement(Panel.Titlebar, null,
            React__default.createElement(Box, { as: "span", role: "heading" }, getReadableSecurityName(scheme, showSchemeKey))),
        React__default.createElement(Panel.Content, null,
            React__default.createElement(MarkdownViewer, { style: { fontSize: 12 }, markdown: `${scheme.description || ''}\n\n` + getDefaultDescription(scheme) })),
        React__default.createElement(NodeAnnotation, { change: hasChanged })));
};

const ServerInfo = ({ servers, mockUrl }) => {
    const mocking = React.useContext(MockingContext);
    const showMocking = !mocking.hideMocking && mockUrl && isProperUrl(mockUrl);
    const $mockUrl = showMocking ? mockUrl || mocking.mockUrl : undefined;
    const serversToDisplay = getServersToDisplay(servers, $mockUrl);
    if (!showMocking && serversToDisplay.length === 0) {
        return null;
    }
    return (React.createElement(InvertTheme, null,
        React.createElement(Panel, { rounded: true, isCollapsible: false, className: "BaseURLContent", w: "full" },
            React.createElement(Panel.Titlebar, { whitespace: "nowrap" }, "API Base URL"),
            React.createElement(Panel.Content, { w: "full", className: "sl-flex sl-flex-col" },
                React.createElement(VStack, { spacing: 1, divider: true }, serversToDisplay.map((server, index) => (React.createElement(ServerUrl, Object.assign({}, server, { key: index })))))))));
};
const ServerUrl = ({ id, description, url }) => {
    const { nodeHasChanged } = useOptionsCtx();
    const { onCopy, hasCopied } = useClipboard(url);
    const hasChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: id });
    return (React.createElement(Box, { whitespace: "nowrap", pos: "relative" },
        React.createElement(Text, { pr: 2, fontWeight: "bold" },
            description,
            ":"),
        React.createElement(Tooltip, { placement: "right", renderTrigger: () => React.createElement(Text, { "aria-label": description }, url) },
            !hasCopied && (React.createElement(Box, { p: 1, onClick: onCopy, cursor: "pointer" },
                "Copy Server URL ",
                React.createElement(Icon, { className: "sl-ml-1", icon: ['fas', 'copy'] }))),
            hasCopied && (React.createElement(Box, { p: 1 },
                "Copied Server URL ",
                React.createElement(Icon, { className: "sl-ml-1", icon: ['fas', 'check'] })))),
        React.createElement(NodeAnnotation, { change: hasChanged, additionalLeftOffset: 16 })));
};

const HttpServiceComponent = React.memo(({ data: unresolvedData, location = {}, layoutOptions, exportProps }) => {
    var _a, _b, _c;
    const { nodeHasChanged } = useOptionsCtx();
    const data = useResolvedObject(unresolvedData);
    const { search } = location;
    const mocking = React.useContext(MockingContext);
    const query = new URLSearchParams(search);
    const nameChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: data.id, attr: 'name' });
    const versionChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: data.id, attr: 'version' });
    const descriptionChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId: data.id, attr: 'description' });
    return (React.createElement(Box, { mb: 10 },
        data.name && !(layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.noHeading) && (React.createElement(Flex, { justifyContent: "between", alignItems: "center" },
            React.createElement(Box, { pos: "relative" },
                React.createElement(Heading, { size: 1, mb: 4, fontWeight: "semibold" }, data.name),
                React.createElement(NodeAnnotation, { change: nameChanged })),
            exportProps && !(layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.hideExport) && React.createElement(ExportButton, Object.assign({}, exportProps)))),
        data.version && (React.createElement(Box, { mb: 5, pos: "relative" },
            React.createElement(VersionBadge, { value: data.version }),
            React.createElement(NodeAnnotation, { change: versionChanged }))),
        React.createElement(VStack, { spacing: 6 },
            React.createElement(ServerInfo, { servers: (_a = data.servers) !== null && _a !== void 0 ? _a : [], mockUrl: mocking.mockUrl }),
            React.createElement(Box, null, ((_b = data.securitySchemes) === null || _b === void 0 ? void 0 : _b.length) ? (React.createElement(SecuritySchemes, { schemes: data.securitySchemes, defaultScheme: query.get('security') || undefined })) : null),
            React.createElement(Box, null, (((_c = data.contact) === null || _c === void 0 ? void 0 : _c.email) || data.license || data.termsOfService) && (React.createElement(AdditionalInfo, { id: data.id, contact: data.contact, license: data.license, termsOfService: data.termsOfService })))),
        data.description && (React.createElement(Box, { pos: "relative" },
            React.createElement(MarkdownViewer, { className: "sl-my-5", markdown: data.description }),
            React.createElement(NodeAnnotation, { change: descriptionChanged })))));
});
HttpServiceComponent.displayName = 'HttpService.Component';
const HttpService = withErrorBoundary(HttpServiceComponent, { recoverableProps: ['data'] });

const getBreakpoints = (compact) => {
    if (!compact)
        return undefined;
    if (typeof compact === 'number') {
        return [
            ['compact', compact],
            ['regular', Infinity],
        ];
    }
    return [['compact', Infinity]];
};
function useIsCompact(layoutOptions) {
    const { ref, breakpoint } = useBreakpoints(getBreakpoints(layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.compact));
    return { ref: ref, isCompact: breakpoint === 'compact' };
}

const ModelComponent = ({ data: unresolvedData, className, nodeTitle, layoutOptions, exportProps, }) => {
    var _a, _b;
    const resolveRef = useInlineRefResolver();
    const data = useResolvedObject(unresolvedData);
    const { nodeHasChanged } = useOptionsCtx();
    const { ref: layoutRef, isCompact } = useIsCompact(layoutOptions);
    const nodeId = (_a = data === null || data === void 0 ? void 0 : data['x-stoplight']) === null || _a === void 0 ? void 0 : _a.id;
    const title = (_b = data.title) !== null && _b !== void 0 ? _b : nodeTitle;
    const isDeprecated = !!data['deprecated'];
    const isInternal = !!data['x-internal'];
    const shouldDisplayHeader = !(layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.noHeading) && (title !== undefined || (exportProps && !(layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.hideExport)));
    const titleChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId, attr: ['title', 'internal'] });
    const header = (shouldDisplayHeader || isInternal || isDeprecated) && (React.createElement(Flex, { justifyContent: "between", alignItems: "center" },
        React.createElement(Box, { pos: "relative" },
            React.createElement(HStack, { spacing: 5 },
                title && (React.createElement(Heading, { size: 1, fontWeight: "semibold" }, title)),
                React.createElement(HStack, { spacing: 2 },
                    isDeprecated && React.createElement(DeprecatedBadge, null),
                    isInternal && React.createElement(InternalBadge, null))),
            React.createElement(NodeAnnotation, { change: titleChanged })),
        exportProps && !(layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.hideExport) && React.createElement(ExportButton, Object.assign({}, exportProps))));
    const modelExamples = !(layoutOptions === null || layoutOptions === void 0 ? void 0 : layoutOptions.hideModelExamples) && React.createElement(ModelExamples, { data: data, isCollapsible: isCompact });
    const descriptionChanged = nodeHasChanged === null || nodeHasChanged === void 0 ? void 0 : nodeHasChanged({ nodeId, attr: 'description' });
    const description = (React.createElement(VStack, { spacing: 10 },
        data.description && data.type === 'object' && (React.createElement(Box, { pos: "relative" },
            React.createElement(MarkdownViewer, { role: "textbox", markdown: data.description }),
            React.createElement(NodeAnnotation, { change: descriptionChanged }))),
        isCompact && modelExamples,
        React.createElement(JsonSchemaViewer, { resolveRef: resolveRef, schema: getOriginalObject(data), nodeHasChanged: nodeHasChanged, skipTopLevelDescription: true, defaultExpandedDepth: 2 })));
    return (React.createElement(TwoColumnLayout, { ref: layoutRef, className: cn('Model', className), header: header, left: description, right: !isCompact && modelExamples }));
};
const ModelExamples = React.memo(({ data, isCollapsible = false }) => {
    var _a;
    const [chosenExampleIndex, setChosenExampleIndex] = React.useState(0);
    const [show, setShow] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const examples = React.useMemo(() => generateExamplesFromJsonSchema(data), [data]);
    const selectedExample = (_a = examples[chosenExampleIndex]) === null || _a === void 0 ? void 0 : _a.data;
    const handleLoadMorePress = React.useCallback(() => {
        setLoading(true);
        setTimeout(() => setShow(true), 50);
    }, []);
    const examplesSelect = examples.length > 1 && (React.createElement(Select, { "aria-label": "Example", value: String(chosenExampleIndex), options: examples.map(({ label }, index) => ({ value: index, label })), onChange: (value) => setChosenExampleIndex(parseInt(String(value), 10)), size: "sm", triggerTextPrefix: "Example: " }));
    return (React.createElement(Panel, { rounded: true, isCollapsible: isCollapsible, defaultIsOpen: !isCollapsible },
        React.createElement(Panel.Titlebar, { rightComponent: selectedExample ? React.createElement(CopyButton, { size: "sm", copyValue: selectedExample }) : null }, examplesSelect || (React.createElement(Text, { color: "body", role: "heading" }, "Example"))),
        React.createElement(Panel.Content, { p: 0 }, show || !exceedsSize(selectedExample) ? (React.createElement(CodeViewer, { "aria-label": selectedExample, noCopyButton: true, maxHeight: "500px", language: "json", value: selectedExample, showLineNumbers: true })) : (React.createElement(LoadMore, { loading: loading, onClick: handleLoadMorePress })))));
});
const Model = withErrorBoundary(ModelComponent, { recoverableProps: ['data'] });

const Docs = React.memo((_a) => {
    var { nodeType, nodeData, useNodeForRefResolving = false, refResolver, nodeHasChanged } = _a, commonProps = __rest(_a, ["nodeType", "nodeData", "useNodeForRefResolving", "refResolver", "nodeHasChanged"]);
    const parsedNode = useParsedData(nodeType, nodeData);
    if (!parsedNode) {
        return null;
    }
    let elem = React.createElement(ParsedDocs, Object.assign({ node: parsedNode }, commonProps));
    if (useNodeForRefResolving) {
        elem = (React.createElement(InlineRefResolverProvider, { document: parsedNode.data, resolver: refResolver }, elem));
    }
    return React.createElement(ElementsOptionsProvider, { nodeHasChanged: nodeHasChanged }, elem);
});
const ParsedDocs = (_a) => {
    var { node } = _a, commonProps = __rest(_a, ["node"]);
    switch (node.type) {
        case 'article':
            return React.createElement(Article, Object.assign({ data: node.data }, commonProps));
        case 'http_operation':
            return React.createElement(HttpOperation, Object.assign({ data: node.data }, commonProps));
        case 'http_service':
            return React.createElement(HttpService, Object.assign({ data: node.data }, commonProps));
        case 'model':
            return React.createElement(Model, Object.assign({ data: node.data }, commonProps));
        default:
            return null;
    }
};

const MAX_CONTENT_WIDTH = 1800;
const SIDEBAR_MIN_WIDTH = 300;
const SIDEBAR_MAX_WIDTH = 1.5 * SIDEBAR_MIN_WIDTH;
const SidebarLayout = React.forwardRef(({ sidebar, children, maxContentWidth = MAX_CONTENT_WIDTH, sidebarWidth = SIDEBAR_MIN_WIDTH }, ref) => {
    const scrollRef = React.useRef(null);
    const [sidebarRef, currentSidebarWidth, startResizing] = useResizer(sidebarWidth);
    const { pathname } = useLocation();
    React.useEffect(() => {
        var _a;
        (_a = scrollRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo(0, 0);
    }, [pathname]);
    return (React.createElement(Flex, { ref: ref, className: "sl-elements-api", pin: true, h: "full" },
        React.createElement(Flex, { ref: sidebarRef, onMouseDown: (e) => e.preventDefault(), style: { maxWidth: `${SIDEBAR_MAX_WIDTH}px` } },
            React.createElement(Flex, { direction: "col", bg: "canvas-100", borderR: true, pt: 8, pos: "sticky", pinY: true, overflowY: "auto", style: {
                    paddingLeft: `calc((100% - ${maxContentWidth}px) / 2)`,
                    width: `${currentSidebarWidth}px`,
                    minWidth: `${SIDEBAR_MIN_WIDTH}px`,
                } }, sidebar),
            React.createElement(Flex, { justifySelf: "end", flexGrow: 0, flexShrink: 0, resize: "x", onMouseDown: startResizing, style: { width: '1em', flexBasis: '6px', cursor: 'ew-resize' } })),
        React.createElement(Box, { ref: scrollRef, bg: "canvas", px: 24, flex: 1, w: "full", overflowY: "auto" },
            React.createElement(Box, { style: { maxWidth: `${maxContentWidth - currentSidebarWidth}px` }, py: 16 }, children))));
});
function useResizer(sidebarWidth) {
    const sidebarRef = React.useRef(null);
    const [isResizing, setIsResizing] = React.useState(false);
    const [currentSidebarWidth, setCurrentSidebarWidth] = React.useState(sidebarWidth);
    const startResizing = React.useCallback(() => {
        setIsResizing(true);
    }, []);
    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);
    const resize = React.useCallback(mouseMoveEvent => {
        if (isResizing) {
            const value = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
            setCurrentSidebarWidth(Math.min(Math.max(SIDEBAR_MIN_WIDTH, value), SIDEBAR_MAX_WIDTH));
        }
    }, [isResizing]);
    React.useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing, { passive: true });
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);
    return [sidebarRef, currentSidebarWidth, startResizing];
}

const Logo = ({ logo }) => {
    var _a;
    return (React.createElement(Box, { display: "inline", mr: 3, rounded: "none", overflowY: "hidden", overflowX: "hidden", style: { backgroundColor: (_a = logo.backgroundColor) !== null && _a !== void 0 ? _a : 'transparent' } }, logo.href ? (React.createElement("a", { href: logo.href, target: "_blank", rel: "noopener noreferrer" },
        React.createElement("img", { src: logo.url, width: "240", height: "100", alt: logo.altText }))) : (React.createElement("img", { src: logo.url, width: "240", height: "100", alt: logo.altText }))));
};

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const PersistenceContextProvider = Provider;
function withPersistenceBoundary(WrappedComponent) {
    const WithPersistenceBoundary = props => {
        return (React.createElement(PersistenceContextProvider, null,
            React.createElement(WrappedComponent, Object.assign({}, props))));
    };
    WithPersistenceBoundary.displayName = `withPersistenceBoundary(${getDisplayName(WrappedComponent)})`;
    return WithPersistenceBoundary;
}

function useParsedValue(value) {
    return React.useMemo(() => {
        let parsedValue = value;
        if (typeof value === 'string') {
            try {
                parsedValue = parse(value);
            }
            catch (error) {
            }
        }
        return parsedValue;
    }, [value]);
}

function isPartialHttpRequest(maybeHttpRequest) {
    return (isObject(maybeHttpRequest) &&
        'method' in maybeHttpRequest &&
        typeof maybeHttpRequest['method'] === 'string' &&
        'url' in maybeHttpRequest &&
        typeof maybeHttpRequest['url'] === 'string');
}
const SchemaAndDescription = ({ title: titleProp, schema }) => {
    const resolveRef = useInlineRefResolver();
    const title = titleProp !== null && titleProp !== void 0 ? titleProp : schema.title;
    return (React__default.createElement(Box, { py: 2 },
        title && (React__default.createElement(Flex, { alignItems: "center", p: 2 },
            React__default.createElement(Icon, { icon: NodeTypeIconDefs[NodeType.Model], color: NodeTypeColors[NodeType.Model] }),
            React__default.createElement(Box, { color: "muted", px: 2 }, title))),
        React__default.createElement(JsonSchemaViewer, { resolveRef: resolveRef, schema: getOriginalObject(schema), defaultExpandedDepth: 2 })));
};
const CodeComponent = props => {
    const { title, jsonSchema, http, resolved, children } = props;
    const value = resolved || String(Array.isArray(children) ? children[0] : children);
    const parsedValue = useParsedValue(value);
    if (jsonSchema) {
        if (!isJSONSchema(parsedValue)) {
            return null;
        }
        return React__default.createElement(SchemaAndDescription, { title: title, schema: parsedValue });
    }
    if (http) {
        if (!isObject(parsedValue) || (!isPartialHttpRequest(parsedValue) && !isHttpOperation(parsedValue))) {
            return null;
        }
        return (React__default.createElement(PersistenceContextProvider, null,
            React__default.createElement(TryIt, { httpOperation: isHttpOperation(parsedValue) ? parsedValue : parseHttpRequest(parsedValue), embeddedInMd: true })));
    }
    const DefaultCode = DefaultSMDComponents.code;
    return React__default.createElement(DefaultCode, Object.assign({}, props));
};
function parseHttpRequest(data) {
    const uri = URI(data.url);
    const pathParam = data.url.match(/[^{\}]+(?=})/g);
    return {
        id: '?http-operation-id?',
        method: data.method,
        path: uri.is('absolute') ? uri.path() : data.url,
        servers: [{ id: `?http-server-${uri.href()}?`, url: uri.is('absolute') ? uri.origin() : data.baseUrl || '' }],
        request: Object.assign({ query: Object.entries(data.query || {}).map(([key, value]) => {
                const defaultVal = Array.isArray(value) ? value[0] : value;
                return {
                    id: `?http-query-${key}-id?`,
                    name: key,
                    style: HttpParamStyles.Form,
                    schema: { default: defaultVal },
                    required: isHttpRequestParamRequired(defaultVal),
                };
            }), headers: Object.entries(data.headers || {}).map(([key, value]) => ({
                id: `?http-header-${key}-id?`,
                name: key,
                style: HttpParamStyles.Simple,
                schema: { default: value },
                required: isHttpRequestParamRequired(value),
            })), path: pathParam === null || pathParam === void 0 ? void 0 : pathParam.map(name => ({
                id: `?http-param-${name}-id?`,
                name,
                style: HttpParamStyles.Simple,
                required: true,
            })) }, (data.body
            ? {
                body: {
                    id: '?http-request-body?',
                    contents: [
                        {
                            id: '?http-request-body-media?',
                            mediaType: 'application/json',
                            schema: { default: data.body },
                        },
                    ],
                },
            }
            : null)),
        responses: [],
    };
}
function isHttpRequestParamRequired(value) {
    return typeof value !== 'undefined';
}

const MarkdownComponentsProvider = ({ value, children }) => {
    return React.createElement(MarkdownViewerProvider, { components: Object.assign({ code: CodeComponent }, value) }, children);
};

const externalRegex = new RegExp('^(?:[a-z]+:)?//', 'i');
const ReactRouterMarkdownLink = ({ title, to, href: _href, children, }) => {
    const href = to || _href;
    const isExternal = href !== undefined && externalRegex.test(href);
    if (isExternal) {
        return (React__default.createElement("a", { target: "_blank", rel: "noreferrer noopener", href: href, title: title }, children));
    }
    return (React__default.createElement(HashLink, { to: href, title: title }, children));
};

function useFirstRender() {
    const ref = React__default.useRef(true);
    const firstRender = ref.current;
    ref.current = false;
    return firstRender;
}

const NODE_TYPE_TITLE_ICON = {
    http_service: faCloud,
};
const NODE_TYPE_META_ICON = {
    model: faCube,
};
const NODE_TYPE_ICON_COLOR = {
    model: 'warning',
};
const NODE_META_COLOR = {
    get: 'success',
    post: 'primary',
    put: 'warning',
    patch: 'warning',
    delete: 'danger',
};

function getHtmlIdFromItemId(id) {
    return `sl-toc-${id}`;
}
function isGroupOpenByDefault(depth, item, activeId, maxDepthOpenByDefault = 0) {
    return (depth < maxDepthOpenByDefault ||
        (activeId &&
            (('slug' in item && activeId === item.slug) ||
                ('id' in item && activeId === item.id) ||
                hasActiveItem(item.items, activeId))));
}
function hasActiveItem(items, activeId) {
    return items.some(item => {
        if ('slug' in item && activeId === item.slug) {
            return true;
        }
        if ('id' in item && activeId === item.id) {
            return true;
        }
        if ('items' in item) {
            return hasActiveItem(item.items, activeId);
        }
        return false;
    });
}
function findFirstNode(items) {
    for (const item of items) {
        if ((isNode(item) || isNodeGroup(item)) && item.slug) {
            return item;
        }
        if (isGroup(item) || isNodeGroup(item)) {
            const firstNode = findFirstNode(item.items);
            if (firstNode) {
                return firstNode;
            }
        }
        continue;
    }
    return;
}
function isDivider(item) {
    return Object.keys(item).length === 1 && 'title' in item;
}
function isGroup(item) {
    return Object.keys(item).length === 2 && 'title' in item && 'items' in item;
}
function isNodeGroup(item) {
    return 'title' in item && 'items' in item && 'slug' in item && 'id' in item && 'meta' in item && 'type' in item;
}
function isNode(item) {
    return 'title' in item && 'slug' in item && 'id' in item && 'meta' in item && 'type' in item;
}
function isExternalLink(item) {
    return Object.keys(item).length === 2 && 'title' in item && 'url' in item;
}

const ActiveIdContext = React.createContext(undefined);
const LinkContext = React.createContext(undefined);
const TableOfContents = React.memo(({ tree, activeId, Link, maxDepthOpenByDefault, externalScrollbar = false, onLinkClick }) => {
    const container = React.useRef(null);
    const child = React.useRef(null);
    const firstRender = useFirstRender();
    React.useEffect(() => {
        setTimeout(() => {
            const scrollPosition = firstRender ? 'center' : 'nearest';
            const tocHasScrollbar = externalScrollbar ||
                (container.current && child.current && container.current.offsetHeight < child.current.offsetHeight);
            if (activeId && typeof window !== 'undefined' && tocHasScrollbar) {
                const elem = window.document.getElementById(getHtmlIdFromItemId(activeId));
                if (elem && 'scrollIntoView' in elem) {
                    elem.scrollIntoView({ block: scrollPosition });
                }
            }
        }, 0);
    }, [activeId]);
    return (React.createElement(Box, { ref: container, w: "full", bg: "canvas-100", overflowY: "auto" },
        React.createElement(Box, { ref: child, my: 3 },
            React.createElement(LinkContext.Provider, { value: Link },
                React.createElement(ActiveIdContext.Provider, { value: activeId }, tree.map((item, key) => {
                    if (isDivider(item)) {
                        return React.createElement(Divider, { key: key, item: item });
                    }
                    return (React.createElement(GroupItem, { key: key, item: item, depth: 0, maxDepthOpenByDefault: maxDepthOpenByDefault, onLinkClick: onLinkClick }));
                }))))));
});
const Divider = React.memo(({ item }) => {
    return (React.createElement(Box, { pl: 4, mb: 2, mt: 6, textTransform: "uppercase", fontSize: "sm", lineHeight: "relaxed", letterSpacing: "wide", fontWeight: "bold" }, item.title));
});
const GroupItem = React.memo(({ item, depth, maxDepthOpenByDefault, onLinkClick }) => {
    if (isExternalLink(item)) {
        return (React.createElement(Box, { as: "a", href: item.url, target: "_blank", rel: "noopener noreferrer", display: "block" },
            React.createElement(Item, { depth: depth, title: item.title, meta: React.createElement(Box, { as: Icon, icon: ['fas', 'external-link'] }) })));
    }
    else if (isGroup(item) || isNodeGroup(item)) {
        return React.createElement(Group, { depth: depth, item: item, maxDepthOpenByDefault: maxDepthOpenByDefault, onLinkClick: onLinkClick });
    }
    else if (isNode(item)) {
        return (React.createElement(Node, { depth: depth, item: item, onLinkClick: onLinkClick, meta: item.meta ? (React.createElement(Box, { color: NODE_META_COLOR[item.meta], textTransform: "uppercase", fontWeight: "medium" }, item.meta)) : (NODE_TYPE_META_ICON[item.type] && (React.createElement(Flex, { alignItems: "center" },
                item.version && React.createElement(Version, { value: item.version }),
                React.createElement(Box, { as: Icon, color: NODE_TYPE_ICON_COLOR[item.type], icon: NODE_TYPE_META_ICON[item.type] })))) }));
    }
    return null;
});
const Group = React.memo(({ depth, item, maxDepthOpenByDefault, onLinkClick = () => { } }) => {
    const activeId = React.useContext(ActiveIdContext);
    const [isOpen, setIsOpen] = React.useState(() => isGroupOpenByDefault(depth, item, activeId, maxDepthOpenByDefault));
    const hasActive = !!activeId && hasActiveItem(item.items, activeId);
    React.useEffect(() => {
        const openByDefault = isGroupOpenByDefault(depth, item, activeId, maxDepthOpenByDefault);
        if (isOpen !== openByDefault) {
            setIsOpen(openByDefault);
        }
    }, [depth, maxDepthOpenByDefault]);
    React.useEffect(() => {
        if (hasActive) {
            setIsOpen(true);
        }
    }, [hasActive]);
    const handleClick = (e, forceOpen) => {
        setIsOpen(forceOpen ? true : !isOpen);
    };
    const meta = (React.createElement(Flex, { alignItems: "center" },
        isNodeGroup(item) && item.version && React.createElement(Version, { value: item.version }),
        React.createElement(Box, { as: Icon, icon: ['fas', isOpen ? 'chevron-down' : 'chevron-right'], color: "muted", fixedWidth: true, onClick: (e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClick();
            } })));
    const showAsActive = hasActive && !isOpen;
    let elem;
    if (isNodeGroup(item)) {
        elem = (React.createElement(Node, { depth: depth, item: item, meta: meta, showAsActive: showAsActive, onClick: handleClick, onLinkClick: onLinkClick }));
    }
    else {
        elem = React.createElement(Item, { title: item.title, meta: meta, onClick: handleClick, depth: depth, isActive: showAsActive });
    }
    return (React.createElement(React.Fragment, null,
        elem,
        isOpen &&
            item.items.map((groupItem, key) => {
                return React.createElement(GroupItem, { key: key, item: groupItem, depth: depth + 1, onLinkClick: onLinkClick });
            })));
});
const Item = React.memo(({ depth, isActive, id, title, meta, icon, onClick }) => {
    return (React.createElement(Flex, { id: id, bg: { default: isActive ? 'primary-tint' : 'canvas-100', hover: isActive ? undefined : 'canvas-200' }, cursor: "pointer", pl: 4 + depth * 4, pr: 4, h: "md", align: "center", userSelect: "none", onClick: onClick, title: title },
        icon,
        React.createElement(Box, { alignItems: "center", flex: 1, mr: meta ? 1.5 : undefined, ml: icon && 1.5, textOverflow: "truncate" }, title),
        React.createElement(Flex, { alignItems: "center", fontSize: "xs" }, meta)));
});
const Node = React.memo(({ item, depth, meta, showAsActive, onClick, onLinkClick = () => { } }) => {
    const activeId = React.useContext(ActiveIdContext);
    const isActive = activeId === item.slug || activeId === item.id;
    const LinkComponent = React.useContext(LinkContext);
    const handleClick = (e) => {
        if (isActive) {
            e.stopPropagation();
            e.preventDefault();
        }
        else {
            onLinkClick();
        }
        if (onClick) {
            onClick(e, isActive ? undefined : true);
        }
    };
    return (React.createElement(Box, { as: LinkComponent, to: item.slug, display: "block", textDecoration: "no-underline", className: "ElementsTableOfContentsItem" },
        React.createElement(Item, { id: getHtmlIdFromItemId(item.slug || item.id), isActive: isActive || showAsActive, depth: depth, title: item.title, icon: NODE_TYPE_TITLE_ICON[item.type] && (React.createElement(Box, { as: Icon, color: NODE_TYPE_ICON_COLOR[item.type], icon: NODE_TYPE_TITLE_ICON[item.type] })), meta: meta, onClick: handleClick })));
});
const Version = ({ value }) => {
    return (React.createElement(Box, { mr: 2 },
        React.createElement(VersionBadge, { value: value, backgroundColor: "#909DAB" })));
};

const NonIdealState = ({ description, icon, title }) => {
    return (React.createElement(Flex, { flexDirection: "col", alignItems: "center", justifyContent: "center", textAlign: "center", w: "full", h: "full" },
        React.createElement(Box, { as: Icon, icon: icon || ['fas', 'exclamation-triangle'], color: "light", fontSize: "6xl", mb: 4 }),
        React.createElement(Heading, { size: 4, mb: 4 }, title),
        React.createElement(Text, null, description)));
};

const PoweredByLink = ({ source, pathname, packageType, layout = 'sidebar' }) => {
    return (React.createElement(Flex, { as: "a", align: "center", borderT: layout === 'stacked' ? undefined : true, px: layout === 'stacked' ? 1 : 4, py: 3, justify: layout === 'stacked' ? 'end' : undefined, href: `https://stoplight.io/?utm_source=${packageType}&utm_medium=${source}&utm_campaign=powered_by&utm_content=${pathname}`, target: "_blank", rel: "noopener noreferrer" },
        React.createElement(Box, { as: Icon, icon: faBolt, mr: 1, className: "fa-fw", style: { color: 'rgba(144, 97, 249, 1)' } }),
        React.createElement(Box, null,
            "powered by\u00A0",
            React.createElement("strong", null, "Stoplight"))));
};

function withMosaicProvider(WrappedComponent) {
    const WithMosaicProvider = (props) => {
        try {
            const mosaicContext = useMosaicContext();
            if (mosaicContext === null || mosaicContext === void 0 ? void 0 : mosaicContext.providerId) {
                return React__default.createElement(WrappedComponent, Object.assign({}, props));
            }
        }
        catch (_a) {
        }
        return (React__default.createElement(Provider$1, { style: { height: '100%' } },
            React__default.createElement(WrappedComponent, Object.assign({}, props))));
    };
    WithMosaicProvider.displayName = `WithMosaicProvider(${getDisplayName(WrappedComponent)})`;
    return WithMosaicProvider;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 15 * 1000,
        },
    },
});
function withQueryClientProvider(WrappedComponent) {
    const WithQueryClientProvider = (props) => {
        try {
            useQueryClient();
            return React__default.createElement(WrappedComponent, Object.assign({}, props));
        }
        catch (_a) {
        }
        return (React__default.createElement(QueryClientProvider, { client: queryClient },
            React__default.createElement(WrappedComponent, Object.assign({}, props))));
    };
    WithQueryClientProvider.displayName = `WithQueryClientProvider(${getDisplayName(WrappedComponent)})`;
    return WithQueryClientProvider;
}

const RouterComponent = {
    history: BrowserRouter,
    memory: MemoryRouter,
    hash: HashRouter,
    static: StaticRouter,
};
const useRouter = (router, basePath, staticRouterPath) => {
    const Router = RouterComponent[router];
    const routerProps = Object.assign(Object.assign({}, (router !== 'memory' && { basename: basePath })), (router === 'static' && { location: staticRouterPath }));
    return {
        Router,
        routerProps,
    };
};

const components = {
    a: ReactRouterMarkdownLink,
    h2: (_a) => {
        var props = __rest(_a, ["color"]);
        return React.createElement(LinkHeading, Object.assign({ size: 2 }, props));
    },
    h3: (_a) => {
        var props = __rest(_a, ["color"]);
        return React.createElement(LinkHeading, Object.assign({ size: 3 }, props));
    },
    h4: (_a) => {
        var props = __rest(_a, ["color"]);
        return React.createElement(LinkHeading, Object.assign({ size: 4 }, props));
    },
};
function withRouter(WrappedComponent) {
    const WithRouter = (props) => {
        var _a, _b, _c;
        const basePath = (_a = props.basePath) !== null && _a !== void 0 ? _a : '/';
        const staticRouterPath = (_b = props.staticRouterPath) !== null && _b !== void 0 ? _b : '';
        const routerType = (_c = props.router) !== null && _c !== void 0 ? _c : 'history';
        const { Router, routerProps } = useRouter(routerType, basePath, staticRouterPath);
        return (React.createElement(RouterTypeContext.Provider, { value: routerType },
            React.createElement(Router, Object.assign({}, routerProps, { key: basePath }),
                React.createElement(Route, { path: "/" },
                    React.createElement(MarkdownComponentsProvider, { value: components },
                        React.createElement(WrappedComponent, Object.assign({}, props)))))));
    };
    WithRouter.displayName = `WithRouter(${getDisplayName(WrappedComponent)})`;
    return WithRouter;
}

function useBundleRefsIntoDocument(document, options) {
    const [bundledData, setBundledData] = React.useState(document);
    const baseUrl = options === null || options === void 0 ? void 0 : options.baseUrl;
    React.useEffect(() => {
        if (!isObject(document)) {
            setBundledData(document);
            return;
        }
        let isMounted = true;
        doBundle(document, baseUrl)
            .then(res => {
            if (isMounted) {
                setBundledData(Object.assign({}, res));
            }
        })
            .catch(reason => {
            var _a;
            if (typeof reason === 'object' && reason !== null && 'files' in reason) {
                if (isMounted) {
                    setBundledData(Object.assign({}, reason.files.schema));
                }
            }
            else {
                console.warn(`Could bundle: ${(_a = reason === null || reason === void 0 ? void 0 : reason.message) !== null && _a !== void 0 ? _a : 'Unknown error'}`);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [document, baseUrl]);
    return bundledData;
}
const commonBundleOptions = { continueOnError: true };
const doBundle = (data, baseUrl) => {
    if (!baseUrl) {
        return $RefParser.bundle(data, commonBundleOptions);
    }
    else {
        return $RefParser.bundle(baseUrl, data, commonBundleOptions);
    }
};

const scopeClassName = 'sl-elements';
class Styled extends React.Component {
    getChildContext() {
        return {
            blueprintPortalClassName: scopeClassName,
        };
    }
    render() {
        return (React.createElement(Box, { className: "sl-elements sl-antialiased", fontFamily: "ui", fontSize: "base", color: "body", h: "full" }, this.props.children));
    }
}
Styled.childContextTypes = {
    blueprintPortalClassName: PropTypes.string,
};
function withStyles(Component) {
    const Inner = props => {
        return (React.createElement(Styled, null,
            React.createElement(Component, Object.assign({}, props))));
    };
    Inner.displayName = `withStyles(${getDisplayName(Component)})`;
    return Inner;
}

const createElementClass = (Component, propDescriptors) => {
    return class extends HTMLElement {
        constructor() {
            super();
            this._props = {};
            Object.defineProperties(this, mapValues(propDescriptors, (_, key) => ({
                get: () => {
                    return this._props[key];
                },
                set: (newValue) => {
                    if (this._props[key] === newValue) {
                        return;
                    }
                    this._props[key] = newValue;
                    this._renderComponent();
                    this._safeWriteAttribute(key, newValue);
                },
                enumerable: true,
            })));
        }
        static get observedAttributes() {
            return Object.keys(propDescriptors);
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (propDescriptors[name]) {
                const newPropValue = this._safeReadAttribute(name);
                if (!isEqual(this._props[name], newPropValue)) {
                    this._props[name] = newPropValue;
                    this._renderComponent();
                }
            }
        }
        connectedCallback() {
            this._mountPoint = document.createElement('div');
            this._mountPoint.style.height = '100%';
            this.appendChild(this._mountPoint);
            for (const key in propDescriptors) {
                if (propDescriptors.hasOwnProperty(key)) {
                    this._props[key] = this._safeReadAttribute(key);
                }
            }
            this._renderComponent();
        }
        disconnectedCallback() {
            if (this._mountPoint) {
                ReactDOM.unmountComponentAtNode(this._mountPoint);
                this.removeChild(this._mountPoint);
                this._mountPoint = undefined;
            }
        }
        _safeReadAttribute(attrName) {
            if (!this.hasAttribute(attrName) || !propDescriptors[attrName]) {
                return undefined;
            }
            const attrValue = this.getAttribute(attrName);
            const type = propDescriptors[attrName].type;
            if (type === 'string') {
                return (attrValue !== null && attrValue !== void 0 ? attrValue : undefined);
            }
            if (type === 'number') {
                return (attrValue ? Number(attrValue) : undefined);
            }
            if (type === 'boolean') {
                return (attrValue ? Boolean(attrValue) : undefined);
            }
            if (type === 'object') {
                return safeParse(attrValue !== null && attrValue !== void 0 ? attrValue : '');
            }
            return undefined;
        }
        _safeWriteAttribute(attrName, newValue) {
            if (!propDescriptors[attrName]) {
                return;
            }
            if (!newValue) {
                this.removeAttribute(attrName);
                return;
            }
            const type = propDescriptors[attrName].type;
            this.setAttribute(attrName, stringifyValue(newValue));
            function stringifyValue(val) {
                if (type === 'string' || type === 'number' || type === 'boolean') {
                    return String(val);
                }
                if (type === 'object') {
                    return safeStringify(val) || '';
                }
                return '';
            }
        }
        _renderComponent() {
            if (this._mountPoint) {
                const props = mapValues(propDescriptors, (descriptor, key) => { var _a; return (_a = this._props[key]) !== null && _a !== void 0 ? _a : descriptor.defaultValue; });
                ReactDOM.render(React.createElement(Component, props), this._mountPoint);
            }
        }
    };
};

export { DeprecatedBadge, Docs, ExportButton, HttpMethodColors, InlineRefResolverProvider, Logo, MarkdownComponentsProvider, MockingProvider, NodeTypeColors, NodeTypeIconDefs, NodeTypePrettyName, NonIdealState, ParsedDocs, PersistenceContextProvider, PoweredByLink, ReactRouterMarkdownLink, SidebarLayout, Styled, TableOfContents, TryIt, TryItWithRequestSamples, createElementClass, createResolvedObject, findFirstNode, isHttpOperation, isHttpService, slugify, useBundleRefsIntoDocument, useParsedData, useParsedValue, useRouter, withMosaicProvider, withPersistenceBoundary, withQueryClientProvider, withRouter, withStyles };
