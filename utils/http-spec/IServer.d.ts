import type { IServer } from '@stoplight/types';
export declare const getServersToDisplay: (originalServers: IServer[], mockUrl?: string | undefined) => IServer[];
export declare const getServerUrlWithDefaultValues: (server: IServer) => string | null;
