import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import {
  X,
  Bell,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';

const ReminderDialog = ({ isOpen, customerData, onClose, onSetReminder }) => {
  const [reminderType, setReminderType] = useState('maintenance');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [notificationMethod, setNotificationMethod] = useState('phone');
  const [loading, setLoading] = useState(false);

  const reminderTypes = [
    { id: 'maintenance', label: 'Maintenance Due', color: 'primary' },
    { id: 'follow_up', label: 'Follow-up Call', color: 'success' },
    { id: 'payment', label: 'Payment Reminder', color: 'warning' },
    { id: 'service', label: 'Service Booking', color: 'info' },
    { id: 'custom', label: 'Custom Reminder', color: 'default' }
  ];

  const notificationMethods = [
    { id: 'phone', label: 'Phone Call', icon: Phone },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notification', label: 'In-App Notification', icon: Bell }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reminderData = {
        customerId: customerData?.id,
        customerName: customerData?.customerName,
        registration: customerData?.vehicleRegistration,
        type: reminderType,
        scheduledDate: `${reminderDate}T${reminderTime}`,
        message: reminderMessage,
        notificationMethod,
        contact: customerData?.contactNumber,
        email: customerData?.email
      };

      await onSetReminder(reminderData);
      onClose();
    } catch (error) {
      console.error('Failed to set reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMessage = (type) => {
    const customerName = customerData?.customerName || 'Customer';
    const registration = customerData?.vehicleRegistration || '';
    
    const messages = {
      maintenance: `Hi ${customerName}, your vehicle ${registration} is due for maintenance. Please schedule a service appointment.`,
      follow_up: `Hi ${customerName}, following up on your recent service for ${registration}. How was your experience?`,
      payment: `Hi ${customerName}, friendly reminder about the pending payment for your recent service (${registration}).`,
      service: `Hi ${customerName}, time to schedule your next service for ${registration}. Book now for the best slots!`,
      custom: ''
    };
    
    return messages[type] || '';
  };

  React.useEffect(() => {
    if (reminderType !== 'custom') {
      setReminderMessage(getDefaultMessage(reminderType));
    }
  }, [reminderType, customerData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Set Reminder</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Schedule a reminder for {customerData?.customerName || 'this customer'}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="h-9 w-9 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Customer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Name</div>
                    <div className="font-medium text-gray-900">{customerData?.customerName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Vehicle</div>
                    <div className="font-medium text-gray-900">{customerData?.vehicleRegistration || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Phone</div>
                    <div className="font-medium text-gray-900">{customerData?.contactNumber || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div className="font-medium text-gray-900 truncate">{customerData?.email || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Reminder Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Reminder Type</label>
                <div className="flex flex-wrap gap-2">
                  {reminderTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setReminderType(type.id)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        reminderType === type.id
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notification Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Notification Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {notificationMethods.map((method) => {
                    const Icon = method.icon;
                    const isDisabled = method.id === 'email' && !customerData?.email;
                    
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => !isDisabled && setNotificationMethod(method.id)}
                        disabled={isDisabled}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                          notificationMethod === method.id
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : isDisabled
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {method.label}
                        {isDisabled && <AlertCircle className="w-3 h-3 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Enter your reminder message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {reminderMessage.length}/500 characters
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Setting...
                    </>
                  ) : (
                    'Set Reminder'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReminderDialog;
