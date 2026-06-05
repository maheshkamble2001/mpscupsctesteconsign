import { BookOpenIcon, ClipboardDocumentListIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';

const ROOT_APPLICATION = '/applicationmanagement';

const path = (root, item) => `${root}${item}`;

export const applicationmanagement = {
  id: 'applicationmanagement',
  type: NAV_TYPE_ROOT,
  role: 400000,
  path: ROOT_APPLICATION,
  title: 'Application Management',
  Icon: ClipboardDocumentListIcon, // root icon
  childs: [
    {
      id: 'applicationmanagement.subjects',
      path: path(ROOT_APPLICATION, '/manage-subjects'),
      type: NAV_TYPE_ITEM,
      role: 400001,
      title: 'Subjects',
      Icon: Squares2X2Icon,
    },
    {
      id: 'applicationmanagement.exam-types',
      path: path(ROOT_APPLICATION, '/manage-exam-types'),
      type: NAV_TYPE_ITEM,
      role: 400002,
      title: 'Exam Types',
      Icon: Squares2X2Icon,
    },
    {
      id: 'applicationmanagement.questions-bank',
      path: path(ROOT_APPLICATION, '/manage-questions-bank'),
      type: NAV_TYPE_ITEM,
      role: 400003,
      title: 'Questions Bank',
      Icon: Squares2X2Icon,
    },
    {
      id: 'applicationmanagement.exams',
      path: path(ROOT_APPLICATION, '/manage-exams'),
      type: NAV_TYPE_ITEM,
      role: 400004,
      title: 'Exams',
      Icon: Squares2X2Icon,
    },
    {
      id: 'applicationmanagement.courses',
      path: path(ROOT_APPLICATION, '/manage-courses'),
      type: NAV_TYPE_ITEM,
      role: 400004,
      title: 'Courses',
      Icon: Squares2X2Icon,
    },
    {
      id: 'applicationmanagement.curriculam',
      path: path(ROOT_APPLICATION, '/manage-curriculam'),
      type: NAV_TYPE_ITEM,
      role: 400004,
      title: 'Course Curriculum',
      Icon: Squares2X2Icon,
    },
    {
      id: 'applicationmanagement.tests',
      path: path(ROOT_APPLICATION, '/manage-tests'),
      type: NAV_TYPE_ITEM,
      role: 400004,
      title: 'Tests',
      Icon: Squares2X2Icon,
    },

  
  ],
};