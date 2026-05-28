import {  LockClosedIcon, Squares2X2Icon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import {  UserPlusIcon } from 'lucide-react';

const ROOT_DASHBOARDS = '/menuaccessmanagement'

const path = (root, item) => `${root}${item}`;

export const menuaccessmanagement = {
    id: 'menuaccessmanagement',
    type: NAV_TYPE_ROOT,
    role: 100000,
    path: '/menuaccessmanagement',
    title: 'Menu Management',
    Icon: LockClosedIcon,
    childs: [
        {
            id: 'menuaccessmanagement.menu',
            path: path(ROOT_DASHBOARDS, '/menu'),
            type: NAV_TYPE_ITEM,
            role:100001,
            title: 'Menu',
            Icon: Squares2X2Icon,
        },
            {
            id: 'menuaccessmanagement.assign-menu',
            path: path(ROOT_DASHBOARDS, '/assign-menu'),
             role: 100003,
            type: NAV_TYPE_ITEM,
            title: 'Assign Menu',
            Icon: Squares2X2Icon,
        },
           {
            id: 'menuaccessmanagement.assigned-menu',
            path: path(ROOT_DASHBOARDS, '/assigned-menu'),
            type: NAV_TYPE_ITEM,
            role: 100002,
            title: 'Assigned Menu',
            Icon:  Squares2X2Icon,
        },
    

    ]
    }