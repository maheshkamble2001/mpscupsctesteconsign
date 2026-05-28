// Import Dependencies
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { TbCoins, TbUser } from "react-icons/tb";
import { Link } from "react-router";
import { useContext, useEffect, useState } from "react";

// Local Imports
import { Avatar, AvatarDot, Button } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import Cookies from "js-cookie";
import { UserIcon } from "lucide-react";

const links = [
  {
    id: "1",
    title: "Profile",
    description: "Your profile Setting",
    to: "/settings/general",
    Icon: TbUser,
    color: "warning",
  },
  {
    id: "5",
    title: "Settings",
    description: "Webapp settings",
    to: "/settings/appearance",
    Icon: Cog6ToothIcon,
    color: "success",
  },
];

export function Profile() {
  const { logout } = useAuthContext();

  // ✅ use state to track current user info
  const [userName, setUserName] = useState(Cookies.get("name"));
  const [userEmail, setUserEmail] = useState(Cookies.get("email"));
  const [userRole, setUserRole] = useState(Cookies.get("rolename"));

  // ✅ update state whenever cookies change (after login/logout)
  useEffect(() => {
    const interval = setInterval(() => {
      setUserName(Cookies.get("name"));
      setUserEmail(Cookies.get("email"));
      setUserRole(Cookies.get("rolename"));
    }, 500); // check every 500ms
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (userName) {
      const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <span className="flex h-full w-full cursor-pointer items-center justify-center rounded-full text-sm font-medium text-white bg-[#2F3C5E] hover:bg-[#2c3a5f]">
          {initials}
        </span>
      );
    }

    return <UserIcon className="h-6 w-6 text-gray-500" />;
  };

  return (
    <Popover className="relative">
      <PopoverButton as={Avatar} size={12} role="button">
        {renderContent()}
      </PopoverButton>
      <Transition
        enter="duration-200 ease-out"
        enterFrom="translate-x-2 opacity-0"
        enterTo="translate-x-0 opacity-100"
        leave="duration-200 ease-out"
        leaveFrom="translate-x-0 opacity-100"
        leaveTo="translate-x-2 opacity-0"
      >
        <PopoverPanel
          anchor={{ to: "right end", gap: 12 }}
          className="border-gray-150 shadow-soft dark:border-dark-600 dark:bg-dark-700 z-70 flex w-64 flex-col rounded-lg border bg-white transition dark:shadow-none"
        >
          {({ close }) => (
            <>
              <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-2 py-3">
                <div className="w-[50px] h-[50px]">{renderContent()}</div>
                <div>
                  <Link
                    className="hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400 text-base font-medium text-gray-700"
                    to="/settings/general"
                  >
                    {userName}
                  </Link>
                  <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-400">
                   {userRole}
                  </p>
                </div>
                  
              </div>
               
              <div className="flex flex-col pt-2 pb-5">
                <div className="">
                  <Button className="w-full gap-2" onClick={logout}>
                    <ArrowLeftStartOnRectangleIcon className="size-4.5" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
