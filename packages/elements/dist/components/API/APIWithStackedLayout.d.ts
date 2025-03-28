import { ExportButtonProps } from '@stoplight/elements-core';
import { ExtensionAddonRenderer } from '@stoplight/elements-core/components/Docs';
import * as React from 'react';
import { ServiceNode } from '../../utils/oas/types';
declare type TryItCredentialsPolicy = 'omit' | 'include' | 'same-origin';
interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key: string;
}
declare type StackedLayoutProps = {
    serviceNode: ServiceNode;
    hideTryItPanel?: boolean;
    hideTryIt?: boolean;
    hideSamples?: boolean;
    hideExport?: boolean;
    hideServerInfo?: boolean;
    hideSecurityInfo?: boolean;
    exportProps?: ExportButtonProps;
    tryItCredentialsPolicy?: TryItCredentialsPolicy;
    tryItCorsProxy?: string;
    showPoweredByLink?: boolean;
    location: Location;
    renderExtensionAddon?: ExtensionAddonRenderer;
};
export declare const APIWithStackedLayout: React.FC<StackedLayoutProps>;
export {};
