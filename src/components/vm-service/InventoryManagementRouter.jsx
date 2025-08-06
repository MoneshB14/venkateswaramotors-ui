import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Package,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Hash,
  Users,
  BarChart3
} from 'lucide-react';
import InventoryItemsPage from './InventoryItemsPage';
import SuppliersPage from './SuppliersPage';

const InventoryManagementRouter = () => {
  const [activeTab, setActiveTab] = useState('items');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">
            Manage spare parts, suppliers, and stock levels
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'items'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Inventory Items
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'suppliers'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            Suppliers
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'items' ? (
        <InventoryItemsPage />
      ) : (
        <SuppliersPage />
      )}
    </div>
  );
};

export default InventoryManagementRouter; 