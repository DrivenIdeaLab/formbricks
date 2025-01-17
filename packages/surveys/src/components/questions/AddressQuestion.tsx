import { BackButton } from "@/components/buttons/BackButton";
import SubmitButton from "@/components/buttons/SubmitButton";
import Headline from "@/components/general/Headline";
import { QuestionMedia } from "@/components/general/QuestionMedia";
import Subheader from "@/components/general/Subheader";
import { ScrollableContainer } from "@/components/wrappers/ScrollableContainer";
import { getUpdatedTtc, useTtc } from "@/lib/ttc";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";

import { getLocalizedValue } from "@formbricks/lib/i18n/utils";
import { TResponseData, TResponseTtc } from "@formbricks/types/responses";
import type { TSurveyAddressQuestion } from "@formbricks/types/surveys";

interface AddressQuestionProps {
  question: TSurveyAddressQuestion;
  value?: string[];
  onChange: (responseData: TResponseData) => void;
  onSubmit: (data: TResponseData, ttc: TResponseTtc) => void;
  onBack: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  autoFocus?: boolean;
  languageCode: string;
  ttc: TResponseTtc;
  setTtc: (ttc: TResponseTtc) => void;
  isInIframe: boolean;
}

export const AddressQuestion = ({
  question,
  value,
  onChange,
  onSubmit,
  onBack,
  isFirstQuestion,
  isLastQuestion,
  languageCode,
  ttc,
  setTtc,
  isInIframe,
}: AddressQuestionProps) => {
  const [startTime, setStartTime] = useState(performance.now());
  const [hasFilled, setHasFilled] = useState(false);
  const isMediaAvailable = question.imageUrl || question.videoUrl;
  const formRef = useRef<HTMLFormElement>(null);
  useTtc(question.id, ttc, setTtc, startTime, setStartTime);

  const safeValue = useMemo(() => {
    return Array.isArray(value) ? value : ["", "", "", "", "", ""];
  }, [value]);

  const handleInputChange = (inputValue: string, index: number) => {
    const updatedValue = [...safeValue];
    updatedValue[index] = inputValue.trimStart();
    onChange({ [question.id]: updatedValue });
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const updatedTtc = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
    setTtc(updatedTtc);
    const containsAllEmptyStrings = value?.length === 6 && value.every((item) => item.trim() === "");
    if (containsAllEmptyStrings) {
      onSubmit({ [question.id]: [] }, updatedTtc);
    } else {
      onSubmit({ [question.id]: value ?? [] }, updatedTtc);
    }
  };

  useEffect(() => {
    const filled = safeValue.some((val) => val.trim().length > 0);
    setHasFilled(filled);
  }, [value, safeValue]);

  const inputConfig = [
    {
      name: "address-line1",
      placeholder: "Address Line 1",
      required: question.required
        ? hasFilled
          ? question.isAddressLine1Required
          : true
        : hasFilled
          ? question.isAddressLine1Required
          : false,
    },
    {
      name: "address-line2",
      placeholder: "Address Line 2",
      required: question.required
        ? question.isAddressLine2Required
        : hasFilled
          ? question.isAddressLine2Required
          : false,
    },
    {
      name: "address-level2",
      placeholder: "City / Town",
      required: question.required ? question.isCityRequired : hasFilled ? question.isCityRequired : false,
    },
    {
      name: "address-level1",
      placeholder: "State / Region",
      required: question.required ? question.isStateRequired : hasFilled ? question.isStateRequired : false,
    },
    {
      name: "postal-code",
      placeholder: "ZIP / Post Code",
      required: question.required ? question.isZipRequired : hasFilled ? question.isZipRequired : false,
    },
    {
      name: "country-name",
      placeholder: "Country",
      required: question.required
        ? question.isCountryRequired
        : hasFilled
          ? question.isCountryRequired
          : false,
    },
  ];

  const addressTextRef = useCallback(
    (currentElement: HTMLInputElement | null) => {
      if (question.id && currentElement && !isInIframe) {
        currentElement.focus();
      }
    },
    [question.id, isInIframe]
  );

  return (
    <form key={question.id} onSubmit={handleSubmit} className="w-full" ref={formRef}>
      <ScrollableContainer>
        <div>
          {isMediaAvailable && <QuestionMedia imgUrl={question.imageUrl} videoUrl={question.videoUrl} />}
          <Headline
            headline={getLocalizedValue(question.headline, languageCode)}
            questionId={question.id}
            required={question.required}
          />
          <Subheader
            subheader={question.subheader ? getLocalizedValue(question.subheader, languageCode) : ""}
            questionId={question.id}
          />
          <div className="mt-4 space-y-2">
            {inputConfig.map(({ name, placeholder, required }, index) => (
              <input
                ref={index === 0 ? addressTextRef : null}
                key={index}
                name={name}
                autoComplete={name}
                id={`${question.id}-${index}`}
                placeholder={placeholder}
                tabIndex={index + 1}
                required={required}
                value={safeValue[index] || ""}
                onInput={(e) => handleInputChange(e.currentTarget.value, index)}
                autoFocus={!isInIframe && index === 0}
                className="border-border focus:border-brand placeholder:text-placeholder text-subheading bg-input-bg rounded-custom block w-full border p-2 shadow-sm sm:text-sm"
              />
            ))}
          </div>
        </div>
      </ScrollableContainer>
      <div className="flex w-full justify-between px-6 py-4">
        {!isFirstQuestion && (
          <BackButton
            tabIndex={8}
            backButtonLabel={getLocalizedValue(question.backButtonLabel, languageCode)}
            onClick={() => {
              const updatedttc = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
              setTtc(updatedttc);
              onBack();
            }}
          />
        )}
        <div></div>
        <SubmitButton
          tabIndex={7}
          buttonLabel={getLocalizedValue(question.buttonLabel, languageCode)}
          isLastQuestion={isLastQuestion}
          onClick={() => {}}
        />
      </div>
    </form>
  );
};
