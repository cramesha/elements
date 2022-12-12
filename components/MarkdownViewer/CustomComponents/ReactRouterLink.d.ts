import type { LinkProps } from '@stoplight/mosaic';
export declare const ReactRouterMarkdownLink: ({ title, to, href: _href, children, }: Omit<LinkProps<"a">, "target" | "rel"> & {
    to?: string | undefined;
}) => JSX.Element;
