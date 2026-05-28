/* eslint-disable no-unused-vars */
import { ClockIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import flatpickrCSS from "flatpickr/dist/themes/light.css?inline";
import { Input } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import { useMergedRef } from "hooks";
import { locales } from "i18n/langs";
import { Flatpickr } from "./Flatpickr";
import {
  injectStyles,
  insertStylesToHead,
  makeStyleTag,
} from "utils/dom/injectStylesToHead";

// ----------------------------------------------------------------------

const styles = `@layer vendor {
  ${flatpickrCSS}
}`;

const sheet = makeStyleTag();
injectStyles(sheet, styles);
insertStylesToHead(sheet);

const TimePicker = forwardRef(
  (
    {
      options: userOptions,
      className,
      hasClockIcon = true,
      isCalendar = false,
      error = false,
      errorMessage = "",
      ...props
    },
    ref
  ) => {
    const fp = useRef(null);
    const { locale } = useLocaleContext();
    const [localeData, setLocaleData] = useState(null);

    useEffect(() => {
      const loadLocale = async () => {
        const load = locales[locale]?.flatpickr;
        if (load) {
          const loadedLocale = await load();
          setLocaleData(loadedLocale);
        } else {
          setLocaleData(null);
        }
      };
      loadLocale();
    }, [locale]);

    const options = {
      enableTime: true,
      noCalendar: true,
      dateFormat: "h:i K", // 12hr with AM/PM
      time_24hr: false,
      locale: localeData,
      ...userOptions,
    };

    useImperativeHandle(ref, () => ({
      focus() {
        fp.current.flatpickr.input.focus();
      },
      blur() {
        fp.current.flatpickr.input.blur();
      },
    }));

    const mergedRef = useMergedRef(fp, ref);

    return (
      <div className="w-full">
        <Flatpickr
          className={clsx("cursor-pointer", className)}
          options={options}
          ref={mergedRef}
          {...props}
          render={({ ...inputProps }, ref) => (
            <Input
              ref={ref}
              prefix={
                !userOptions?.inline && hasClockIcon && (
                  <ClockIcon className="size-5" />
                )
              }
              readOnly
              error={error}
              {...inputProps}
            />
          )}
        />
        {error && errorMessage && (
          <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }
);

TimePicker.displayName = "TimePicker";

export { TimePicker };
