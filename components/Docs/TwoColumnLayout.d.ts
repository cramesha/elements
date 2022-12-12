import React from 'react';
export interface TwoColumnLayoutProps {
    header: React.ReactNode;
    right: React.ReactNode;
    left: React.ReactNode;
    className?: string;
}
export declare const TwoColumnLayout: React.ForwardRefExoticComponent<TwoColumnLayoutProps & React.RefAttributes<HTMLDivElement>>;
