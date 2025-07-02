import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useSelector } from 'react-redux';

const ParkingRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/parking-registration/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setMessage({
        type: 'error',
        text: 'Failed to fetch registrations',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/parking-registration/admin/${selectedRegistration._id}/status`,
        {
          status,
          adminNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage({
        type: 'success',
        text: `Registration ${status} successfully`,
      });

      // Update the local state
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg._id === selectedRegistration._id
            ? { ...reg, status, adminNotes, reviewedAt: new Date() }
            : reg,
        ),
      );

      setDialogOpen(false);
      setSelectedRegistration(null);
      setStatus('');
      setAdminNotes('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update status',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Parking Lot Registrations
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {registrations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='h6' color='textSecondary'>
            No parking lot registrations found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Owner Name</TableCell>
                <TableCell>Parking Lot Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Slots</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration._id}>
                  <TableCell>{registration.ownerName}</TableCell>
                  <TableCell>{registration.parkingLotName}</TableCell>
                  <TableCell>
                    {registration.city}, {registration.state}
                  </TableCell>
                  <TableCell>
                    {registration.numberOfCarSlots} Cars, {registration.numberOfBikeSlots} Bikes
                  </TableCell>
                  <TableCell>{formatDate(registration.submittedAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={registration.status.toUpperCase()}
                      color={getStatusColor(registration.status)}
                      size='small'
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => {
                        setSelectedRegistration(registration);
                        setDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Registration Details</DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Owner Details
                    </Typography>
                    <Typography>
                      <strong>Name:</strong> {selectedRegistration.ownerName}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {selectedRegistration.ownerEmail}
                    </Typography>
                    <Typography>
                      <strong>Mobile:</strong> {selectedRegistration.ownerMobile}
                    </Typography>
                    <Typography>
                      <strong>Aadhar:</strong> {selectedRegistration.ownerAadhar}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Parking Lot Details
                    </Typography>
                    <Typography>
                      <strong>Name:</strong> {selectedRegistration.parkingLotName}
                    </Typography>
                    <Typography>
                      <strong>Car Slots:</strong> {selectedRegistration.numberOfCarSlots}
                    </Typography>
                    <Typography>
                      <strong>Bike Slots:</strong> {selectedRegistration.numberOfBikeSlots}
                    </Typography>
                    <Typography>
                      <strong>Car Charges:</strong> ₹{selectedRegistration.parkingChargesCarPerHour}
                      /hr
                    </Typography>
                    <Typography>
                      <strong>Bike Charges:</strong> ₹
                      {selectedRegistration.parkingChargesBikePerHour}/hr
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Location Details
                    </Typography>
                    <Typography>
                      <strong>Address:</strong> {selectedRegistration.location}
                    </Typography>
                    <Typography>
                      <strong>City:</strong> {selectedRegistration.city}
                    </Typography>
                    <Typography>
                      <strong>State:</strong> {selectedRegistration.state}
                    </Typography>
                    <Typography>
                      <strong>Pincode:</strong> {selectedRegistration.pincode}
                    </Typography>
                    <Typography>
                      <strong>Coordinates:</strong> {selectedRegistration.latitude},{' '}
                      {selectedRegistration.longitude}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {selectedRegistration.status === 'pending' && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' gutterBottom>
                        Update Status
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant='contained'
                          color='success'
                          onClick={() => setStatus('approved')}
                          sx={{ mr: 2 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant='contained'
                          color='error'
                          onClick={() => setStatus('rejected')}
                        >
                          Reject
                        </Button>
                      </Box>
                      {status && (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label='Admin Notes'
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder='Add notes for the owner...'
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {selectedRegistration.status !== 'pending' && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' gutterBottom>
                        Review Details
                      </Typography>
                      <Typography>
                        <strong>Status:</strong> {selectedRegistration.status.toUpperCase()}
                      </Typography>
                      <Typography>
                        <strong>Reviewed At:</strong> {formatDate(selectedRegistration.reviewedAt)}
                      </Typography>
                      {selectedRegistration.adminNotes && (
                        <Typography>
                          <strong>Notes:</strong> {selectedRegistration.adminNotes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedRegistration?.status === 'pending' && status && (
            <Button onClick={handleStatusUpdate} variant='contained'>
              Update Status
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParkingRegistrations;
