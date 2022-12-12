import { IMediaTypeContent } from '@stoplight/types';
import * as React from 'react';
import { BodyParameterValues, ParameterOptional } from './request-body-utils';
interface FormDataBodyProps {
    specification: IMediaTypeContent;
    values: BodyParameterValues;
    onChangeValues: (newValues: BodyParameterValues) => void;
    onChangeParameterAllow: (newValue: ParameterOptional) => void;
    isAllowedEmptyValues: ParameterOptional;
}
export declare const FormDataBody: React.FC<FormDataBodyProps>;
export {};
