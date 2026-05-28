import { UserIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import PropTypes from "prop-types";

import { DatePicker } from "components/shared/form/Datepicker";
import { Listbox } from "components/shared/form/Listbox";
import { Button, Input, InputErrorMsg } from "components/ui";
import { PhoneDialCode } from "components/PhoneDialCode";

// Options
const genders = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const maritalStatuses = [
  { label: "Married", value: "married" },
  { label: "Widowed", value: "widowed" },
  { label: "Separated", value: "separated" },
  { label: "Divorced", value: "divorced" },
  { label: "Single", value: "single" },
];

// Schema
const schema = yup.object().shape({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  gender: yup.string().required("Gender is required"),
  matrialStatus: yup.string().required("Marital Status is required"),
  dialCode: yup.string().required("Dial code is required"),
  phone: yup.string().required("Phone number is required"),
  dateOfBirth: yup.string().required("Date of Birth is required"),
  middleName: yup.string().nullable(), // optional
});

export function PersonalInfo({ initialValues = {}, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      gender: '',
      matrialStatus: '',
      dialCode: '',
      phone: '',
      dateOfBirth: '',
      ...initialValues, // overwrite defaults if values exist
    },
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("firstName")}
            prefix={<UserIcon className="size-5" />}
            label="First Name"
            error={errors?.firstName?.message}
            placeholder="Enter First Name"
          />
          <Input
            {...register("lastName")}
            prefix={<UserIcon className="size-5" />}
            label="Last Name"
            error={errors?.lastName?.message}
            placeholder="Enter Last Name"
          />
        </div>

        <Input
          {...register("middleName")}
          prefix={<UserIcon className="size-5" />}
          label={
            <>
              Middle Name{" "}
              <span className="text-xs text-gray-400 dark:text-dark-300">(Optional)</span>
            </>
          }
          error={errors?.middleName?.message}
          placeholder="Enter Middle Name"
        />

        <Input
          {...register("email")}
          prefix={<EnvelopeIcon className="size-5" />}
          label="Email"
          error={errors?.email?.message}
          placeholder="Enter Email Address"
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Listbox
                data={genders}
                value={genders.find((g) => g.value === field.value) || null}
                onChange={(val) => field.onChange(val.value)}
                label="Gender"
                placeholder="Select Gender"
                displayField="label"
                error={errors?.gender?.message}
              />
            )}
          />
          <Controller
            name="matrialStatus"
            control={control}
            render={({ field }) => (
              <Listbox
                data={maritalStatuses}
                value={maritalStatuses.find((m) => m.value === field.value) || null}
                onChange={(val) => field.onChange(val.value)}
                label="Marital Status"
                placeholder="Select Marital Status"
                displayField="label"
                error={errors?.matrialStatus?.message}
              />
            )}
          />
        </div>

        <div className="flex flex-col">
          <span>Phone Number</span>
          <div className="mt-1.5 flex -space-x-px">
            <Controller
              name="dialCode"
              control={control}
              render={({ field }) => (
                <PhoneDialCode
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  error={Boolean(errors?.dialCode)}
                />
              )}
            />
            <Input
              {...register("phone")}
              classNames={{
                root: "flex-1",
                input: "hover:z-1 focus:z-1 ltr:rounded-l-none rtl:rounded-r-none",
              }}
              error={Boolean(errors?.phone)}
              placeholder="Phone number"
            />
          </div>
          <InputErrorMsg when={errors?.dialCode || errors?.phone}>
            {errors?.dialCode?.message ?? errors?.phone?.message}
          </InputErrorMsg>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value || ""}
                onChange={field.onChange}
                label="Date of Birth"
                error={errors?.dateOfBirth?.message}
                options={{ disableMobile: true }}
                placeholder="Choose date..."
              />
            )}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button type="button" className="min-w-[7rem]">Cancel</Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Save
        </Button>
      </div>
    </form>
  );
}

PersonalInfo.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};
