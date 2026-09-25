import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2.5 text-sm font-medium ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <aside className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm lg:w-64">
      <nav className="space-y-1">
        <NavLink to="/admin" end className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/admin/import" className={linkClass}>
          Import Exam
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
