import { LockClosedIcon, Squares2X2Icon, ClipboardDocumentCheckIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { UserPlusIcon } from 'lucide-react';

const ROOT_DASHBOARDS = '/studentmanagement'

const path = (root, item) => `${root}${item}`;

export const studentmanagement = {
    id: 'studentmanagement',
    type: NAV_TYPE_ROOT,
    role: 100000,
    path: '/studentmanagement',
    title: 'Student Management',
    Icon: AcademicCapIcon,
    childs: [
        {
            id: 'studentmanagement.students',
            path: path(ROOT_DASHBOARDS, '/manage-students'),
            type: NAV_TYPE_ITEM,
            role: 100001,
            title: 'Students',
            Icon: Squares2X2Icon,
        },
        {
            id: 'studentmanagement.studentexams',
            path: path(ROOT_DASHBOARDS, '/student-exams'),
            type: NAV_TYPE_ITEM,
            role: 100001,
            title: 'Student Exams',
            Icon: Squares2X2Icon,
        },
    ]
}