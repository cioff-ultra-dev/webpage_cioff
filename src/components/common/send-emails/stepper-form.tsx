"use client";

import { JSX, useState, useMemo, useCallback, useReducer } from "react";
import { Stepper } from "react-form-stepper";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Action, EmailData, State, StepperFormProps } from "@/types/send-email";

import AddresseeStep from "./addressee-step";
import { SendEmailsForm } from "./form";

const initialState: State = {
  festivals: [],
  groups: [],
  nationalSections: [],
  users: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": {
      const { key, id } = action.payload;

      const items = state[key].includes(id as never)
        ? state[key].filter((existingId) => existingId !== id)
        : [...state[key], id];

      return {
        ...state,
        [key]: items,
      };
    }
    case "remove": {
      const { key, id } = action.payload;

      return {
        ...state,
        [key]: state[key].filter((existingId) => existingId !== id),
      };
    }
    case "reset": {
      if (action.payload)
        return {
          ...state,
          [action.payload]: [],
        };

      return {
        festivals: [],
        groups: [],
        nationalSections: [],
        users: [],
      };
    }

    case "set": {
      const { key, newState } = action.payload;

      return {
        ...state,
        [key]: newState,
      };
    }
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
}

function StepperForm(props: StepperFormProps): JSX.Element {
  const { categories, countries, festivals, locale } = props;

  const [step, setStep] = useState<number>(0);
  const [addresseeIds, dispatch] = useReducer(reducer, initialState);

  const translations = useTranslations("sendEmails");

  const handleSubmit = useCallback(
    async (data: EmailData): Promise<void> => {
      const formData = new FormData();

      formData.append("to", JSON.stringify(addresseeIds));
      formData.append("subject", data.subject);
      formData.append("content", data.content);

      if (data.attachments) {
        for (const file of data.attachments) {
          formData.append("attachments", file);
        }
      }

      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success(translations("emailsSent"));
      } else {
        toast.error(translations("notEmailSentMessage"));
      }
    },
    [addresseeIds, translations]
  );

  const component = useMemo(
    () =>
      step === 0 ? (
        <AddresseeStep
          locale={locale}
          festivals={festivals}
          countries={countries}
          categories={categories}
          handleNextStep={setStep}
          dispatch={dispatch}
          addresseeIds={addresseeIds}
        />
      ) : (
        <SendEmailsForm handleNextStep={setStep} handleSubmit={handleSubmit} />
      ),
    [step, locale, festivals, countries, categories, handleSubmit, addresseeIds]
  );

  return (
    <div>
      <Stepper
        stepClassName="[&.active]:!bg-primary [&.completed]:!bg-primary/70"
        steps={[
          { label: translations("addressee") },
          { label: translations("email") },
        ]}
        activeStep={step}
      />
      {component}
    </div>
  );
}

export default StepperForm;
