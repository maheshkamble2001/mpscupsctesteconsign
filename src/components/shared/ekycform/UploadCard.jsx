import { useRef } from "react";
import { DocumentIcon } from "@heroicons/react/24/outline";

export default function UploadBox({
  label,
  name,
  error,
  file,
  isImage = false,
  setValue,
}) {
  const fileInputRef = useRef();

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setValue(name, [selectedFile], { shouldValidate: true });
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {file ? (
            isImage && file.type?.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="h-16 w-16 rounded object-cover"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-800">
                <DocumentIcon className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
            )
          ) : (
            <span className="text-sm text-gray-400">Select File</span>
          )}
        </div>

        <button
          type="button"
          onClick={triggerFileDialog}
          className="bg-[#fdaf19] hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Upload Doc
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={isImage ? "image/*" : undefined}
          className="hidden"
        />
      </div>

      {error && <p className="input-text-error mt-1 text-xs text-error dark:text-error-lighter">{error.message}</p>}
    </div>
  );
}
