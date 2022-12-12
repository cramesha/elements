import * as React from 'react';
export declare const PersistenceContextProvider: ({ initialValues, scope, children, }: import("react").PropsWithChildren<{
    initialValues?: Iterable<readonly [import("jotai").Atom<unknown>, unknown]> | undefined;
    scope?: import("jotai/core/atom").Scope | undefined;
}>) => import("react").FunctionComponentElement<import("react").ProviderProps<import("jotai/core/contexts").ScopeContainer>>;
export declare function withPersistenceBoundary<T>(WrappedComponent: React.ComponentType<T>): React.FC<T>;
