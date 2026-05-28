import { Squares2X2Icon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { ShieldCheckIcon,} from 'lucide-react';

const ROOT_DASHBOARDS = '/coursemanagment'

const path = (root, item) => `${root}${item}`;

export const coursemanagment = {
    id: 'coursemanagment',
    type: NAV_TYPE_ROOT,
    role: 300000,
    path: '/coursemanagment',
    title: 'Course Management',
    Icon: UserGroupIcon,
    childs: [
        {
            id: 'coursemanagment.courses',
            path: path(ROOT_DASHBOARDS, '/manage-courses'),
            type: NAV_TYPE_ITEM,
            role: 300001,
            title: 'Manage Courses',
            Icon: Squares2X2Icon ,
        },
   
    ]
}
