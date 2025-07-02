import { useState } from 'react';
import axios from 'axios';

export const useDummyPayment = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const openPaymentModal = (orderData) => {
    setPaymentData(orderData);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentData(null);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      // Send payment verification to backend
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/payments/verifyBookingPayment?charges=${paymentData.charges}`,
        paymentDetails
      );

      // Close modal and redirect to success page
      closePaymentModal();
      window.location.href = `${process.env.REACT_APP_URL || 'http://localhost:3000'}/paymentSuccess?type=book`;
    } catch (error) {
      console.error('Payment verification failed:', error);
      // Handle error - could show error message or redirect to failure page
      window.location.href = `${process.env.REACT_APP_URL || 'http://localhost:3000'}/paymentFailure?type=book`;
    }
  };

  const handlePaymentFailure = () => {
    closePaymentModal();
    // Could show error message or redirect to failure page
    window.location.href = `${process.env.REACT_APP_URL || 'http://localhost:3000'}/paymentFailure?type=book`;
  };

  return {
    isPaymentModalOpen,
    paymentData,
    openPaymentModal,
    closePaymentModal,
    handlePaymentSuccess,
    handlePaymentFailure
  };
}; 