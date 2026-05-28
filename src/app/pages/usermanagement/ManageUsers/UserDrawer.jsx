import React, { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import PropTypes from "prop-types";

// UI Components
import { Avatar, Badge, Button } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  MapIcon,
  BriefcaseIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

export function UserDrawer({ isOpen, close, user }) {
  const { locale } = useLocaleContext();

  if (!user) return null;
  const u = user;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return dayjs(dateStr).locale(locale).format("DD MMM, YYYY");
  };

  // Chota aur clean info row
  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 py-2 px-1">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="truncate text-sm font-medium text-slate-700">
          {value || "—"}
        </span>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={close}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px]" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-sm">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size={10}
                          name={`${u.FirstName} ${u.LastName}`}
                          initialColor="auto"
                          classNames={{ display: "text-sm font-bold" }}
                        />
                        <div>
                          <h2 className="text-base font-semibold text-slate-800">
                            {u.FirstName} {u.LastName}
                          </h2>
                          <p className="text-[11px] text-slate-500 uppercase font-medium tracking-tight">
                            User Profile
                          </p>
                        </div>
                      </div>
                      <button onClick={close} className="rounded-full p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                      <div className="space-y-6">
                        
                        {/* Section 1 */}
                        <div>
                          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                            Basic Details
                          </h3>
                          <div className="divide-y divide-slate-50 rounded-xl border border-slate-50 bg-slate-50/30 px-3">
                            <InfoRow icon={EnvelopeIcon} label="Email" value={u.email} />
                            <InfoRow icon={PhoneIcon} label="Mobile" value={u.mobile} />
                            <InfoRow icon={BriefcaseIcon} label="Role" value={u.role} />
                          </div>
                        </div>

                        {/* Section 2 */}
                        <div>
                          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                            Location & Status
                          </h3>
                          <div className="divide-y divide-slate-50 rounded-xl border border-slate-50 bg-slate-50/30 px-3">
                            <InfoRow icon={MapIcon} label="State" value={u.State || u.StateName} />
                            <InfoRow icon={CalendarDaysIcon} label="Registered" value={formatDate(u.addedOn)} />
                            <div className="flex items-center gap-3 py-2 px-1">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                <IdentificationIcon className="h-4.5 w-4.5 text-slate-500" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-medium uppercase text-slate-400">Status</span>
                                <Badge 
                                  color={u.status === 1 ? "success" : "warning"} 
                                  variant="soft" 
                                  className=" w-fit py-2 px-2 text-[14px] font-bold"
                                >
                                  {u.status === 1 ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Footer - Custom Simple Button */}
                    <div className="border-t border-slate-100 p-5 bg-white">
                      <Button
                        onClick={close}
                        className="w-full flex cursor-pointer items-center justify-center gap-2 rounded px-4 py-2 font-semibold text-white shadow-md shadow-blue-100 transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                          background: "linear-gradient(135deg, rgb(54, 109, 176), rgb(255, 69, 66))",
                          fontSize: '13px'
                        }}
                      >
                        Close Profile
                      </Button>
               
                    </div>

                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

UserDrawer.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  user: PropTypes.object,
};