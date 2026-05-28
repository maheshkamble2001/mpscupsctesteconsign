import { HomeIcon, ChartBarIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { MenuIcon, MenuSquareIcon, Video } from 'lucide-react';

const ROOT_DASHBOARDS = '/lecturesmanagement'

const path = (root, item) => `${root}${item}`;

export const lecturesmanagement = {
    id: 'lecturesmanagement',
    type: NAV_TYPE_ROOT,
    role: 100000,
    path: '/lecturemanagement/lectures',
    title: 'Lectures',
    Icon: Video,
    childs: [
        // {
        //     id: 'lectures.menu',
        //     path: path(ROOT_DASHBOARDS, '/menu'),
        //     type: NAV_TYPE_ITEM,
        //     role:100001,
        //     title: 'Menu',
        //     Icon: HomeIcon,
        // },
           

    ]
    }