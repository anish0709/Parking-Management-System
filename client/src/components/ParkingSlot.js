import DummyPaymentModal from './DummyPaymentModal';
import { useDummyPayment } from '../hooks/useDummyPayment';

const {
  isPaymentModalOpen,
  paymentData,
  openPaymentModal,
  closePaymentModal,
  handlePaymentSuccess,
  handlePaymentFailure
} = useDummyPayment();

const handlePayment = async (formData) => {
  const result = await dispatch(asynccheckOutBookSlot({ formData, userData: user }));
  
  if (result.payload && result.payload.order) {
    // Open dummy payment modal with order data
    openPaymentModal({
      orderId: result.payload.order.id,
      amount: result.payload.order.amount,
      charges: result.payload.formData.charges,
      description: `Parking slot booking at ${formData.lotName}`
    });
  }
};

return (
  <>
    {/* ... existing JSX ... */}
    <DummyPaymentModal
      open={isPaymentModalOpen}
      onClose={closePaymentModal}
      amount={paymentData?.amount || 0}
      orderId={paymentData?.orderId || ''}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentFailure={handlePaymentFailure}
      description={paymentData?.description || "Parking Slot Booking"}
    />
  </>
); 