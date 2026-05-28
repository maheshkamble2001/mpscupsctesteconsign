import { Squares2X2Icon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { ShieldCheckIcon,} from 'lucide-react';

const ROOT_DASHBOARDS = '/usermanagement'

const path = (root, item) => `${root}${item}`;

export const usermanagement = {
    id: 'usermanagement',
    type: NAV_TYPE_ROOT,
    role: 300000,
    path: '/usermanagement',
    title: 'User Management',
    Icon: UserGroupIcon,
    childs: [
        {
            id: 'usermanagement.users',
            path: path(ROOT_DASHBOARDS, '/manage-users'),
            type: NAV_TYPE_ITEM,
            role: 300001,
            title: 'Manage Users',
            Icon: Squares2X2Icon ,
        },
        {
            id: 'usermanagement.roles',
            path: path(ROOT_DASHBOARDS, '/user-role'),
            type: NAV_TYPE_ITEM,
            role: 	300002,
            title: 'Manage User Roles',
            Icon:  Squares2X2Icon,
        }
   
    ]
}
