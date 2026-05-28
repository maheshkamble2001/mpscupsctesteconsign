import { applicationmanagement } from "./applicationNavigation";
import { coursemanagment } from "./courseNavigatiion";
import { dashboards } from "./dashboards";
import { lecturesmanagement } from "./lectures";
import { menuaccessmanagement } from "./menuaccessmanagement";
import { studentmanagement } from "./studentNavigation";
import { usermanagement } from "./usermanagementNavigation";

export const navigation = [
  dashboards,
  //  lecturesmanagement,
  usermanagement,
  studentmanagement,
  applicationmanagement,
  // coursemanagment,
  menuaccessmanagement,
  

];

export { baseNavigation } from "./baseNavigation";
