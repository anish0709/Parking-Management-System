import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

const ParkingLotRegistrationForm = () => {
  const [formData, setFormData] = useState({
    // Owner Details
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    ownerAadhar: '',
    aadharCardPhoto: null,

    // Parking Lot Details
    parkingLotName: '',
    parkingValidDocuments: null,
    parkingImage: null,
    numberOfCarSlots: '',
    numberOfBikeSlots: '',
    parkingChargesBikePerHour: '',
    parkingChargesCarPerHour: '',

    // Location Details
    state: '',
    city: '',
    country: 'India',
    pincode: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Create FormData for file uploads
      const submitData = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          if (formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/parking-registration/submit`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setMessage({
        type: 'success',
        text: response.data.message,
      });

      // Reset form
      setFormData({
        ownerName: '',
        ownerEmail: '',
        ownerMobile: '',
        ownerAadhar: '',
        aadharCardPhoto: null,
        parkingLotName: '',
        parkingValidDocuments: null,
        parkingImage: null,
        numberOfCarSlots: '',
        numberOfBikeSlots: '',
        parkingChargesBikePerHour: '',
        parkingChargesCarPerHour: '',
        state: '',
        city: '',
        country: 'India',
        pincode: '',
        location: '',
        latitude: '',
        longitude: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom align='center' color='primary'>
          Add your Parking Lot details
        </Typography>

        <Typography variant='body1' sx={{ mb: 3, textAlign: 'center' }}>
          Fill the details of your parking lot given below, once you submit the form, within next
          3-4 days, members of our team will visit the parking site and verify the details. After
          which your parking lot will be added to our website.
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Owner Details Section */}
          <Typography variant='h5' gutterBottom sx={{ mt: 3, mb: 2 }}>
            Owner Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Name'
                name='ownerName'
                value={formData.ownerName}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email ID'
                name='ownerEmail'
                type='email'
                value={formData.ownerEmail}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Mobile Number'
                name='ownerMobile'
                value={formData.ownerMobile}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Aadhar Number'
                name='ownerAadhar'
                value={formData.ownerAadhar}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <label htmlFor='aadhar-card-photo'>
                <Input
                  accept='image/*'
                  id='aadhar-card-photo'
                  name='aadharCardPhoto'
                  type='file'
                  onChange={handleFileChange}
                  required
                />
                <Button variant='outlined' component='span' fullWidth sx={{ py: 2 }}>
                  {formData.aadharCardPhoto
                    ? formData.aadharCardPhoto.name
                    : 'Upload Aadhar Card photo (Required)'}
                </Button>
              </label>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Parking Lot Details Section */}
          <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
            Parking Lot Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Name Of Parking Lot'
                name='parkingLotName'
                value={formData.parkingLotName}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <label htmlFor='parking-valid-documents'>
                <Input
                  accept='.pdf,.doc,.docx,image/*'
                  id='parking-valid-documents'
                  name='parkingValidDocuments'
                  type='file'
                  onChange={handleFileChange}
                  required
                />
                <Button variant='outlined' component='span' fullWidth sx={{ py: 2 }}>
                  {formData.parkingValidDocuments
                    ? formData.parkingValidDocuments.name
                    : 'Upload Parking Valid Documents (Required)'}
                </Button>
              </label>
            </Grid>

            <Grid item xs={12}>
              <label htmlFor='parking-image'>
                <Input
                  accept='image/*'
                  id='parking-image'
                  name='parkingImage'
                  type='file'
                  onChange={handleFileChange}
                />
                <Button variant='outlined' component='span' fullWidth sx={{ py: 2 }}>
                  {formData.parkingImage
                    ? formData.parkingImage.name
                    : 'Upload Parking Image (Optional)'}
                </Button>
              </label>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Number of Car Slots'
                name='numberOfCarSlots'
                type='number'
                value={formData.numberOfCarSlots}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Number Of Bike Slots'
                name='numberOfBikeSlots'
                type='number'
                value={formData.numberOfBikeSlots}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Parking charges Bike per hour'
                name='parkingChargesBikePerHour'
                type='number'
                value={formData.parkingChargesBikePerHour}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Parking Charges Car per hour'
                name='parkingChargesCarPerHour'
                type='number'
                value={formData.parkingChargesCarPerHour}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Location Details Section */}
          <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
            Location Of Your Parking Lot
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='State'
                name='state'
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='City'
                name='city'
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Country'
                name='country'
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Pincode'
                name='pincode'
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='LOCATION'
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder='Full address of your parking lot'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='LATITUDE'
                name='latitude'
                type='number'
                step='any'
                value={formData.latitude}
                onChange={handleInputChange}
                required
                placeholder='e.g., 28.6139'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='LONGITUDE'
                name='longitude'
                type='number'
                step='any'
                value={formData.longitude}
                onChange={handleInputChange}
                required
                placeholder='e.g., 77.2090'
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type='submit'
              variant='contained'
              size='large'
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Registration'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ParkingLotRegistrationForm;
