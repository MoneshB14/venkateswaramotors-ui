import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown,
  Filter,
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  searchable = true,
  sortable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  className,
  onRowClick,
  loading = false,
  emptyMessage = "No data available"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = data;

    // Search functionality
    if (searchable && searchTerm) {
      filtered = data.filter(row =>
        columns.some(col => {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Sort functionality
    if (sortable && sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns, searchable, sortable]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination ? processedData.slice(startIndex, startIndex + pageSize) : processedData;

  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };



  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Controls */}
      {(searchable || filterable) && (
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {searchable && (
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            )}
            
            {filterable && (
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider",
                      // Apply column-specific alignment
                      column.align === 'right' ? "text-right" : column.align === 'center' ? "text-center" : "text-left",
                      sortable && "cursor-pointer hover:bg-gray-100 select-none",
                      // Dynamic column widths for better alignment
                      index === 0 && "w-2/5", // Bill Details - wider
                      index === 1 && "w-1/6", // Subtotal
                      index === 2 && "w-1/6", // Total Amount  
                      index === 3 && "w-1/6", // Payment Status
                      index === 4 && "w-1/12" // Actions - narrower
                    )}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className={cn(
                      "flex items-center gap-2",
                      column.align === 'right' ? "justify-end" : column.align === 'center' ? "justify-center" : "justify-start"
                    )}>
                      {column.header}
                      {sortable && (
                        <div className="flex flex-col">
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "transition-colors duration-150",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                      onRowClick && "cursor-pointer hover:bg-blue-50",
                      !onRowClick && "hover:bg-gray-100"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column, colIndex) => (
                      <td 
                        key={column.key} 
                        className={cn(
                          "px-4 py-4 text-sm text-gray-900",
                          // Ensure content doesn't overflow in fixed columns
                          "overflow-hidden"
                        )}
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, processedData.length)} of {processedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { DataTable };
