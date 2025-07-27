import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useGlobal } from '../../contexts/GlobalContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Trash2, 
  UserPlus,
  Settings,
  Shield
} from 'lucide-react';

const ToastAndConfirmExample = () => {
  const { 
    showSuccess, 
    showError, 
    showInfo, 
    showWarning,
    confirmDelete,
    confirmAction,
    showConfirmation
  } = useGlobal();

  // Example toast functions
  const handleSuccessToast = () => {
    showSuccess('Success!', 'Operation completed successfully.');
  };

  const handleErrorToast = () => {
    showError('Error!', 'Something went wrong. Please try again.');
  };

  const handleInfoToast = () => {
    showInfo('Information', 'Here is some important information for you.');
  };

  const handleWarningToast = () => {
    showWarning('Warning!', 'Please be careful with this action.');
  };

  // Example confirmation dialogs
  const handleDeleteConfirmation = () => {
    confirmDelete({
      itemName: 'user',
      onConfirm: () => {
        console.log('User deleted!');
        showSuccess('User Deleted', 'The user has been successfully deleted.');
      }
    });
  };

  const handleCustomConfirmation = () => {
    confirmAction({
      title: 'Confirm Action',
      message: 'Are you sure you want to perform this custom action? This will affect multiple items.',
      confirmText: 'Proceed',
      cancelText: 'Cancel',
      variant: 'warning',
      icon: Settings,
      onConfirm: () => {
        console.log('Custom action confirmed!');
        showSuccess('Action Completed', 'The custom action has been performed successfully.');
      }
    });
  };

  const handleAdvancedConfirmation = () => {
    showConfirmation({
      title: 'System Update',
      message: 'This will update the system configuration. The system will be temporarily unavailable during the update. Do you want to continue?',
      confirmText: 'Update System',
      cancelText: 'Cancel',
      variant: 'warning',
      icon: Shield,
      onConfirm: () => {
        console.log('System update confirmed!');
        showSuccess('System Updated', 'The system has been updated successfully.');
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Toast & Confirmation Examples</h1>
        <p className="text-gray-600">Examples of how to use the global toast and confirmation system</p>
      </div>

      {/* Toast Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Toast Notifications
          </CardTitle>
          <CardDescription>
            Different types of toast notifications you can show
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={handleSuccessToast}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Success
            </Button>
            
            <Button 
              onClick={handleErrorToast}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Error
            </Button>
            
            <Button 
              onClick={handleInfoToast}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Info className="h-4 w-4 mr-2" />
              Info
            </Button>
            
            <Button 
              onClick={handleWarningToast}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Warning
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Confirmation Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Confirmation Dialogs
          </CardTitle>
          <CardDescription>
            Different types of confirmation dialogs you can use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleDeleteConfirmation}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
            
            <Button 
              onClick={handleCustomConfirmation}
              variant="outline"
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Custom Action
            </Button>
            
            <Button 
              onClick={handleAdvancedConfirmation}
              variant="outline"
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              System Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
          <CardDescription>
            Instructions for implementing toast and confirmation dialogs in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Import the Global Context</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm">
{`import { useGlobal } from '../../contexts/GlobalContext';`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Use the Hook in Your Component</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm">
{`const { showSuccess, showError, confirmDelete } = useGlobal();`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Show Toast Notifications</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm">
{`// Success toast
showSuccess('Success!', 'Operation completed successfully.');

// Error toast
showError('Error!', 'Something went wrong.');

// Info toast
showInfo('Information', 'Here is some info.');

// Warning toast
showWarning('Warning!', 'Please be careful.');`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Show Confirmation Dialogs</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm">
{`// Simple delete confirmation
confirmDelete({
  itemName: 'user',
  onConfirm: () => {
    // Your delete logic here
  }
});

// Custom confirmation
confirmAction({
  title: 'Confirm Action',
  message: 'Are you sure?',
  confirmText: 'Proceed',
  variant: 'warning',
  onConfirm: () => {
    // Your action logic here
  }
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToastAndConfirmExample; 