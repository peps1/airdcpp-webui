import * as API from 'types/api';
import { RouteComponentProps } from 'react-router';
import { ModuleTranslator } from './modules';
import { form } from './tcomb-form';


export type FormValueBase = API.SettingValueBase | object;
export type FormValue = API.SettingValue<FormValueBase>;
export type FormValueMap = API.SettingValueMap<FormValueBase | {}>;


export interface FormFieldDefinition<ValueType = FormValueBase> extends 
  Omit<API.SettingDefinition, 'default_value' | 'definitions'> {
    
  default_value?: FormValueBase;
  definitions?: FormFieldDefinition[];
}

export interface FormOption<OptionValueT = any> {
  value: OptionValueT;
  text: string;
}


export const enum TranslatableFormDefinitionProperties {
  HELP = 'Help',
  NAME = 'Name',
  OPTION = 'Option',
}

export type FormContext = Pick<RouteComponentProps, 'location'> & {
  formT: ModuleTranslator;
};

/*export type FormLocals<OptionValueT = any, ValueT = any, ConfigT = undefined> = {
  onChange: (values: ValueT) => void;
  options: Array<FormOption<OptionValueT>>;
  value: ValueT;
  config: ConfigT;
  context: FormContext;
  label?: string;
  attrs: any;
};*/

export type FormLocals<OptionValueT = any, ValueT = any, ConfigT = undefined> = 
  form.TemplateLocals<OptionValueT, ValueT, ConfigT>;

export type OptionTitleParser = (
  definition: FormFieldDefinition,
  formT: ModuleTranslator
) => React.ReactNode;
