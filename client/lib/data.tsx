import { LayoutDashboard, Users } from "lucide-react";

export const navLinks = [
  {
    name: "Dashboard",
    path: "/",
    icon: <LayoutDashboard className="text-text dark:text-darkText" />,
  },
  {
    name: "Users",
    path: "/users",
    icon: <Users className="text-text dark:text-darkText" />,
  },
];

export const usersTableHeaders = [
  { name: "Name", key: "name" },
  { name: "Email", key: "email" },
  { name: "Phone", key: "phone" },
  { name: "Address", key: "address" },
  { name: "Date Joined", key: "dateJoined" },
];
