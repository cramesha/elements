import * as React from 'react';
import { APIProps } from './API';
declare const _default: {
    title: string;
    component: React.FC<APIProps>;
    argTypes: {
        apiDescriptionDocument: {
            control: string;
            type: {
                required: boolean;
            };
            table: {
                category: string;
            };
        };
        apiDescriptionUrl: {
            control: string;
            table: {
                category: string;
            };
        };
        layout: {
            control: {
                type: string;
            };
            table: {
                category: string;
            };
        };
        basePath: {
            table: {
                category: string;
            };
        };
        router: {
            table: {
                category: string;
            };
        };
    };
    args: {
        router: string;
    };
};
export default _default;
export declare const APIWithYamlProvidedDirectly: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const APIWithJSONProvidedDirectly: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const APIWithoutDescription: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const APIWithInternalOperations: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const OpenApi3Schema: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const BadgesForSchema: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const StackedLayout: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const ResponsiveLayout: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const Box: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const DigitalOcean: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const Github: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const Instagram: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
export declare const WithExtensionRenderer: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, APIProps>;
