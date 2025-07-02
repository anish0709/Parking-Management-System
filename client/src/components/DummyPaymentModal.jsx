import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CreditCard, Payment, CheckCircle, Error } from '@mui/icons-material';

const DummyPaymentModal = ({
  open,
  onClose,
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentFailure,
  description = 'Parking Slot Booking',
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    // Simulate payment processing
    setTimeout(() => {
      // Simulate 90% success rate
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        // Generate dummy payment details
        const paymentId = 'pay_' + Math.random().toString(36).substring(2, 15);
        const signature = 'sig_' + Math.random().toString(36).substring(2, 15);

        onPaymentSuccess({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });
      } else {
        setError('Payment failed. Please try again.');
        onPaymentFailure();
      }
      setLoading(false);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const isValidForm =
    cardNumber.replace(/\s/g, '').length === 16 &&
    cardHolder.trim().length > 0 &&
    expiry.length === 5 &&
    cvv.length === 3;

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display='flex' alignItems='center' justifyContent='center' gap={1}>
          <Payment color='primary' />
          <Typography variant='h6'>Dummy Payment Gateway</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity='info' sx={{ mb: 2 }}>
          This is a dummy payment system for testing. No real money will be charged.
        </Alert>

        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Payment Details
            </Typography>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Order ID: {orderId}
            </Typography>
            <Typography variant='h5' color='primary' fontWeight='bold'>
              ₹{(amount / 100).toFixed(2)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {description}
            </Typography>
          </CardContent>
        </Card>

        <Box component='form' noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Card Number'
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder='1234 5678 9012 3456'
                inputProps={{ maxLength: 19 }}
                InputProps={{
                  startAdornment: <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Card Holder Name'
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder='John Doe'
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Expiry Date'
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder='MM/YY'
                inputProps={{ maxLength: 5 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label='CVV'
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder='123'
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            <strong>Test Card Numbers:</strong>
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            • 4111 1111 1111 1111 (Visa)
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            • 5555 5555 5555 4444 (Mastercard)
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            • Any 16-digit number will work
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handlePayment}
          disabled={!isValidForm || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
        >
          {loading ? 'Processing...' : `Pay ₹${(amount / 100).toFixed(2)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DummyPaymentModal;
