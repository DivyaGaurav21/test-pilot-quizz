import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

          <div className="mt-6 divide-y divide-gray-100">
            <div className="py-4">
              <p className="text-sm text-gray-500">Name</p>
              <p className="mt-1 font-medium text-gray-900">
                {user?.name || "-"}
              </p>
            </div>

            <div className="py-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 font-medium text-gray-900">
                {user?.email || "-"}
              </p>
            </div>

            <div className="py-4">
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="mt-1 font-medium capitalize text-gray-900">
                {user?.role || "user"}
              </p>
            </div>
          </div>

          <Link
            to="/exams"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse Exams
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Profile;
