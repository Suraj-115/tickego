function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold">My Tickets</h2>
          <p className="text-gray-600 mt-2">
            View all your booked tickets.
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold">Registered Events</h2>
          <p className="text-gray-600 mt-2">
            Check the events you've registered for.
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="text-gray-600 mt-2">
            Manage your account details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;