import { Link } from 'react-router-dom';
import { Wrench, UserPlus, LogIn, ArrowRight } from 'lucide-react';

const ServiceHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Venkateswara Motors
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Service Center Admin Portal
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Welcome to Venkateswara Motors Service Center Administration.
            Manage service requests, track repairs, and oversee operations efficiently.
          </p>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* New User Registration Card */}
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">New Admin?</h3>
              <p className="text-gray-600 mb-6">
                Register here to create a new administrator account and access the service center management system.
              </p>
              <Link
                to="/service/signup"
                className="btn-primary inline-flex items-center px-6 py-3 text-lg font-semibold"
              >
                Register Here
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Existing User Login Card */}
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Existing Admin?</h3>
              <p className="text-gray-600 mb-6">
                Sign in to access your dashboard and manage service center operations.
              </p>
              <Link
                to="/service/login"
                className="btn-primary inline-flex items-center px-6 py-3 text-lg font-semibold"
              >
                Login Here
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Admin Features Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Admin Dashboard Features
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Service Management</h4>
                <p className="text-gray-600">
                  Track and manage all service requests, repairs, and maintenance schedules.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Inventory Control</h4>
                <p className="text-gray-600">
                  Monitor parts inventory, order management, and stock levels in real-time.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Reports & Analytics</h4>
                <p className="text-gray-600">
                  Generate detailed reports on service performance and business metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 Venkateswara Motors. All rights reserved.
            </p>
            <div className="mt-4 space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceHome; 