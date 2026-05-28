import Stepper from "./Stepper";

export default function StepperLayout({ step, children }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6">
      {/* Left Side: Form Content */}
      <div className="flex-1 max-w-4xl bg-white p-6 rounded-xl shadow-sm border">
        {children}
      </div>

      {/* Right Side: Stepper */}
      <div className="hidden lg:block w-[220px]">
        <Stepper currentStep={step} />
      </div>
    </div>
  );
}
