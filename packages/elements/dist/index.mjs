import { isHttpOperation, isHttpWebhookOperation, isHttpService, resolveUrl, HttpMethodColors, DeprecatedBadge, ParsedDocs, TryItWithRequestSamples, Docs, resolveRelativeLink, ResponsiveSidebarLayout, ElementsOptionsProvider, SidebarLayout, Logo, TableOfContents, PoweredByLink, slugify, withRouter, withStyles, withPersistenceBoundary, withMosaicProvider, withQueryClientProvider, useResponsiveLayout, useParsedValue, useBundleRefsIntoDocument, NonIdealState, InlineRefResolverProvider } from '@stoplight/elements-core';
import { Box, Flex, Icon, Tabs, TabList, Tab, TabPanels, TabPanel, Heading } from '@stoplight/mosaic';
import { NodeType } from '@stoplight/types';
import cn from 'classnames';
import * as React from 'react';
import defaults from 'lodash/defaults.js';
import flow from 'lodash/flow.js';
import { useQuery } from 'react-query';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { safeStringify } from '@stoplight/yaml';
import saver from 'file-saver';
import { OPERATION_CONFIG, WEBHOOK_CONFIG } from '@stoplight/http-spec/oas';
import { transformOas2Service, transformOas2Operation } from '@stoplight/http-spec/oas2';
import { transformOas3Service, transformOas3Operation } from '@stoplight/http-spec/oas3';
import { encodePointerFragment, pointerToPath } from '@stoplight/json';
import get from 'lodash/get.js';
import isObject from 'lodash/isObject.js';
import last from 'lodash/last.js';

function computeTagGroups(serviceNode, nodeType) {
    const groupsByTagId = {};
    const ungrouped = [];
    const lowerCaseServiceTags = serviceNode.tags.map(tn => tn.toLowerCase());
    const groupableNodes = serviceNode.children.filter(n => n.type === nodeType);
    for (const node of groupableNodes) {
        for (const tagName of node.tags) {
            const tagId = tagName.toLowerCase();
            if (groupsByTagId[tagId]) {
                groupsByTagId[tagId].items.push(node);
            }
            else {
                const serviceTagIndex = lowerCaseServiceTags.findIndex(tn => tn === tagId);
                const serviceTagName = serviceNode.tags[serviceTagIndex];
                groupsByTagId[tagId] = {
                    title: serviceTagName || tagName,
                    items: [node],
                };
            }
        }
        if (node.tags.length === 0) {
            ungrouped.push(node);
        }
    }
    const orderedTagGroups = Object.entries(groupsByTagId)
        .sort(([g1], [g2]) => {
        const g1LC = g1.toLowerCase();
        const g2LC = g2.toLowerCase();
        const g1Idx = lowerCaseServiceTags.findIndex(tn => tn === g1LC);
        const g2Idx = lowerCaseServiceTags.findIndex(tn => tn === g2LC);
        if (g1Idx < 0 && g2Idx < 0)
            return 0;
        if (g1Idx < 0)
            return 1;
        if (g2Idx < 0)
            return -1;
        return g1Idx - g2Idx;
    })
        .map(([, tagGroup]) => tagGroup);
    return { groups: orderedTagGroups, ungrouped };
}
const defaultComputerAPITreeConfig = {
    hideSchemas: false,
    hideInternal: false,
};
const computeAPITree = (serviceNode, config = {}) => {
    const mergedConfig = defaults(config, defaultComputerAPITreeConfig);
    const tree = [];
    tree.push({
        id: '/',
        slug: '/',
        title: 'Overview',
        type: 'overview',
        meta: '',
    });
    const hasOperationNodes = serviceNode.children.some(node => node.type === NodeType.HttpOperation);
    if (hasOperationNodes) {
        tree.push({
            title: 'Endpoints',
        });
        const { groups, ungrouped } = computeTagGroups(serviceNode, NodeType.HttpOperation);
        addTagGroupsToTree(groups, ungrouped, tree, NodeType.HttpOperation, mergedConfig.hideInternal);
    }
    const hasWebhookNodes = serviceNode.children.some(node => node.type === NodeType.HttpWebhook);
    if (hasWebhookNodes) {
        tree.push({
            title: 'Webhooks',
        });
        const { groups, ungrouped } = computeTagGroups(serviceNode, NodeType.HttpWebhook);
        addTagGroupsToTree(groups, ungrouped, tree, NodeType.HttpWebhook, mergedConfig.hideInternal);
    }
    let schemaNodes = serviceNode.children.filter(node => node.type === NodeType.Model);
    if (mergedConfig.hideInternal) {
        schemaNodes = schemaNodes.filter(n => !isInternal(n));
    }
    if (!mergedConfig.hideSchemas && schemaNodes.length) {
        tree.push({
            title: 'Schemas',
        });
        const { groups, ungrouped } = computeTagGroups(serviceNode, NodeType.Model);
        addTagGroupsToTree(groups, ungrouped, tree, NodeType.Model, mergedConfig.hideInternal);
    }
    return tree;
};
const findFirstNodeSlug = (tree) => {
    for (const item of tree) {
        if ('slug' in item) {
            return item.slug;
        }
        if ('items' in item) {
            const slug = findFirstNodeSlug(item.items);
            if (slug) {
                return slug;
            }
        }
    }
    return;
};
const isInternal = (node) => {
    const data = node.data;
    if (isHttpOperation(data) || isHttpWebhookOperation(data)) {
        return !!data.internal;
    }
    if (isHttpService(data)) {
        return false;
    }
    return !!data['x-internal'];
};
const addTagGroupsToTree = (groups, ungrouped, tree, itemsType, hideInternal) => {
    ungrouped.forEach(node => {
        if (hideInternal && isInternal(node)) {
            return;
        }
        tree.push({
            id: node.uri,
            slug: node.uri,
            title: node.name,
            type: node.type,
            meta: isHttpOperation(node.data) || isHttpWebhookOperation(node.data) ? node.data.method : '',
        });
    });
    groups.forEach(group => {
        const items = group.items.flatMap(node => {
            if (hideInternal && isInternal(node)) {
                return [];
            }
            return {
                id: node.uri,
                slug: node.uri,
                title: node.name,
                type: node.type,
                meta: isHttpOperation(node.data) || isHttpWebhookOperation(node.data) ? node.data.method : '',
            };
        });
        if (items.length > 0) {
            tree.push({
                title: group.title,
                items,
                itemsType,
            });
        }
    });
};
const resolveRelativePath = (currentPath, basePath, outerRouter) => {
    if (!outerRouter || !basePath || basePath === '/') {
        return currentPath;
    }
    const baseUrl = resolveUrl(basePath);
    const currentUrl = resolveUrl(currentPath);
    return baseUrl && currentUrl && baseUrl !== currentUrl ? currentUrl.replace(baseUrl, '') : '/';
};

const itemMatchesHash = (hash, item) => {
    if (item.type === NodeType.HttpOperation) {
        return hash.substr(1) === `${item.data.path}-${item.data.method}`;
    }
    else {
        return hash.substr(1) === `${item.data.name}-${item.data.method}`;
    }
};
const TryItContext = React.createContext({
    hideTryIt: false,
    hideTryItPanel: false,
    hideSamples: false,
    tryItCredentialsPolicy: 'omit',
});
TryItContext.displayName = 'TryItContext';
const LocationContext = React.createContext({
    location: {
        hash: '',
        key: '',
        pathname: '',
        search: '',
        state: '',
    },
});
LocationContext.displayName = 'LocationContext';
const APIWithStackedLayout = ({ serviceNode, hideTryItPanel, hideTryIt, hideSamples, hideExport, hideSecurityInfo, hideServerInfo, exportProps, tryItCredentialsPolicy, tryItCorsProxy, renderExtensionAddon, showPoweredByLink = true, location, }) => {
    const { groups: operationGroups } = computeTagGroups(serviceNode, NodeType.HttpOperation);
    const { groups: webhookGroups } = computeTagGroups(serviceNode, NodeType.HttpWebhook);
    return (React.createElement(LocationContext.Provider, { value: { location } },
        React.createElement(TryItContext.Provider, { value: { hideTryItPanel, hideTryIt, hideSamples, tryItCredentialsPolicy, corsProxy: tryItCorsProxy } },
            React.createElement(Flex, { w: "full", flexDirection: "col", m: "auto", className: "sl-max-w-4xl" },
                React.createElement(Box, { w: "full", borderB: true },
                    React.createElement(Docs, { className: "sl-mx-auto", nodeData: serviceNode.data, nodeTitle: serviceNode.name, nodeType: NodeType.HttpService, location: location, layoutOptions: { showPoweredByLink, hideExport, hideSecurityInfo, hideServerInfo }, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, renderExtensionAddon: renderExtensionAddon })),
                operationGroups.length > 0 && webhookGroups.length > 0 ? React.createElement(Heading, { size: 2 }, "Endpoints") : null,
                operationGroups.map(group => (React.createElement(Group, { key: group.title, group: group }))),
                webhookGroups.length > 0 ? React.createElement(Heading, { size: 2 }, "Webhooks") : null,
                webhookGroups.map(group => (React.createElement(Group, { key: group.title, group: group })))))));
};
APIWithStackedLayout.displayName = 'APIWithStackedLayout';
const Group = React.memo(({ group }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const scrollRef = React.useRef(null);
    const { location: { hash }, } = React.useContext(LocationContext);
    const urlHashMatches = hash.substr(1) === group.title;
    const onClick = React.useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);
    const shouldExpand = React.useMemo(() => {
        return urlHashMatches || group.items.some(item => itemMatchesHash(hash, item));
    }, [group, hash, urlHashMatches]);
    React.useEffect(() => {
        var _a;
        if (shouldExpand) {
            setIsExpanded(true);
            if (urlHashMatches && ((_a = scrollRef === null || scrollRef === void 0 ? void 0 : scrollRef.current) === null || _a === void 0 ? void 0 : _a.offsetTop)) {
                window.scrollTo(0, scrollRef.current.offsetTop);
            }
        }
    }, [shouldExpand, urlHashMatches, group, hash]);
    return (React.createElement(Box, null,
        React.createElement(Flex, { ref: scrollRef, onClick: onClick, mx: "auto", justifyContent: "between", alignItems: "center", borderB: true, px: 2, py: 4, cursor: "pointer", color: { default: 'current', hover: 'muted' } },
            React.createElement(Box, { fontSize: "lg", fontWeight: "medium" }, group.title),
            React.createElement(Icon, { className: "sl-mr-2", icon: isExpanded ? 'chevrons-down' : 'chevrons-right', size: "sm" })),
        React.createElement(Collapse, { isOpen: isExpanded }, group.items.map(item => {
            return React.createElement(Item, { key: item.uri, item: item });
        }))));
});
Group.displayName = 'Group';
const Item = React.memo(({ item }) => {
    const { location } = React.useContext(LocationContext);
    const { hash } = location;
    const [isExpanded, setIsExpanded] = React.useState(false);
    const scrollRef = React.useRef(null);
    const color = HttpMethodColors[item.data.method] || 'gray';
    const isDeprecated = !!item.data.deprecated;
    const { hideTryIt, hideSamples, hideTryItPanel, tryItCredentialsPolicy, corsProxy } = React.useContext(TryItContext);
    const onClick = React.useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);
    React.useEffect(() => {
        var _a;
        if (itemMatchesHash(hash, item)) {
            setIsExpanded(true);
            if ((_a = scrollRef === null || scrollRef === void 0 ? void 0 : scrollRef.current) === null || _a === void 0 ? void 0 : _a.offsetTop) {
                window.scrollTo(0, scrollRef.current.offsetTop);
            }
        }
    }, [hash, item]);
    return (React.createElement(Box, { ref: scrollRef, w: "full", my: 2, border: true, borderColor: { default: isExpanded ? 'light' : 'transparent', hover: 'light' }, bg: { default: isExpanded ? 'code' : 'transparent', hover: 'code' } },
        React.createElement(Flex, { mx: "auto", alignItems: "center", cursor: "pointer", fontSize: "lg", p: 2, onClick: onClick, color: "current" },
            React.createElement(Box, { w: 24, textTransform: "uppercase", textAlign: "center", fontWeight: "semibold", border: true, rounded: true, px: 2, bg: "canvas", className: cn(`sl-mr-5 sl-text-base`, `sl-text-${color}`, `sl-border-${color}`) }, item.data.method || 'UNKNOWN'),
            React.createElement(Box, { flex: 1, fontWeight: "medium", wordBreak: "all" }, item.type === NodeType.HttpOperation ? item.data.path : item.name),
            isDeprecated && React.createElement(DeprecatedBadge, null)),
        React.createElement(Collapse, { isOpen: isExpanded },
            React.createElement(Box, { flex: 1, p: 2, fontWeight: "medium", mx: "auto", fontSize: "xl" }, item.name),
            hideTryItPanel ? (React.createElement(Box, { as: ParsedDocs, layoutOptions: { noHeading: true, hideTryItPanel: true, hideSamples, hideTryIt }, node: item, p: 4 })) : (React.createElement(Tabs, { appearance: "line" },
                React.createElement(TabList, null,
                    React.createElement(Tab, null, "Docs"),
                    React.createElement(Tab, null, "TryIt")),
                React.createElement(TabPanels, null,
                    React.createElement(TabPanel, null,
                        React.createElement(ParsedDocs, { className: "sl-px-4", node: item, location: location, layoutOptions: { noHeading: true, hideTryItPanel: false, hideSamples, hideTryIt } })),
                    React.createElement(TabPanel, null,
                        React.createElement(TryItWithRequestSamples, { httpOperation: item.data, tryItCredentialsPolicy: tryItCredentialsPolicy, corsProxy: corsProxy, hideSamples: hideSamples, hideTryIt: hideTryIt }))))))));
});
Item.displayName = 'Item';
const Collapse = ({ isOpen, children }) => {
    if (!isOpen)
        return null;
    return React.createElement(Box, null, children);
};
Collapse.displayName = 'Collapse';

const APIWithResponsiveSidebarLayout = ({ serviceNode, logo, hideTryItPanel, hideTryIt, hideSamples, compact, hideSchemas, hideInternal, hideExport, hideServerInfo, hideSecurityInfo, exportProps, tryItCredentialsPolicy, tryItCorsProxy, renderExtensionAddon, basePath = '/', outerRouter = false, }) => {
    const container = React.useRef(null);
    const tree = React.useMemo(() => computeAPITree(serviceNode, { hideSchemas, hideInternal }), [serviceNode, hideSchemas, hideInternal]);
    const location = useLocation();
    const { pathname: currentPath } = location;
    const relativePath = resolveRelativePath(currentPath, basePath, outerRouter);
    const isRootPath = relativePath === '/';
    const node = isRootPath ? serviceNode : serviceNode.children.find(child => child.uri === relativePath);
    const layoutOptions = React.useMemo(() => ({
        hideTryIt: hideTryIt,
        hideTryItPanel,
        hideSamples,
        hideSecurityInfo: hideSecurityInfo,
        hideServerInfo: hideServerInfo,
        compact: compact,
        hideExport: hideExport || (node === null || node === void 0 ? void 0 : node.type) !== NodeType.HttpService,
    }), [hideTryIt, hideSecurityInfo, hideServerInfo, compact, hideExport, hideTryItPanel, hideSamples, node === null || node === void 0 ? void 0 : node.type]);
    if (!node) {
        const firstSlug = findFirstNodeSlug(tree);
        if (firstSlug) {
            return React.createElement(Navigate, { to: resolveRelativeLink(firstSlug), replace: true });
        }
    }
    if (hideInternal && node && isInternal(node)) {
        return React.createElement(Navigate, { to: ".", replace: true });
    }
    const handleTocClick = () => {
        if (container.current) {
            container.current.scrollIntoView();
        }
    };
    return (React.createElement(ResponsiveSidebarLayout, { onTocClick: handleTocClick, tree: tree, logo: logo !== null && logo !== void 0 ? logo : serviceNode.data.logo, ref: container, name: serviceNode.name }, node && (React.createElement(ElementsOptionsProvider, { renderExtensionAddon: renderExtensionAddon },
        React.createElement(ParsedDocs, { key: relativePath, uri: relativePath, node: node, nodeTitle: node.name, layoutOptions: layoutOptions, location: location, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon })))));
};

const APIWithSidebarLayout = ({ serviceNode, logo, hideTryItPanel, hideTryIt, hideSamples, hideSchemas, hideSecurityInfo, hideServerInfo, hideInternal, hideExport, exportProps, tryItCredentialsPolicy, tryItCorsProxy, renderExtensionAddon, basePath = '/', outerRouter = false, }) => {
    const container = React.useRef(null);
    const tree = React.useMemo(() => computeAPITree(serviceNode, { hideSchemas, hideInternal }), [serviceNode, hideSchemas, hideInternal]);
    const location = useLocation();
    const { pathname: currentPath } = location;
    const relativePath = resolveRelativePath(currentPath, basePath, outerRouter);
    const isRootPath = relativePath === '/';
    const node = isRootPath ? serviceNode : serviceNode.children.find(child => child.uri === relativePath);
    const layoutOptions = React.useMemo(() => ({
        hideTryIt: hideTryIt,
        hideTryItPanel,
        hideSamples,
        hideServerInfo: hideServerInfo,
        hideSecurityInfo: hideSecurityInfo,
        hideExport: hideExport || (node === null || node === void 0 ? void 0 : node.type) !== NodeType.HttpService,
    }), [hideTryIt, hideServerInfo, hideSecurityInfo, hideExport, hideTryItPanel, hideSamples, node === null || node === void 0 ? void 0 : node.type]);
    if (!node) {
        const firstSlug = findFirstNodeSlug(tree);
        if (firstSlug) {
            return React.createElement(Navigate, { to: resolveRelativeLink(firstSlug), replace: true });
        }
    }
    if (hideInternal && node && isInternal(node)) {
        return React.createElement(Navigate, { to: ".", replace: true });
    }
    const sidebar = (React.createElement(Sidebar, { serviceNode: serviceNode, logo: logo, container: container, pathname: relativePath, tree: tree }));
    return (React.createElement(SidebarLayout, { ref: container, sidebar: sidebar }, node && (React.createElement(ElementsOptionsProvider, { renderExtensionAddon: renderExtensionAddon },
        React.createElement(ParsedDocs, { key: relativePath, uri: relativePath, node: node, nodeTitle: node.name, layoutOptions: layoutOptions, location: location, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon })))));
};
const Sidebar = ({ serviceNode, logo, container, pathname, tree }) => {
    const handleTocClick = () => {
        if (container.current) {
            container.current.scrollIntoView();
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Flex, { ml: 4, mb: 5, alignItems: "center" },
            logo ? (React.createElement(Logo, { logo: { url: logo, altText: 'logo' } })) : (serviceNode.data.logo && React.createElement(Logo, { logo: serviceNode.data.logo })),
            React.createElement(Heading, { size: 4 }, serviceNode.name)),
        React.createElement(Flex, { flexGrow: true, flexShrink: true, overflowY: "auto", direction: "col" },
            React.createElement(TableOfContents, { tree: tree, activeId: pathname, Link: Link, onLinkClick: handleTocClick })),
        React.createElement(PoweredByLink, { source: serviceNode.name, pathname: pathname, packageType: "elements" })));
};
Sidebar.displayName = 'Sidebar';

var NodeTypes;
(function (NodeTypes) {
    NodeTypes["Paths"] = "paths";
    NodeTypes["Path"] = "path";
    NodeTypes["Operation"] = "operation";
    NodeTypes["Webhooks"] = "webhooks";
    NodeTypes["Webhook"] = "webhook";
    NodeTypes["Components"] = "components";
    NodeTypes["Models"] = "models";
    NodeTypes["Model"] = "model";
})(NodeTypes || (NodeTypes = {}));

const oas2SourceMap = [
    {
        match: 'paths',
        type: NodeTypes.Paths,
        children: [
            {
                notMatch: '^x-',
                type: NodeTypes.Path,
                children: [
                    {
                        match: 'get|post|put|delete|options|head|patch|trace',
                        type: NodeTypes.Operation,
                    },
                ],
            },
        ],
    },
    {
        match: 'definitions',
        type: NodeTypes.Models,
        children: [
            {
                notMatch: '^x-',
                type: NodeTypes.Model,
            },
        ],
    },
];

const oas3SourceMap = [
    {
        match: 'paths',
        type: NodeTypes.Paths,
        children: [
            {
                notMatch: '^x-',
                type: NodeTypes.Path,
                children: [
                    {
                        match: 'get|post|put|delete|options|head|patch|trace',
                        type: NodeTypes.Operation,
                    },
                ],
            },
        ],
    },
    {
        match: 'webhooks',
        type: NodeTypes.Webhooks,
        children: [
            {
                notMatch: '^x-',
                type: NodeTypes.Webhook,
                children: [
                    {
                        match: 'get|post|put|delete|options|head|patch|trace',
                        type: NodeTypes.Webhook,
                    },
                ],
            },
        ],
    },
    {
        match: 'components',
        type: NodeTypes.Components,
        children: [
            {
                match: 'schemas',
                type: NodeTypes.Models,
                children: [
                    {
                        notMatch: '^x-',
                        type: NodeTypes.Model,
                    },
                ],
            },
        ],
    },
];

const isOas2 = (parsed) => isObject(parsed) &&
    'swagger' in parsed &&
    Number.parseInt(String(parsed.swagger)) === 2;
const isOas3 = (parsed) => isObject(parsed) &&
    'openapi' in parsed &&
    Number.parseFloat(String(parsed.openapi)) >= 3;
const isOas31 = (parsed) => isObject(parsed) &&
    'openapi' in parsed &&
    Number.parseFloat(String(parsed.openapi)) === 3.1;
const OAS_MODEL_REGEXP = /((definitions|components)\/?(schemas)?)\//;
function transformOasToServiceNode(apiDescriptionDocument) {
    if (isOas31(apiDescriptionDocument)) {
        return computeServiceNode(Object.assign(Object.assign({}, apiDescriptionDocument), { jsonSchemaDialect: 'http://json-schema.org/draft-07/schema#' }), oas3SourceMap, transformOas3Service, transformOas3Operation);
    }
    if (isOas3(apiDescriptionDocument)) {
        return computeServiceNode(apiDescriptionDocument, oas3SourceMap, transformOas3Service, transformOas3Operation);
    }
    else if (isOas2(apiDescriptionDocument)) {
        return computeServiceNode(apiDescriptionDocument, oas2SourceMap, transformOas2Service, transformOas2Operation);
    }
    return null;
}
function computeServiceNode(document, map, transformService, transformOperation) {
    var _a;
    const serviceDocument = transformService({ document });
    const serviceNode = {
        type: NodeType.HttpService,
        uri: '/',
        name: serviceDocument.name,
        data: serviceDocument,
        tags: ((_a = serviceDocument.tags) === null || _a === void 0 ? void 0 : _a.map(tag => tag.name)) || [],
        children: computeChildNodes(document, document, map, transformOperation),
    };
    return serviceNode;
}
function computeChildNodes(document, data, map, transformer, parentUri = '') {
    var _a, _b;
    const nodes = [];
    if (!isObject(data))
        return nodes;
    for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = encodePointerFragment(key);
        const match = findMapMatch(sanitizedKey, map);
        if (match) {
            const uri = `${parentUri}/${sanitizedKey}`;
            const jsonPath = pointerToPath(`#${uri}`);
            if (match.type === NodeTypes.Operation && jsonPath.length === 3) {
                const path = String(jsonPath[1]);
                const method = String(jsonPath[2]);
                const operationDocument = transformer({
                    document,
                    name: path,
                    method,
                    config: OPERATION_CONFIG,
                });
                let parsedUri;
                const encodedPath = String(encodePointerFragment(path));
                if (operationDocument.iid) {
                    parsedUri = `/operations/${operationDocument.iid}`;
                }
                else {
                    parsedUri = uri.replace(encodedPath, slugify(path));
                }
                nodes.push({
                    type: NodeType.HttpOperation,
                    uri: parsedUri,
                    data: operationDocument,
                    name: operationDocument.summary || operationDocument.iid || operationDocument.path,
                    tags: ((_a = operationDocument.tags) === null || _a === void 0 ? void 0 : _a.map(tag => tag.name)) || [],
                });
            }
            else if (match.type === NodeTypes.Webhook && jsonPath.length === 3) {
                const name = String(jsonPath[1]);
                const method = String(jsonPath[2]);
                const webhookDocument = transformer({
                    document,
                    name,
                    method,
                    config: WEBHOOK_CONFIG,
                });
                let parsedUri;
                const encodedPath = String(encodePointerFragment(name));
                if (webhookDocument.iid) {
                    parsedUri = `/webhooks/${webhookDocument.iid}`;
                }
                else {
                    parsedUri = uri.replace(encodedPath, slugify(name));
                }
                nodes.push({
                    type: NodeType.HttpWebhook,
                    uri: parsedUri,
                    data: webhookDocument,
                    name: webhookDocument.summary || webhookDocument.name,
                    tags: ((_b = webhookDocument.tags) === null || _b === void 0 ? void 0 : _b.map(tag => tag.name)) || [],
                });
            }
            else if (match.type === NodeTypes.Model) {
                const schemaDocument = get(document, jsonPath);
                const parsedUri = uri.replace(OAS_MODEL_REGEXP, 'schemas/');
                nodes.push({
                    type: NodeType.Model,
                    uri: parsedUri,
                    data: schemaDocument,
                    name: schemaDocument.title || last(uri.split('/')) || '',
                    tags: schemaDocument['x-tags'] || [],
                });
            }
            if (match.children) {
                nodes.push(...computeChildNodes(document, value, match.children, transformer, uri));
            }
        }
    }
    return nodes;
}
function findMapMatch(key, map) {
    var _a;
    if (typeof key === 'number')
        return;
    for (const entry of map) {
        const escapedKey = key.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
        if (!!((_a = entry.match) === null || _a === void 0 ? void 0 : _a.match(escapedKey)) || (entry.notMatch !== void 0 && !entry.notMatch.match(escapedKey))) {
            return entry;
        }
    }
}
function isJson(value) {
    try {
        JSON.parse(value);
    }
    catch (e) {
        return false;
    }
    return true;
}

function useExportDocumentProps({ originalDocument, bundledDocument, }) {
    const isJsonDocument = typeof originalDocument === 'object' || (!!originalDocument && isJson(originalDocument));
    const exportDocument = React.useCallback((document) => {
        const type = isJsonDocument ? 'json' : 'yaml';
        const blob = new Blob([document], {
            type: `application/${type}`,
        });
        saver.saveAs(blob, `document.${type}`);
    }, [isJsonDocument]);
    const exportOriginalDocument = React.useCallback(() => {
        const stringifiedDocument = typeof originalDocument === 'object' ? JSON.stringify(originalDocument, null, 2) : originalDocument || '';
        exportDocument(stringifiedDocument);
    }, [originalDocument, exportDocument]);
    const exportBundledDocument = React.useCallback(() => {
        const stringifiedDocument = isJsonDocument
            ? JSON.stringify(bundledDocument, null, 2)
            : safeStringify(bundledDocument);
        exportDocument(stringifiedDocument);
    }, [bundledDocument, isJsonDocument, exportDocument]);
    return {
        original: {
            onPress: exportOriginalDocument,
        },
        bundled: {
            onPress: exportBundledDocument,
        },
    };
}

const propsAreWithDocument = (props) => {
    return props.hasOwnProperty('apiDescriptionDocument');
};
const APIImpl = props => {
    const { layout = 'sidebar', apiDescriptionUrl = '', logo, hideTryItPanel, hideTryIt, hideSamples, hideSecurityInfo, hideServerInfo, hideSchemas, hideInternal, hideExport, tryItCredentialsPolicy, tryItCorsProxy, maxRefDepth, renderExtensionAddon, basePath, outerRouter = false, } = props;
    const location = useLocation();
    const apiDescriptionDocument = propsAreWithDocument(props) ? props.apiDescriptionDocument : undefined;
    const { isResponsiveLayoutEnabled } = useResponsiveLayout();
    const { data: fetchedDocument, error } = useQuery([apiDescriptionUrl], () => fetch(apiDescriptionUrl).then(res => {
        if (res.ok) {
            return res.text();
        }
        throw new Error(`Unable to load description document, status code: ${res.status}`);
    }), {
        enabled: apiDescriptionUrl !== '' && !apiDescriptionDocument,
    });
    const document = apiDescriptionDocument || fetchedDocument || '';
    const parsedDocument = useParsedValue(document);
    const bundledDocument = useBundleRefsIntoDocument(parsedDocument, { baseUrl: apiDescriptionUrl });
    const serviceNode = React.useMemo(() => transformOasToServiceNode(bundledDocument), [bundledDocument]);
    const exportProps = useExportDocumentProps({ originalDocument: document, bundledDocument });
    if (error) {
        return (React.createElement(Flex, { justify: "center", alignItems: "center", w: "full", minH: "screen" },
            React.createElement(NonIdealState, { title: "Document could not be loaded", description: "The API description document could not be fetched. This could indicate connectivity problems, or issues with the server hosting the spec.", icon: "exclamation-triangle" })));
    }
    if (!bundledDocument) {
        return (React.createElement(Flex, { justify: "center", alignItems: "center", w: "full", minH: "screen", color: "light" },
            React.createElement(Box, { as: Icon, icon: ['fal', 'circle-notch'], size: "3x", spin: true })));
    }
    if (!serviceNode) {
        return (React.createElement(Flex, { justify: "center", alignItems: "center", w: "full", minH: "screen" },
            React.createElement(NonIdealState, { title: "Failed to parse OpenAPI file", description: "Please make sure your OpenAPI file is valid and try again" })));
    }
    return (React.createElement(InlineRefResolverProvider, { document: parsedDocument, maxRefDepth: maxRefDepth },
        layout === 'stacked' && (React.createElement(APIWithStackedLayout, { serviceNode: serviceNode, hideTryIt: hideTryIt, hideSamples: hideSamples, hideTryItPanel: hideTryItPanel, hideSecurityInfo: hideSecurityInfo, hideServerInfo: hideServerInfo, hideExport: hideExport, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon, location: location })),
        layout === 'sidebar' && (React.createElement(APIWithSidebarLayout, { logo: logo, serviceNode: serviceNode, hideTryItPanel: hideTryItPanel, hideTryIt: hideTryIt, hideSamples: hideSamples, hideSecurityInfo: hideSecurityInfo, hideServerInfo: hideServerInfo, hideSchemas: hideSchemas, hideInternal: hideInternal, hideExport: hideExport, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon, basePath: basePath, outerRouter: outerRouter })),
        layout === 'responsive' && (React.createElement(APIWithResponsiveSidebarLayout, { logo: logo, serviceNode: serviceNode, hideTryItPanel: hideTryItPanel, hideTryIt: hideTryIt, hideSamples: hideSamples, hideSecurityInfo: hideSecurityInfo, hideServerInfo: hideServerInfo, hideSchemas: hideSchemas, hideInternal: hideInternal, hideExport: hideExport, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon, compact: isResponsiveLayoutEnabled, basePath: basePath, outerRouter: outerRouter }))));
};
const API = flow(withRouter, withStyles, withPersistenceBoundary, withMosaicProvider, withQueryClientProvider)(APIImpl);

export { API, APIWithStackedLayout, transformOasToServiceNode, useExportDocumentProps };
