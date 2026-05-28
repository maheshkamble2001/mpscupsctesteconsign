const steps = [
    "Personal Information",
    "Indentification",
    "Contact Details",
    "Educational Details",
    "Medical Details",
    "Employee Details",
    "Bank Details",
    "Salary And Benefits Details",
    "Transfer Details",
    "Final Submission",
];

export default function Stepper({ currentStep = 1 }) {
    return (
        <div className="relative pl-10">
            {/* Vertical line */}
            <div className="absolute left-4 top-5 bottom-0 w-[2px] bg-gray-200" />

            <div className="space-y-8">
                {steps.map((label, index) => {
                    const stepNum = index + 1;
                    const isComplete = currentStep > stepNum;
                    const isActive = currentStep === stepNum;

                    return (
                        <div key={label} className="relative flex items-center space-x-4">
                            {/* Circle */}
                            <div className="absolute -left-10 top-0">
                                {isComplete ? (
                                    <div className="h-8 w-8 rounded-full bg-green-600 border-2 border-green-600 flex items-center justify-center text-white text-sm font-bold">
                                        ✓
                                    </div>

                                ) : (
                                    <div
                                        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-medium ${isActive
                                            ? "border-green-700 text-green-700 bg-white"
                                            : "border-gray-300 text-gray-500 bg-gray-100"
                                            }`}
                                    >
                                        {stepNum}
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <div className="pl-2 my-[5px]">
                                <p
                                    className={`text-sm ${isActive ? "text-gray-500" : "text-gray-500"
                                        }`}
                                >
                                    {label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
