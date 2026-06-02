
// // import React, { useEffect, useState, Fragment } from "react";
// // import PropTypes from "prop-types";
// // import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
// // import { XMarkIcon, CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
// // import { toast } from "sonner"; 
// // import { deleteExam } from "api/applicationmanagement/exam"; 

// // export function ModalBox({
// //   show,
// //   onClose,
// //   data = "",
// //   list
// // }) {
// //   const [confirmLoading, setConfirmLoading] = useState(false);
// //   const [success, setSuccess] = useState(false);
// //   const [progress, setProgress] = useState(100);

// //   const onOk = async () => {
// //     if (!data && data !== 0) {
// //       toast.error("Invalid Exam Identifier");
// //       return;
// //     }
// //     try {
// //       setConfirmLoading(true);
// //       const res = await deleteExam({ ExamId: data }); 
      
// //       if (res?.code === 200) {
// //         toast.success(res.message || "Exam deleted successfully");
// //         list(); 
// //         setSuccess(true);
// //         // Start progress bar animation timeout
// //         setTimeout(() => setProgress(0), 50);
// //       } else {
// //         toast.error(res?.message || "Deletion failed");
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Something went wrong during deletion");
// //     } finally {
// //       setConfirmLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     let timer;
// //     if (success && show) {
// //       timer = setTimeout(() => {
// //         onClose();
// //       }, 1500); 
// //     }
// //     return () => {
// //       if (timer) clearTimeout(timer);
// //     };
// //   }, [success, show, onClose]);

// //   useEffect(() => {
// //     if (!show) {
// //       setSuccess(false);
// //       setConfirmLoading(false);
// //       setProgress(100); // Reset progress bar
// //     }
// //   }, [show]);

// //   return (
// //     <Transition appear show={show} as={Fragment}>
// //       <Dialog as="div" className="relative z-[9999]" onClose={() => !confirmLoading && onClose()}>
        
// //         {/* Animated Dark Blur Backdrop */}
// //         <TransitionChild
// //           as={Fragment}
// //           enter="ease-out duration-300"
// //           enterFrom="opacity-0 backdrop-blur-none"
// //           enterTo="opacity-100 backdrop-blur-md"
// //           leave="ease-in duration-200"
// //           leaveFrom="opacity-100 backdrop-blur-md"
// //           leaveTo="opacity-0 backdrop-blur-none"
// //         >
// //           <div className="fixed inset-0 bg-slate-900/50 transition-all" />
// //         </TransitionChild>

// //         <div className="fixed inset-0 overflow-y-auto">
// //           <div className="flex min-h-full items-center justify-center p-4 text-center">
            
// //             {/* Highly Animated Bouncy Panel */}
// //             <TransitionChild
// //               as={Fragment}
// //               enter="transform transition ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-500"
// //               enterFrom="opacity-0 translate-y-12 scale-90 rotate-2"
// //               enterTo="opacity-100 translate-y-0 scale-100 rotate-0"
// //               leave="transform transition ease-in duration-200"
// //               leaveFrom="opacity-100 translate-y-0 scale-100"
// //               leaveTo="opacity-0 translate-y-12 scale-95"
// //             >
// //               <DialogPanel className="relative w-full max-w-sm transform overflow-hidden rounded-[28px] bg-white text-left align-middle shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all">
                
// //                 {/* Close Button Float */}
// //                 {!confirmLoading && !success && (
// //                   <button
// //                     onClick={onClose}
// //                     className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100/50 text-slate-400 backdrop-blur-sm transition-all duration-300 hover:rotate-90 hover:bg-slate-200 hover:text-slate-800"
// //                   >
// //                     <XMarkIcon className="h-5 w-5" />
// //                   </button>
// //                 )}

// //                 {success ? (
// //                   /* --- Animated Success Screen (Green Kept For Standard UX) --- */
// //                   <div className="relative flex flex-col items-center justify-center px-6 py-14 text-center">
// //                     <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
// //                       <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-20 duration-1000"></span>
// //                       <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 shadow-inner">
// //                         <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
// //                       </div>
// //                     </div>
// //                     <DialogTitle as="h3" className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-[24px] font-extrabold text-transparent">
// //                       Successfully Deleted
// //                     </DialogTitle>
// //                     <p className="mt-3 text-[14px] font-medium text-slate-500">
// //                       The exam has been removed from the directory.
// //                     </p>

// //                     {/* Dynamic Progress Bar Indicator */}
// //                     <div className="absolute bottom-0 left-0 h-1.5 w-full bg-slate-100">
// //                       <div 
// //                         className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all ease-linear"
// //                         style={{ width: `${progress}%`, transitionDuration: '1500ms' }}
// //                       />
// //                     </div>
// //                   </div>
// //                 ) : (
// //                   /* --- Premium Animated Warning Screen with Custom Brand Color #F5A524 --- */
// //                   <div className="p-8">
// //                     <div className="flex flex-col items-center text-center">
                      
// //                       {/* Brand Colored Radar Pulse Icon Component */}
// //                       <div className="relative mb-8 mt-2 flex h-24 w-24 items-center justify-center">
// //                         <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-[#F5A524]/40"></div>
// //                         <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-[#F5A524] opacity-20"></span>
// //                         <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A524]/10 to-[#F5A524]/20 shadow-[inset_0_2px_10px_rgba(245,165,36,0.1)]">
// //                           <TrashIcon className="h-7 w-7 text-[#F5A524]" />
// //                         </div>
// //                       </div>
                      
// //                       <DialogTitle as="h3" className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-[26px] font-black tracking-tight text-transparent">
// //                         Delete Exam
// //                       </DialogTitle>
// //                       <p className="mt-3 px-1 text-[14.5px] leading-relaxed text-slate-500">
// //                         This action will <strong className="font-bold text-[#F5A524]">permanently erase</strong> this exam and its configurations. Proceed?
// //                       </p>

// //                       {/* Action Buttons */}
// //                       <div className="mt-10 flex w-full flex-col gap-3">
                        
// //                         {/* Custom Brand Colored Delete Button */}
// //                         <button
// //                           type="button"
// //                           onClick={onOk}
// //                           disabled={confirmLoading}
// //                           className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_15px_rgba(245,165,36,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(245,165,36,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
// //                         >
// //                           <div className="absolute inset-0 bg-gradient-to-r from-[#F5A524] to-[#d98b15] transition-all duration-300 group-hover:scale-105"></div>
// //                           <span className="relative flex items-center justify-center gap-2">
// //                             {confirmLoading ? (
// //                               <>
// //                                 <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
// //                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //                                 </svg>
// //                                 Deleting...
// //                               </>
// //                             ) : (
// //                               <>
// //                                 <TrashIcon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
// //                                 Yes, Delete Exam
// //                               </>
// //                             )}
// //                           </span>
// //                         </button>

// //                         <button
// //                           type="button"
// //                           onClick={onClose}
// //                           disabled={confirmLoading}
// //                           className="flex w-full cursor-pointer items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-[15px] font-bold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 disabled:opacity-50"
// //                         >
// //                           Cancel
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 )}
// //               </DialogPanel>
// //             </TransitionChild>
// //           </div>
// //         </div>
// //       </Dialog>
// //     </Transition>
// //   );
// // }

// // ModalBox.propTypes = {
// //   show: PropTypes.bool.isRequired,
// //   onClose: PropTypes.func.isRequired,
// //   data: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
// //   list: PropTypes.func.isRequired,
// // };

// import React, { useEffect, useState, Fragment } from "react";
// import PropTypes from "prop-types";
// import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
// import { XMarkIcon, DocumentCheckIcon, DocumentMinusIcon } from "@heroicons/react/24/outline";
// import { toast } from "sonner"; 
// import { deleteExam } from "api/applicationmanagement/exam"; 

// export function ModalBox({
//   show,
//   onClose,
//   data = "",
//   list
// }) {
//   const [confirmLoading, setConfirmLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [progress, setProgress] = useState(100);

//   const onOk = async () => {
//     if (!data && data !== 0) {
//       toast.error("Invalid Exam Identifier");
//       return;
//     }
//     try {
//       setConfirmLoading(true);
//       const res = await deleteExam({ ExamId: data }); 
      
//       if (res?.code === 200) {
//         toast.success(res.message || "Exam deleted successfully");
//         list(); 
//         setSuccess(true);
//         // Start progress bar animation timeout
//         setTimeout(() => setProgress(0), 50);
//       } else {
//         toast.error(res?.message || "Deletion failed");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Something went wrong during deletion");
//     } finally {
//       setConfirmLoading(false);
//     }
//   };

//   useEffect(() => {
//     let timer;
//     if (success && show) {
//       timer = setTimeout(() => {
//         onClose();
//       }, 1500); 
//     }
//     return () => {
//       if (timer) clearTimeout(timer);
//     };
//   }, [success, show, onClose]);

//   useEffect(() => {
//     if (!show) {
//       setSuccess(false);
//       setConfirmLoading(false);
//       setProgress(100); // Reset progress bar
//     }
//   }, [show]);

//   return (
//     <Transition appear show={show} as={Fragment}>
//       <Dialog as="div" className="relative z-[9999]" onClose={() => !confirmLoading && onClose()}>
        
//         {/* Animated Dark Blur Backdrop */}
//         <TransitionChild
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0 backdrop-blur-none"
//           enterTo="opacity-100 backdrop-blur-md"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100 backdrop-blur-md"
//           leaveTo="opacity-0 backdrop-blur-none"
//         >
//           <div className="fixed inset-0 bg-slate-900/50 transition-all" />
//         </TransitionChild>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
            
//             {/* Highly Animated Bouncy Panel */}
//             <TransitionChild
//               as={Fragment}
//               enter="transform transition ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-500"
//               enterFrom="opacity-0 translate-y-12 scale-90 rotate-2"
//               enterTo="opacity-100 translate-y-0 scale-100 rotate-0"
//               leave="transform transition ease-in duration-200"
//               leaveFrom="opacity-100 translate-y-0 scale-100"
//               leaveTo="opacity-0 translate-y-12 scale-95"
//             >
//               <DialogPanel className="relative w-full max-w-sm transform overflow-hidden rounded-[28px] bg-white text-left align-middle shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all">
                
//                 {/* Close Button Float */}
//                 {!confirmLoading && !success && (
//                   <button
//                     onClick={onClose}
//                     className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100/50 text-slate-400 backdrop-blur-sm transition-all duration-300 hover:rotate-90 hover:bg-slate-200 hover:text-slate-800"
//                   >
//                     <XMarkIcon className="h-5 w-5" />
//                   </button>
//                 )}

//                 {success ? (
//                   /* --- Animated Success Screen (Exam Document Removed successfully) --- */
//                   <div className="relative flex flex-col items-center justify-center px-6 py-14 text-center">
//                     <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
//                       <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-20 duration-1000"></span>
//                       <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 shadow-inner">
//                         <DocumentCheckIcon className="h-10 w-10 text-emerald-500" />
//                       </div>
//                     </div>
//                     <DialogTitle as="h3" className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-[24px] font-extrabold text-transparent">
//                       Exam Removed
//                     </DialogTitle>
//                     <p className="mt-3 text-[14px] font-medium text-slate-500">
//                       The exam document has been successfully deleted.
//                     </p>

//                     {/* Dynamic Progress Bar Indicator */}
//                     <div className="absolute bottom-0 left-0 h-1.5 w-full bg-slate-100">
//                       <div 
//                         className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all ease-linear"
//                         style={{ width: `${progress}%`, transitionDuration: '1500ms' }}
//                       />
//                     </div>
//                   </div>
//                 ) : (
//                   /* --- Premium Animated Warning Screen with Exam Theme Icon --- */
//                   <div className="p-8">
//                     <div className="flex flex-col items-center text-center">
                      
//                       {/* Brand Colored Radar Pulse Icon Component */}
//                       <div className="relative mb-8 mt-2 flex h-24 w-24 items-center justify-center">
//                         <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-[#F5A524]/40"></div>
//                         <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-[#F5A524] opacity-20"></span>
//                         <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A524]/10 to-[#F5A524]/20 shadow-[inset_0_2px_10px_rgba(245,165,36,0.1)]">
//                           <DocumentMinusIcon className="h-7 w-7 text-[#F5A524]" />
//                         </div>
//                       </div>
                      
//                       <DialogTitle as="h3" className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-[26px] font-black tracking-tight text-transparent">
//                         Delete Exam
//                       </DialogTitle>
//                       <p className="mt-3 px-1 text-[14.5px] leading-relaxed text-slate-500">
//                         This action will <strong className="font-bold text-[#F5A524]">permanently erase</strong> this exam record and its configurations. Proceed?
//                       </p>

//                       {/* Action Buttons */}
//                       <div className="mt-10 flex w-full flex-col gap-3">
                        
//                         {/* Custom Brand Colored Delete Button */}
//                         <button
//                           type="button"
//                           onClick={onOk}
//                           disabled={confirmLoading}
//                           className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_15px_rgba(245,165,36,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(245,165,36,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
//                         >
//                           <div className="absolute inset-0 bg-gradient-to-r from-[#F5A524] to-[#d98b15] transition-all duration-300 group-hover:scale-105"></div>
//                           <span className="relative flex items-center justify-center gap-2">
//                             {confirmLoading ? (
//                               <>
//                                 <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
//                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                 </svg>
//                                 Deleting...
//                               </>
//                             ) : (
//                               <>
//                                 <DocumentMinusIcon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
//                                 Yes, Delete Exam
//                               </>
//                             )}
//                           </span>
//                         </button>

//                         <button
//                           type="button"
//                           onClick={onClose}
//                           disabled={confirmLoading}
//                           className="flex w-full cursor-pointer items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-[15px] font-bold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 disabled:opacity-50"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </DialogPanel>
//             </TransitionChild>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }

// ModalBox.propTypes = {
//   show: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   data: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   list: PropTypes.func.isRequired,
// };

import React, { useEffect, useState, Fragment } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon, DocumentCheckIcon, DocumentMinusIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner"; 
import { deleteExam } from "api/applicationmanagement/exam"; 

export function ModalBox({
  show,
  onClose,
  data = "",
  list
}) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(100);

  const onOk = async () => {
    if (!data && data !== 0) {
      toast.error("Invalid Exam Identifier");
      return;
    }
    try {
      setConfirmLoading(true);
      const res = await deleteExam({ ExamId: data }); 
      
      if (res?.code === 200) {
        toast.success(res.message || "Exam deleted successfully");
        list(); 
        setSuccess(true);
        // Start progress bar animation timeout
        setTimeout(() => setProgress(0), 50);
      } else {
        toast.error(res?.message || "Deletion failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during deletion");
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (success && show) {
      timer = setTimeout(() => {
        onClose();
      }, 1500); 
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, show, onClose]);

  useEffect(() => {
    if (!show) {
      setSuccess(false);
      setConfirmLoading(false);
      setProgress(100); // Reset progress bar
    }
  }, [show]);

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={() => !confirmLoading && onClose()}>
        
        {/* Animated Dark Blur Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-md"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 backdrop-blur-md"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-slate-900/50 transition-all" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            
            {/* Highly Animated Bouncy Panel */}
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-500"
              enterFrom="opacity-0 translate-y-12 scale-90 rotate-2"
              enterTo="opacity-100 translate-y-0 scale-100 rotate-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-12 scale-95"
            >
              <DialogPanel className="relative w-full max-w-sm transform overflow-hidden rounded-[28px] bg-white text-left align-middle shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all">
                
                {/* Close Button Float */}
                {!confirmLoading && !success && (
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100/50 text-slate-400 backdrop-blur-sm transition-all duration-300 hover:rotate-90 hover:bg-slate-200 hover:text-slate-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}

                {success ? (
                  /* --- Animated Success Screen (Matched with Brand Color #F5A524) --- */
                  <div className="relative flex flex-col items-center justify-center px-6 py-14 text-center">
                    <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F5A524] opacity-20 duration-1000"></span>
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#F5A524]/20 to-[#F5A524]/10 shadow-inner">
                        <DocumentCheckIcon className="h-10 w-10 text-[#F5A524]" />
                      </div>
                    </div>
                    <DialogTitle as="h3" className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-[24px] font-extrabold text-transparent">
                      Exam Removed
                    </DialogTitle>
                    <p className="mt-3 text-[14px] font-medium text-slate-500">
                      The exam document has been successfully deleted.
                    </p>

                    {/* Dynamic Progress Bar Indicator (Brand Color) */}
                    <div className="absolute bottom-0 left-0 h-1.5 w-full bg-slate-100">
                      <div 
                        className="h-full bg-gradient-to-r from-[#F5A524] to-[#d98b15] transition-all ease-linear"
                        style={{ width: `${progress}%`, transitionDuration: '1500ms' }}
                      />
                    </div>
                  </div>
                ) : (
                  /* --- Premium Animated Warning Screen with Exam Theme Icon --- */
                  <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                      
                      {/* Brand Colored Radar Pulse Icon Component */}
                      <div className="relative mb-8 mt-2 flex h-24 w-24 items-center justify-center">
                        <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-[#F5A524]/40"></div>
                        <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-[#F5A524] opacity-20"></span>
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A524]/10 to-[#F5A524]/20 shadow-[inset_0_2px_10px_rgba(245,165,36,0.1)]">
                          <DocumentMinusIcon className="h-7 w-7 text-[#F5A524]" />
                        </div>
                      </div>
                      
                      <DialogTitle as="h3" className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-[26px] font-black tracking-tight text-transparent">
                        Delete Exam
                      </DialogTitle>
                      <p className="mt-3 px-1 text-[14.5px] leading-relaxed text-slate-500">
                        This action will <strong className="font-bold text-[#F5A524]">permanently erase</strong> this exam record and its configurations. Proceed?
                      </p>

                      {/* Action Buttons */}
                      <div className="mt-10 flex w-full flex-col gap-3">
                        
                        {/* Custom Brand Colored Delete Button */}
                        <button
                          type="button"
                          onClick={onOk}
                          disabled={confirmLoading}
                          className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_15px_rgba(245,165,36,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(245,165,36,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#F5A524] to-[#d98b15] transition-all duration-300 group-hover:scale-105"></div>
                          <span className="relative flex items-center justify-center gap-2">
                            {confirmLoading ? (
                              <>
                                <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <DocumentMinusIcon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
                                Yes, Delete Exam
                              </>
                            )}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={onClose}
                          disabled={confirmLoading}
                          className="flex w-full cursor-pointer items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-[15px] font-bold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

ModalBox.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  list: PropTypes.func.isRequired,
};
