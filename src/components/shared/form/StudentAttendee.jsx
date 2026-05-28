import { useFieldArray, useFormContext } from "react-hook-form";
import { Input, Button } from "components/ui";

export default function StudentAttendee() {
    const { control, register, formState: { errors } } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "attendees",
    });

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium text-lg">Attendees</h2>
                <Button
                    type="button"
                    onClick={() =>
                        append({ name: "", mobile: "", email: "" })
                    }
                    className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                     ➕ Add Attendee
                </Button>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 items-end">
                    <Input
                        {...register(`attendees.${index}.name`)}
                        label="Name"
                        error={errors?.attendees?.[index]?.name?.message}
                    />
                    <Input
                        {...register(`attendees.${index}.mobile`)}
                        label="Mobile"
                        error={errors?.attendees?.[index]?.mobile?.message}
                    />
                    <Input
                        {...register(`attendees.${index}.email`)}
                        label="Email"
                        error={errors?.attendees?.[index]?.email?.message}
                    />
                    <Button
                        type="button"
                        className="bg-red-100 text-red-600 hover:bg-red-200"
                        onClick={() => remove(index)}
                    >
                         🗑️
                    </Button>
                </div>
            ))}
        </div>
    );
}
