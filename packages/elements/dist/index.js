'use strict';

var elementsCore = require('@stoplight/elements-core');
var mosaic = require('@stoplight/mosaic');
var types = require('@stoplight/types');
var cn = require('classnames');
var React = require('react');
var defaults = require('lodash/defaults.js');
var flow = require('lodash/flow.js');
var reactQuery = require('react-query');
var reactRouterDom = require('react-router-dom');
var yaml = require('@stoplight/yaml');
var saver = require('file-saver');
var oas = require('@stoplight/http-spec/oas');
var oas2 = require('@stoplight/http-spec/oas2');
var oas3 = require('@stoplight/http-spec/oas3');
var json = require('@stoplight/json');
var get = require('lodash/get.js');
var isObject = require('lodash/isObject.js');
var last = require('lodash/last.js');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

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
    const hasOperationNodes = serviceNode.children.some(node => node.type === types.NodeType.HttpOperation);
    if (hasOperationNodes) {
        tree.push({
            title: 'Endpoints',
        });
        const { groups, ungrouped } = computeTagGroups(serviceNode, types.NodeType.HttpOperation);
        addTagGroupsToTree(groups, ungrouped, tree, types.NodeType.HttpOperation, mergedConfig.hideInternal);
    }
    const hasWebhookNodes = serviceNode.children.some(node => node.type === types.NodeType.HttpWebhook);
    if (hasWebhookNodes) {
        tree.push({
            title: 'Webhooks',
        });
        const { groups, ungrouped } = computeTagGroups(serviceNode, types.NodeType.HttpWebhook);
        addTagGroupsToTree(groups, ungrouped, tree, types.NodeType.HttpWebhook, mergedConfig.hideInternal);
    }
    let schemaNodes = serviceNode.children.filter(node => node.type === types.NodeType.Model);
    if (mergedConfig.hideInternal) {
        schemaNodes = schemaNodes.filter(n => !isInternal(n));
    }
    if (!mergedConfig.hideSchemas && schemaNodes.length) {
        tree.push({
            title: 'Schemas',
        });
        const { groups, ungrouped } = computeTagGroups(serviceNode, types.NodeType.Model);
        addTagGroupsToTree(groups, ungrouped, tree, types.NodeType.Model, mergedConfig.hideInternal);
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
    if (elementsCore.isHttpOperation(data) || elementsCore.isHttpWebhookOperation(data)) {
        return !!data.internal;
    }
    if (elementsCore.isHttpService(data)) {
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
            meta: elementsCore.isHttpOperation(node.data) || elementsCore.isHttpWebhookOperation(node.data) ? node.data.method : '',
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
                meta: elementsCore.isHttpOperation(node.data) || elementsCore.isHttpWebhookOperation(node.data) ? node.data.method : '',
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
    const baseUrl = elementsCore.resolveUrl(basePath);
    const currentUrl = elementsCore.resolveUrl(currentPath);
    return baseUrl && currentUrl && baseUrl !== currentUrl ? currentUrl.replace(baseUrl, '') : '/';
};

const itemMatchesHash = (hash, item) => {
    if (item.type === types.NodeType.HttpOperation) {
        return hash.substr(1) === `${item.data.path}-${item.data.method}`;
    }
    else {
        return hash.substr(1) === `${item.data.name}-${item.data.method}`;
    }
};
const TryItContext = React__namespace.createContext({
    hideTryIt: false,
    hideTryItPanel: false,
    hideSamples: false,
    tryItCredentialsPolicy: 'omit',
});
TryItContext.displayName = 'TryItContext';
const LocationContext = React__namespace.createContext({
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
    const { groups: operationGroups } = computeTagGroups(serviceNode, types.NodeType.HttpOperation);
    const { groups: webhookGroups } = computeTagGroups(serviceNode, types.NodeType.HttpWebhook);
    return (React__namespace.createElement(LocationContext.Provider, { value: { location } },
        React__namespace.createElement(TryItContext.Provider, { value: { hideTryItPanel, hideTryIt, hideSamples, tryItCredentialsPolicy, corsProxy: tryItCorsProxy } },
            React__namespace.createElement(mosaic.Flex, { w: "full", flexDirection: "col", m: "auto", className: "sl-max-w-4xl" },
                React__namespace.createElement(mosaic.Box, { w: "full", borderB: true },
                    React__namespace.createElement(elementsCore.Docs, { className: "sl-mx-auto", nodeData: serviceNode.data, nodeTitle: serviceNode.name, nodeType: types.NodeType.HttpService, location: location, layoutOptions: { showPoweredByLink, hideExport, hideSecurityInfo, hideServerInfo }, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, renderExtensionAddon: renderExtensionAddon })),
                operationGroups.length > 0 && webhookGroups.length > 0 ? React__namespace.createElement(mosaic.Heading, { size: 2 }, "Endpoints") : null,
                operationGroups.map(group => (React__namespace.createElement(Group, { key: group.title, group: group }))),
                webhookGroups.length > 0 ? React__namespace.createElement(mosaic.Heading, { size: 2 }, "Webhooks") : null,
                webhookGroups.map(group => (React__namespace.createElement(Group, { key: group.title, group: group })))))));
};
APIWithStackedLayout.displayName = 'APIWithStackedLayout';
const Group = React__namespace.memo(({ group }) => {
    const [isExpanded, setIsExpanded] = React__namespace.useState(false);
    const scrollRef = React__namespace.useRef(null);
    const { location: { hash }, } = React__namespace.useContext(LocationContext);
    const urlHashMatches = hash.substr(1) === group.title;
    const onClick = React__namespace.useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);
    const shouldExpand = React__namespace.useMemo(() => {
        return urlHashMatches || group.items.some(item => itemMatchesHash(hash, item));
    }, [group, hash, urlHashMatches]);
    React__namespace.useEffect(() => {
        var _a;
        if (shouldExpand) {
            setIsExpanded(true);
            if (urlHashMatches && ((_a = scrollRef === null || scrollRef === void 0 ? void 0 : scrollRef.current) === null || _a === void 0 ? void 0 : _a.offsetTop)) {
                window.scrollTo(0, scrollRef.current.offsetTop);
            }
        }
    }, [shouldExpand, urlHashMatches, group, hash]);
    return (React__namespace.createElement(mosaic.Box, null,
        React__namespace.createElement(mosaic.Flex, { ref: scrollRef, onClick: onClick, mx: "auto", justifyContent: "between", alignItems: "center", borderB: true, px: 2, py: 4, cursor: "pointer", color: { default: 'current', hover: 'muted' } },
            React__namespace.createElement(mosaic.Box, { fontSize: "lg", fontWeight: "medium" }, group.title),
            React__namespace.createElement(mosaic.Icon, { className: "sl-mr-2", icon: isExpanded ? 'chevrons-down' : 'chevrons-right', size: "sm" })),
        React__namespace.createElement(Collapse, { isOpen: isExpanded }, group.items.map(item => {
            return React__namespace.createElement(Item, { key: item.uri, item: item });
        }))));
});
Group.displayName = 'Group';
const Item = React__namespace.memo(({ item }) => {
    const { location } = React__namespace.useContext(LocationContext);
    const { hash } = location;
    const [isExpanded, setIsExpanded] = React__namespace.useState(false);
    const scrollRef = React__namespace.useRef(null);
    const color = elementsCore.HttpMethodColors[item.data.method] || 'gray';
    const isDeprecated = !!item.data.deprecated;
    const { hideTryIt, hideSamples, hideTryItPanel, tryItCredentialsPolicy, corsProxy } = React__namespace.useContext(TryItContext);
    const onClick = React__namespace.useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);
    React__namespace.useEffect(() => {
        var _a;
        if (itemMatchesHash(hash, item)) {
            setIsExpanded(true);
            if ((_a = scrollRef === null || scrollRef === void 0 ? void 0 : scrollRef.current) === null || _a === void 0 ? void 0 : _a.offsetTop) {
                window.scrollTo(0, scrollRef.current.offsetTop);
            }
        }
    }, [hash, item]);
    return (React__namespace.createElement(mosaic.Box, { ref: scrollRef, w: "full", my: 2, border: true, borderColor: { default: isExpanded ? 'light' : 'transparent', hover: 'light' }, bg: { default: isExpanded ? 'code' : 'transparent', hover: 'code' } },
        React__namespace.createElement(mosaic.Flex, { mx: "auto", alignItems: "center", cursor: "pointer", fontSize: "lg", p: 2, onClick: onClick, color: "current" },
            React__namespace.createElement(mosaic.Box, { w: 24, textTransform: "uppercase", textAlign: "center", fontWeight: "semibold", border: true, rounded: true, px: 2, bg: "canvas", className: cn(`sl-mr-5 sl-text-base`, `sl-text-${color}`, `sl-border-${color}`) }, item.data.method || 'UNKNOWN'),
            React__namespace.createElement(mosaic.Box, { flex: 1, fontWeight: "medium", wordBreak: "all" }, item.type === types.NodeType.HttpOperation ? item.data.path : item.name),
            isDeprecated && React__namespace.createElement(elementsCore.DeprecatedBadge, null)),
        React__namespace.createElement(Collapse, { isOpen: isExpanded },
            React__namespace.createElement(mosaic.Box, { flex: 1, p: 2, fontWeight: "medium", mx: "auto", fontSize: "xl" }, item.name),
            hideTryItPanel ? (React__namespace.createElement(mosaic.Box, { as: elementsCore.ParsedDocs, layoutOptions: { noHeading: true, hideTryItPanel: true, hideSamples, hideTryIt }, node: item, p: 4 })) : (React__namespace.createElement(mosaic.Tabs, { appearance: "line" },
                React__namespace.createElement(mosaic.TabList, null,
                    React__namespace.createElement(mosaic.Tab, null, "Docs"),
                    React__namespace.createElement(mosaic.Tab, null, "TryIt")),
                React__namespace.createElement(mosaic.TabPanels, null,
                    React__namespace.createElement(mosaic.TabPanel, null,
                        React__namespace.createElement(elementsCore.ParsedDocs, { className: "sl-px-4", node: item, location: location, layoutOptions: { noHeading: true, hideTryItPanel: false, hideSamples, hideTryIt } })),
                    React__namespace.createElement(mosaic.TabPanel, null,
                        React__namespace.createElement(elementsCore.TryItWithRequestSamples, { httpOperation: item.data, tryItCredentialsPolicy: tryItCredentialsPolicy, corsProxy: corsProxy, hideSamples: hideSamples, hideTryIt: hideTryIt }))))))));
});
Item.displayName = 'Item';
const Collapse = ({ isOpen, children }) => {
    if (!isOpen)
        return null;
    return React__namespace.createElement(mosaic.Box, null, children);
};
Collapse.displayName = 'Collapse';

const APIWithResponsiveSidebarLayout = ({ serviceNode, logo, hideTryItPanel, hideTryIt, hideSamples, compact, hideSchemas, hideInternal, hideExport, hideServerInfo, hideSecurityInfo, exportProps, tryItCredentialsPolicy, tryItCorsProxy, renderExtensionAddon, basePath = '/', outerRouter = false, }) => {
    const container = React__namespace.useRef(null);
    const tree = React__namespace.useMemo(() => computeAPITree(serviceNode, { hideSchemas, hideInternal }), [serviceNode, hideSchemas, hideInternal]);
    const location = reactRouterDom.useLocation();
    const { pathname: currentPath } = location;
    const relativePath = resolveRelativePath(currentPath, basePath, outerRouter);
    const isRootPath = relativePath === '/';
    const node = isRootPath ? serviceNode : serviceNode.children.find(child => child.uri === relativePath);
    const layoutOptions = React__namespace.useMemo(() => ({
        hideTryIt: hideTryIt,
        hideTryItPanel,
        hideSamples,
        hideSecurityInfo: hideSecurityInfo,
        hideServerInfo: hideServerInfo,
        compact: compact,
        hideExport: hideExport || (node === null || node === void 0 ? void 0 : node.type) !== types.NodeType.HttpService,
    }), [hideTryIt, hideSecurityInfo, hideServerInfo, compact, hideExport, hideTryItPanel, hideSamples, node === null || node === void 0 ? void 0 : node.type]);
    if (!node) {
        const firstSlug = findFirstNodeSlug(tree);
        if (firstSlug) {
            return React__namespace.createElement(reactRouterDom.Navigate, { to: elementsCore.resolveRelativeLink(firstSlug), replace: true });
        }
    }
    if (hideInternal && node && isInternal(node)) {
        return React__namespace.createElement(reactRouterDom.Navigate, { to: ".", replace: true });
    }
    const handleTocClick = () => {
        if (container.current) {
            container.current.scrollIntoView();
        }
    };
    return (React__namespace.createElement(elementsCore.ResponsiveSidebarLayout, { onTocClick: handleTocClick, tree: tree, logo: logo !== null && logo !== void 0 ? logo : serviceNode.data.logo, ref: container, name: serviceNode.name }, node && (React__namespace.createElement(elementsCore.ElementsOptionsProvider, { renderExtensionAddon: renderExtensionAddon },
        React__namespace.createElement(elementsCore.ParsedDocs, { key: relativePath, uri: relativePath, node: node, nodeTitle: node.name, layoutOptions: layoutOptions, location: location, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon })))));
};

const APIWithSidebarLayout = ({ serviceNode, logo, hideTryItPanel, hideTryIt, hideSamples, hideSchemas, hideSecurityInfo, hideServerInfo, hideInternal, hideExport, exportProps, tryItCredentialsPolicy, tryItCorsProxy, renderExtensionAddon, basePath = '/', outerRouter = false, }) => {
    const container = React__namespace.useRef(null);
    const tree = React__namespace.useMemo(() => computeAPITree(serviceNode, { hideSchemas, hideInternal }), [serviceNode, hideSchemas, hideInternal]);
    const location = reactRouterDom.useLocation();
    const { pathname: currentPath } = location;
    const relativePath = resolveRelativePath(currentPath, basePath, outerRouter);
    const isRootPath = relativePath === '/';
    const node = isRootPath ? serviceNode : serviceNode.children.find(child => child.uri === relativePath);
    const layoutOptions = React__namespace.useMemo(() => ({
        hideTryIt: hideTryIt,
        hideTryItPanel,
        hideSamples,
        hideServerInfo: hideServerInfo,
        hideSecurityInfo: hideSecurityInfo,
        hideExport: hideExport || (node === null || node === void 0 ? void 0 : node.type) !== types.NodeType.HttpService,
    }), [hideTryIt, hideServerInfo, hideSecurityInfo, hideExport, hideTryItPanel, hideSamples, node === null || node === void 0 ? void 0 : node.type]);
    if (!node) {
        const firstSlug = findFirstNodeSlug(tree);
        if (firstSlug) {
            return React__namespace.createElement(reactRouterDom.Navigate, { to: elementsCore.resolveRelativeLink(firstSlug), replace: true });
        }
    }
    if (hideInternal && node && isInternal(node)) {
        return React__namespace.createElement(reactRouterDom.Navigate, { to: ".", replace: true });
    }
    const sidebar = (React__namespace.createElement(Sidebar, { serviceNode: serviceNode, logo: logo, container: container, pathname: relativePath, tree: tree }));
    return (React__namespace.createElement(elementsCore.SidebarLayout, { ref: container, sidebar: sidebar }, node && (React__namespace.createElement(elementsCore.ElementsOptionsProvider, { renderExtensionAddon: renderExtensionAddon },
        React__namespace.createElement(elementsCore.ParsedDocs, { key: relativePath, uri: relativePath, node: node, nodeTitle: node.name, layoutOptions: layoutOptions, location: location, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon })))));
};
const Sidebar = ({ serviceNode, logo, container, pathname, tree }) => {
    const handleTocClick = () => {
        if (container.current) {
            container.current.scrollIntoView();
        }
    };
    return (React__namespace.createElement(React__namespace.Fragment, null,
        React__namespace.createElement(mosaic.Flex, { ml: 4, mb: 5, alignItems: "center" },
            logo ? (React__namespace.createElement(elementsCore.Logo, { logo: { url: logo, altText: 'logo' } })) : (serviceNode.data.logo && React__namespace.createElement(elementsCore.Logo, { logo: serviceNode.data.logo })),
            React__namespace.createElement(mosaic.Heading, { size: 4 }, serviceNode.name)),
        React__namespace.createElement(mosaic.Flex, { flexGrow: true, flexShrink: true, overflowY: "auto", direction: "col" },
            React__namespace.createElement(elementsCore.TableOfContents, { tree: tree, activeId: pathname, Link: reactRouterDom.Link, onLinkClick: handleTocClick })),
        React__namespace.createElement(elementsCore.PoweredByLink, { source: serviceNode.name, pathname: pathname, packageType: "elements" })));
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
        return computeServiceNode(Object.assign(Object.assign({}, apiDescriptionDocument), { jsonSchemaDialect: 'http://json-schema.org/draft-07/schema#' }), oas3SourceMap, oas3.transformOas3Service, oas3.transformOas3Operation);
    }
    if (isOas3(apiDescriptionDocument)) {
        return computeServiceNode(apiDescriptionDocument, oas3SourceMap, oas3.transformOas3Service, oas3.transformOas3Operation);
    }
    else if (isOas2(apiDescriptionDocument)) {
        return computeServiceNode(apiDescriptionDocument, oas2SourceMap, oas2.transformOas2Service, oas2.transformOas2Operation);
    }
    return null;
}
function computeServiceNode(document, map, transformService, transformOperation) {
    var _a;
    const serviceDocument = transformService({ document });
    const serviceNode = {
        type: types.NodeType.HttpService,
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
        const sanitizedKey = json.encodePointerFragment(key);
        const match = findMapMatch(sanitizedKey, map);
        if (match) {
            const uri = `${parentUri}/${sanitizedKey}`;
            const jsonPath = json.pointerToPath(`#${uri}`);
            if (match.type === NodeTypes.Operation && jsonPath.length === 3) {
                const path = String(jsonPath[1]);
                const method = String(jsonPath[2]);
                const operationDocument = transformer({
                    document,
                    name: path,
                    method,
                    config: oas.OPERATION_CONFIG,
                });
                let parsedUri;
                const encodedPath = String(json.encodePointerFragment(path));
                if (operationDocument.iid) {
                    parsedUri = `/operations/${operationDocument.iid}`;
                }
                else {
                    parsedUri = uri.replace(encodedPath, elementsCore.slugify(path));
                }
                nodes.push({
                    type: types.NodeType.HttpOperation,
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
                    config: oas.WEBHOOK_CONFIG,
                });
                let parsedUri;
                const encodedPath = String(json.encodePointerFragment(name));
                if (webhookDocument.iid) {
                    parsedUri = `/webhooks/${webhookDocument.iid}`;
                }
                else {
                    parsedUri = uri.replace(encodedPath, elementsCore.slugify(name));
                }
                nodes.push({
                    type: types.NodeType.HttpWebhook,
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
                    type: types.NodeType.Model,
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
    const exportDocument = React__namespace.useCallback((document) => {
        const type = isJsonDocument ? 'json' : 'yaml';
        const blob = new Blob([document], {
            type: `application/${type}`,
        });
        saver.saveAs(blob, `document.${type}`);
    }, [isJsonDocument]);
    const exportOriginalDocument = React__namespace.useCallback(() => {
        const stringifiedDocument = typeof originalDocument === 'object' ? JSON.stringify(originalDocument, null, 2) : originalDocument || '';
        exportDocument(stringifiedDocument);
    }, [originalDocument, exportDocument]);
    const exportBundledDocument = React__namespace.useCallback(() => {
        const stringifiedDocument = isJsonDocument
            ? JSON.stringify(bundledDocument, null, 2)
            : yaml.safeStringify(bundledDocument);
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
    const location = reactRouterDom.useLocation();
    const apiDescriptionDocument = propsAreWithDocument(props) ? props.apiDescriptionDocument : undefined;
    const { isResponsiveLayoutEnabled } = elementsCore.useResponsiveLayout();
    const { data: fetchedDocument, error } = reactQuery.useQuery([apiDescriptionUrl], () => fetch(apiDescriptionUrl).then(res => {
        if (res.ok) {
            return res.text();
        }
        throw new Error(`Unable to load description document, status code: ${res.status}`);
    }), {
        enabled: apiDescriptionUrl !== '' && !apiDescriptionDocument,
    });
    const document = apiDescriptionDocument || fetchedDocument || '';
    const parsedDocument = elementsCore.useParsedValue(document);
    const bundledDocument = elementsCore.useBundleRefsIntoDocument(parsedDocument, { baseUrl: apiDescriptionUrl });
    const serviceNode = React__namespace.useMemo(() => transformOasToServiceNode(bundledDocument), [bundledDocument]);
    const exportProps = useExportDocumentProps({ originalDocument: document, bundledDocument });
    if (error) {
        return (React__namespace.createElement(mosaic.Flex, { justify: "center", alignItems: "center", w: "full", minH: "screen" },
            React__namespace.createElement(elementsCore.NonIdealState, { title: "Document could not be loaded", description: "The API description document could not be fetched. This could indicate connectivity problems, or issues with the server hosting the spec.", icon: "exclamation-triangle" })));
    }
    if (!bundledDocument) {
        return (React__namespace.createElement(mosaic.Flex, { justify: "center", alignItems: "center", w: "full", minH: "screen", color: "light" },
            React__namespace.createElement(mosaic.Box, { as: mosaic.Icon, icon: ['fal', 'circle-notch'], size: "3x", spin: true })));
    }
    if (!serviceNode) {
        return (React__namespace.createElement(mosaic.Flex, { justify: "center", alignItems: "center", w: "full", minH: "screen" },
            React__namespace.createElement(elementsCore.NonIdealState, { title: "Failed to parse OpenAPI file", description: "Please make sure your OpenAPI file is valid and try again" })));
    }
    return (React__namespace.createElement(elementsCore.InlineRefResolverProvider, { document: parsedDocument, maxRefDepth: maxRefDepth },
        layout === 'stacked' && (React__namespace.createElement(APIWithStackedLayout, { serviceNode: serviceNode, hideTryIt: hideTryIt, hideSamples: hideSamples, hideTryItPanel: hideTryItPanel, hideSecurityInfo: hideSecurityInfo, hideServerInfo: hideServerInfo, hideExport: hideExport, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon, location: location })),
        layout === 'sidebar' && (React__namespace.createElement(APIWithSidebarLayout, { logo: logo, serviceNode: serviceNode, hideTryItPanel: hideTryItPanel, hideTryIt: hideTryIt, hideSamples: hideSamples, hideSecurityInfo: hideSecurityInfo, hideServerInfo: hideServerInfo, hideSchemas: hideSchemas, hideInternal: hideInternal, hideExport: hideExport, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon, basePath: basePath, outerRouter: outerRouter })),
        layout === 'responsive' && (React__namespace.createElement(APIWithResponsiveSidebarLayout, { logo: logo, serviceNode: serviceNode, hideTryItPanel: hideTryItPanel, hideTryIt: hideTryIt, hideSamples: hideSamples, hideSecurityInfo: hideSecurityInfo, hideServerInfo: hideServerInfo, hideSchemas: hideSchemas, hideInternal: hideInternal, hideExport: hideExport, exportProps: exportProps, tryItCredentialsPolicy: tryItCredentialsPolicy, tryItCorsProxy: tryItCorsProxy, renderExtensionAddon: renderExtensionAddon, compact: isResponsiveLayoutEnabled, basePath: basePath, outerRouter: outerRouter }))));
};
const API = flow(elementsCore.withRouter, elementsCore.withStyles, elementsCore.withPersistenceBoundary, elementsCore.withMosaicProvider, elementsCore.withQueryClientProvider)(APIImpl);

exports.API = API;
exports.APIWithStackedLayout = APIWithStackedLayout;
exports.transformOasToServiceNode = transformOasToServiceNode;
exports.useExportDocumentProps = useExportDocumentProps;
