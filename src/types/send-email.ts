import { Locale } from "@/i18n/config";
import { CategoriesType } from "@/db/queries/categories";
import { CountryCastFestivals } from "@/db/queries/countries";
import { SelectFestival } from "@/db/schema";

export interface FormElements extends HTMLFormControlsCollection {
  search: HTMLInputElement;
}

export interface SearchFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export interface StepperFormProps {
  locale: Locale;
  festivals: { festivals: SelectFestival }[];
  countries: CountryCastFestivals;
  categories: CategoriesType;
}

export interface EmailData {
  subject: string;
  content: string;
  attachments?: any;
}

export type State = {
  festivals: number[];
  groups: number[];
  nationalSections: number[];
  users: string[];
};

export type Action =
  | { type: "add"; payload: { key: keyof State; id: number | string } }
  | { type: "remove"; payload: { key: keyof State; id: number | string } }
  | { type: "reset"; payload?: keyof State }
  | {
      type: "set";
      payload: { key: keyof State; newState: number[] | string[] };
    };
