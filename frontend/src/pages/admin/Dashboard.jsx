// src/pages/admin/Dashboard.jsx

import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaRupeeSign,
} from "react-icons/fa";

const cards = [
  {
    title: "Total Revenue",
    value: "₹1,25,450",
    icon: <FaRupeeSign />,
    color: "bg-green-500",
  },
  {
    title: "Total Orders",
    value: "328",
    icon: <FaShoppingCart />,
    color: "bg-blue-500",
  },
  {
    title: "Products",
    value: "156",
    icon: <FaBoxOpen />,
    color: "bg-orange-500",
  },
  {
    title: "Customers",
    value: "84",
    icon: <FaUsers />,
    color: "bg-purple-500",
  },
];

const recentOrders = [
  {
    id: "#1001",
    customer: "Senthil Kumar",
    amount: "₹1,499",
    status: "Delivered",
  },
  {
    id: "#1002",
    customer: "Rahul",
    amount: "₹899",
    status: "Pending",
  },
  {
    id: "#1003",
    customer: "Arun",
    amount: "₹2,350",
    status: "Shipped",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-gray-500">
          Welcome back to Jod PetHub Admin Panel 👋
        </p>
      </div>

      {/* Statistics Cards */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {card.value}
                </h2>

              </div>

              <div
                className={`${card.color} rounded-xl p-4 text-white text-2xl`}
              >
                {card.icon}
              </div>

            </div>
          </div>
        ))}

      </div>

      {/* Charts */}

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl bg-white p-6 shadow-md h-80">

          <h2 className="mb-4 text-xl font-semibold">
            Sales Overview
          </h2>

          <div className="flex h-full items-center justify-center text-gray-400">
            Chart will be added here
          </div>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md h-80">

          <h2 className="mb-4 text-xl font-semibold">
            Revenue Overview
          </h2>

          <div className="flex h-full items-center justify-center text-gray-400">
            Chart will be added here
          </div>

        </div>

      </div>

      {/* Recent Orders */}

      <div className="rounded-2xl bg-white p-6 shadow-md">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Recent Orders
          </h2>

          <button className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            View All
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b text-left">

                <th className="py-3">Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {recentOrders.map((order) => (

                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="py-4">{order.id}</td>

                  <td>{order.customer}</td>

                  <td>{order.amount}</td>

                  <td>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      {order.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;