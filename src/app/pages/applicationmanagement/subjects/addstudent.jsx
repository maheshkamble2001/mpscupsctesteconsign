import React, { useState } from "react";
import { XMarkIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { addSubject } from "api/applicationmanagement/subject"; 

export const AddSubjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  // API format ke hisaab se state set ki hai
  const [formData, setFormData] = useState({
    subjectName: "",
    description: "",
    status: 1, // 1 means Active, 0 means Inactive
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Agar checkbox (status) hai toh checked pe 1, un-checked pe 0 jayega
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName.trim()) {
      toast.error("Subject Name is required");
      return;
    }

    try {
      setLoading(true);
      // Data directly API ko bhej rahe hain
      const res = await addSubject(formData); 
      
      if (res.code === 200 || res.code === 201) {
        toast.success("Subject added successfully");
        // State Reset
        setFormData({ subjectName: "", description: "", status: 1 });
        onSuccess(); 
        onClose(); 
      } else {
        toast.error(res.message || "Failed to add subject");
      }
    } catch (error) {
      toast.error("Something went wrong while adding subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Add New Subject</h3>
              <p className="text-sm text-gray-500">Fill in the details to create a subject.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subjectName" /* Name API ki field se match kar diya */
              value={formData.subjectName}
              onChange={handleChange}
              placeholder="e.g. English, Mathematics"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              name="description" /* Name API ki field se match kar diya */
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter brief details about this subject..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div>
              <label className="text-sm font-medium text-gray-900">Active Status</label>
              <p className="text-xs text-gray-500">If inactive, it won't be visible to students.</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="status" /* Name API ki field se match kar diya */
                checked={formData.status === 1} /* 1 hai toh checked, 0 hai toh unchecked */
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Saving...
                </>
              ) : (
                "Save Subject"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
