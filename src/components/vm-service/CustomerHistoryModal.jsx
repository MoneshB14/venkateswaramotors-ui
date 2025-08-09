// Legacy CustomerHistoryModal - kept for backward compatibility
// New enhanced version available at ./customer-history/EnhancedCustomerHistoryModal.jsx
import React from 'react';
import EnhancedCustomerHistoryModal from './customer-history/EnhancedCustomerHistoryModal';

const CustomerHistoryModal = (props) => {
  return <EnhancedCustomerHistoryModal {...props} />;
};

export default CustomerHistoryModal;
