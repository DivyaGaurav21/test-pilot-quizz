// import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  // const { user } = useAuth();

  return (
    <div className="max-w-xl rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-5 space-y-2">
        {/* <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p> */}
      </div>
    </div>
  );
}
