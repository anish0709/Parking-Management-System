import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  Grow,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Container } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';

import SearchIcon from '@mui/icons-material/Search';
import Alert from '../../Utils/Alert';
import {
  useMapEvents,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  Polygon,
} from 'react-leaflet';
import { asyncgetParkingLot, clearFreeParkingLots, setAlert } from '../../state';
import ParkingLotCard from './ParkingLotCard';
import carImg from '../../images/car_cartoon_img.svg';
import bikeImg from '../../images/bike_cartoon_img2.svg';

import L from 'leaflet';
import 'leaflet-routing-machine';
// import L from 'leaflet-routing-machine/dist/leaflet-routing-machine.js'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import LocationOn from '@mui/icons-material/LocationOn';
import { getLocByAddress } from '../../api';
import CustomCircularProgress from '../../Utils/CustomCircularProgress';
import { StaticDateTimePicker } from '@mui/x-date-pickers';

const initialState = {
  city: '',
  state: '',
  country: '',
  postalCode: '',
};
const HomePage = () => {
  const theme = useTheme();
  const styles = {
    formCont: {
      marginTop: '5em',
      width: 'auto',
      marginBottom: '2em',
    },
    formContainer: {
      marginTop: '1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '70%',
      margin: 'auto',
      '@media (max-width : 500px)': {
        width: '100%',
      },
    },
    slotsCont: {
      marginTop: '1em',
      [theme.breakpoints.up('sm')]: {
        padding: '1em',
      },
    },
    titlePaper: {
      // display: "flex",
      // flexDirection: "column",
      textAlign: 'center',
      alignItems: 'center',
      position: 'relative',
      // height: "auto",
      backgroundColor: theme.palette.primary.dark,

      padding: '0.5em 0 0.5em 0',
      color: '#ffc',
      fontWeight: 600,
    },
  };
  const user = useSelector((state) => state.auth.user);
  const alert = useSelector((state) => state.auth.alert);
  const freeParkingLots = useSelector((state) => state.auth.freeParkingLots);
  const parkingLotsMessage = useSelector((state) => state.auth.parkingLotsMessage || '');
  const isParkingLotsNearby = useSelector((state) => state.auth.isParkingLotsNearby);
  const inProgress1 = useSelector((state) => state.auth.inProgress1);
  const [startTime, setStartTime] = useState(
    dayjs(format(Date.now() + 1000 * 60 * 60, 'yyyy-MM-dd hh:00 a..aa')),
  );
  const [endTime, setEndTime] = useState(
    dayjs(format(Date.now() + 1000 * 60 * 60 * 2, 'yyyy-MM-dd hh:00 a..aa')),
  );
  const [vehicleType, setVehicleType] = useState('');
  const [position, setPosition] = useState([19.1485, 73.133]);
  const [formData, setFormData] = useState(initialState);
  const [polyline, setPolyline] = useState([
    [19.2735184, 73.1183625],
    [19.2735184, 73.1724625],
    [19.2159482, 73.1724625],
    [19.2159482, 73.1183625],
    [19.2735184, 73.1183625],
  ]);
  const [distances, setDistances] = useState([]);
  const [times, setTimes] = useState([]);
  const [changePos, setChangePos] = useState(false);
  const [foundCurrLoc, setFoundCurrLoc] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [mobileView, setMobileView] = useState(false);
  const [zoomLvl, setZoomLvl] = useState(13);
  const [lat, setLat] = useState('19.1485');
  const [lng, setLng] = useState('73.133');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const greenIcon = new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const redIcon = new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    dispatch(clearFreeParkingLots());
  }, [vehicleType]);
  useEffect(() => {
    if (alert.msg == 'Slot Booked') {
      navigate('/profile');
    }
  }, [alert]);
  useEffect(() => {
    if (!user._id) {
      navigate('/login');
    } else {
      if (user.role === 'admin') {
        navigate('/admindb');
      }
    }
  }, [user]);

  const MyMapComponent = () => {
    const map = useMapEvents({
      click(e) {
        const loc = [];
        loc.push(e.latlng['lat']);
        loc.push(e.latlng['lng']);
        setPosition(loc);
      },
      zoomend: () => {
        if (!map) return;
        const position = map.getCenter();
        const loc = [];
        loc.push(position.lat);
        loc.push(position.lng);
        setPosition(loc);
        setZoomLvl(map.getZoom());
      },
      dragend: () => {
        if (!map) return;
        const position = map.getCenter();
        const loc = [];
        loc.push(position.lat);
        loc.push(position.lng);
        setPosition(loc);
        setZoomLvl(map.getZoom());
      },
    });
    useEffect(() => {
      if (!foundCurrLoc) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const loc = [position.coords.latitude, position.coords.longitude];
              setPosition(loc);
              map.flyTo({ lat: loc[0], lng: loc[1] }, zoomLvl);
            },
            () => {
              console.log('Not able to locate');
            },
          );
        }
        setFoundCurrLoc(true);
      }
    }, [map]);

    useEffect(() => {
      if (changePos) {
        console.log(changePos);
        console.log('FLying to position', position[0], position[1]);
        map.flyTo({ lat: position[0], lng: position[1] }, zoomLvl);
        setChangePos(false);
      }
    }, [changePos]);

    return null;
  };

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 600 && window.innerWidth > 100
        ? setMobileView(true)
        : setMobileView(false);
    };
    setResponsiveness();

    window.addEventListener('resize', setResponsiveness);
  }, []);

  useEffect(() => {
    if (alert.msg) {
      if (alert.msg === 'Slot Booking Successful') {
        navigate('/profile');
      }
    }
  }, [alert]);

  // Add debug logging for parking lots data
  useEffect(() => {
    if (freeParkingLots && freeParkingLots.length > 0) {
      console.log('Received parking lots:', freeParkingLots.length);
      freeParkingLots.forEach((lot, index) => {
        console.log(
          `Lot ${index + 1}: ${lot.name}, Location: [${
            lot.location ? lot.location[0] : 'undefined'
          }, ${lot.location ? lot.location[1] : 'undefined'}], Free slots: ${
            lot.freeSlots ? lot.freeSlots.length : 0
          }`,
        );
      });
    } else {
      console.log('No parking lots received in state');
    }
  }, [freeParkingLots]);

  // Ensure parking lots are rendered properly with valid coordinates
  const validParkingLots = useMemo(() => {
    if (!freeParkingLots || freeParkingLots.length === 0) return [];

    return freeParkingLots.map((lot) => {
      // Ensure lot has valid coordinates
      const validLocation =
        lot.location &&
        Array.isArray(lot.location) &&
        lot.location.length >= 2 &&
        !isNaN(parseFloat(lot.location[0])) &&
        !isNaN(parseFloat(lot.location[1]))
          ? [parseFloat(lot.location[0]), parseFloat(lot.location[1])]
          : [position[0], position[1]]; // fallback to user position

      return {
        ...lot,
        location: validLocation,
      };
    });
  }, [freeParkingLots, position]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(startTime, endTime, position);
    // console.log(startTime.format('YYYY-MM-DD HH:00'))
    const data = {
      startTime: startTime.format('YYYY-MM-DD HH:00'),
      endTime: endTime.format('YYYY-MM-DD HH:00'),
      lat: position[0],
      lng: position[1],
      vehicleType: vehicleType,
      currTime: dayjs(Date.now()).format('YYYY-MM-DD HH:00'),
    };

    setStartTime(dayjs(format(startTime.unix() * 1000, 'yyyy-MM-dd hh:00 a..aa')));
    setEndTime(dayjs(format(endTime.unix() * 1000, 'yyyy-MM-dd hh:00 a..aa')));
    console.log(data);
    dispatch(asyncgetParkingLot(data));
  };

  const handleChangeStart = (newValue) => {
    dispatch(clearFreeParkingLots());
    setStartTime(newValue);
    setEndTime(newValue.add(1, 'hour'));
  };

  const handleChangeEnd = (newValue) => {
    // const newVal = newValue
    // console.log({...newVal,minute:0})
    dispatch(clearFreeParkingLots());
    newValue.set('minute', 0);
    console.log(newValue);
    setEndTime(newValue);
  };

  const validateAddress = (address) => {
    const { city, state, country, postalCode } = address;
    if (!city || !state || !country || !postalCode) {
      return 'All address fields are required.';
    }
    return null;
  };

  const validateCoordinates = (lat, lng) => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return 'Valid latitude and longitude are required.';
    }
    return null;
  };

  const handleSearchLoc = async (e) => {
    const id = e.target.id;
    if (id === 'searchAddr') {
      const error = validateAddress(formData);
      if (error) {
        dispatch(setAlert({ msg: error, type: 'error' }));
        return;
      }
      try {
        const loc = await getLocByAddress(formData);
        if (loc.msg) {
          dispatch(setAlert({ msg: loc.msg, type: 'info' }));
          return;
        }
        setPosition([parseFloat(loc.lat), parseFloat(loc.lng)]);
        setChangePos(true);
      } catch (err) {
        dispatch(setAlert({ msg: 'Failed to fetch location. Please try again.', type: 'error' }));
      }
    } else {
      const error = validateCoordinates(lat, lng);
      if (error) {
        dispatch(setAlert({ msg: error, type: 'error' }));
        return;
      }
      setPosition([parseFloat(lat), parseFloat(lng)]);
      setChangePos(true);
    }
  };

  const handleChangeVehicleTp = (e) => {
    setVehicleType(e.target.value);
    dispatch(clearFreeParkingLots());
  };

  const handleChangeSortBy = (e) => {
    setSortBy(e.target.value);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const compByCharges = (a, b) => {
    if (a.charges < b.charges) {
      return -1;
    }
    if (a.charges > b.charges) {
      return 1;
    }
    return 0;
  };

  // Add component for showing distance-based message
  const ParkingLotProximityMessage = () => {
    if (!parkingLotsMessage || freeParkingLots.length === 0) return null;

    return (
      <Grid item xs={12}>
        <Paper
          sx={{
            padding: '1em',
            marginBottom: '1em',
            backgroundColor: isParkingLotsNearby
              ? theme.palette.success.light
              : theme.palette.warning.light,
          }}
        >
          <Typography variant='h6' align='center'>
            {parkingLotsMessage}
          </Typography>
        </Paper>
      </Grid>
    );
  };

  // Fetch suggestions from Nominatim
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`,
      {
        signal: controller.signal,
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data);
      });
    return () => controller.abort();
  }, [searchTerm]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setLat(suggestion.lat);
    setLng(suggestion.lon);
    setSearchTerm(suggestion.display_name);
    setShowSuggestions(false);
    setZoomLvl(15);
  };

  return (
    <Grow in>
      <Container sx={styles.formCont}>
        <Alert />
        <Grid container alignItems='center' justifyContent='center'>
          <Grid item xs={12} sm={12}>
            <Paper sx={{ ...styles.titlePaper, color: 'yellow' }}>
              <Typography variant='h3'>Search & Book a Slot</Typography>
            </Paper>
          </Grid>
        </Grid>
        <form autoComplete='off' noValidate sx={styles.form} onSubmit={handleSubmit}>
          <Grid container sx={styles.formContainer} spacing={3} justifyContent='center'>
            <Grid item xs={12} sm={12}>
              <Paper sx={styles.titlePaper}>
                <Typography variant='h3'>Choose Vehicle Type</Typography>
              </Paper>
            </Grid>
            {!mobileView ? <Grid item xs={2}></Grid> : null}

            <Grid item xs={6} sm={3}>
              {vehicleType === 'Car' ? (
                <Button onClick={() => setVehicleType('')}>
                  <Paper sx={{ bgcolor: theme.palette.primary.dark }}>
                    <img src={carImg} width='60%' alt='car Image' />
                  </Paper>
                </Button>
              ) : (
                <Button onClick={() => setVehicleType('Car')}>
                  <Paper>
                    <img src={carImg} width='60%' alt='car Image' />
                  </Paper>
                </Button>
              )}
            </Grid>
            {!mobileView ? <Grid item xs={2}></Grid> : null}
            <Grid item xs={6} sm={3}>
              {vehicleType === 'Bike' ? (
                <Button onClick={() => setVehicleType('')}>
                  <Paper sx={{ bgcolor: theme.palette.primary.dark }}>
                    <img src={bikeImg} width='94%' alt='car Image' />
                  </Paper>
                </Button>
              ) : (
                <Button onClick={() => setVehicleType('Bike')}>
                  <Paper>
                    <img src={bikeImg} width='94%' alt='car Image' />
                  </Paper>
                </Button>
              )}
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={12} sm={12}>
              <Paper sx={styles.titlePaper}>
                <Typography variant='h3'>Select a Time Slot to Park</Typography>
              </Paper>
            </Grid>
            {!mobileView ? <Grid item xs={0} sm={2}></Grid> : null}

            <Grid item sx={{ textAlign: 'center' }} xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  disablePast
                  minDateTime={dayjs(format(Date.now(), 'yyyy-MM-dd hh:00 a..aa'))}
                  maxDate={dayjs(format(Date.now(), 'yyyy-MM-dd hh:00 a..aa')).add(1, 'day')}
                  label='pick a start time'
                  value={startTime}
                  views={['year', 'month', 'day', 'hours']}
                  name='startTime'
                  onChange={handleChangeStart}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item sx={{ textAlign: 'center' }} xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  minDateTime={startTime.add(1, 'hour')}
                  maxDateTime={startTime.add(3, 'hour')}
                  views={['year', 'month', 'day', 'hours']}
                  label='pick a end time'
                  value={endTime}
                  name='endTime'
                  onChange={handleChangeEnd}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            {!mobileView ? <Grid item xs={0} sm={2}></Grid> : null}

            <Grid item xs={12}>
              <Typography align='center' sx={{ mb: 2 }} variant='h6' component='div'>
                Instructions
              </Typography>
              <Paper sx={{ padding: '0.5em' }}>
                <List>
                  <ListItem disablePadding>
                    <ListItemText primary='* You are allowed to book a time slot of minimum 1 hour and maximum 3 hours' />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText primary='* You can only book a time slot for future 2 days' />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Paper sx={styles.titlePaper}>
                <Typography sx={{ display: 'inline' }} variant='h3'>
                  Pick a location
                </Typography>
                <LocationOn fontSize='large' />
              </Paper>
            </Grid>
            <Grid item xs={0} sm={2}></Grid>
            <Grid item xs={12} sm={8} sx={styles.ipFields}>
              <Grid container spacing={1} justifyContent='center'>
                <Grid item xs={6}>
                  <Grid container sx={{ textAlign: 'center' }} justifyContent='center'>
                    <Grid item xs={12}>
                      <TextField
                        name='lat'
                        type='text'
                        InputLabelProps={{ shrink: true }}
                        variant='outlined'
                        required
                        fullWidth
                        label='Latitude'
                        onChange={(e) => setLat(e.target.value)}
                        value={lat}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container sx={{ textAlign: 'center' }} justifyContent='center'>
                    <Grid item xs={12}>
                      <TextField
                        name='lng'
                        type='text'
                        InputLabelProps={{ shrink: true }}
                        variant='outlined'
                        required
                        fullWidth
                        label='Longitude'
                        onChange={(e) => setLng(e.target.value)}
                        value={lng}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6} sm={5}>
                  <Button
                    fullWidth
                    id='searchlatLon'
                    color='secondary'
                    sx={{ margin: 'auto', paddingX: '2em', paddingY: '1em' }}
                    variant='contained'
                    endIcon={<SearchIcon />}
                    onClick={handleSearchLoc}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={0} sm={2}></Grid>
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Typography variant='h2' component='h2'>
                OR
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={styles.titlePaper}>
                <Typography sx={{ display: 'inline' }} variant='h3'>
                  Search By Address
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                name='city'
                type='text'
                variant='outlined'
                required
                fullWidth
                label='City'
                onChange={handleChange}
                value={formData.city}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                name='state'
                type='text'
                variant='outlined'
                required
                fullWidth
                label='State'
                onChange={handleChange}
                value={formData.state}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                name='country'
                type='text'
                variant='outlined'
                required
                fullWidth
                label='Country'
                onChange={handleChange}
                value={formData.country}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                name='postalCode'
                type='text'
                variant='outlined'
                required
                fullWidth
                label='Postal Code'
                onChange={handleChange}
                value={formData.postalCode}
              />
            </Grid>
            <Grid item xs={5}>
              <Button
                fullWidth
                id='searchAddr'
                color='secondary'
                sx={{ margin: 'auto', paddingX: '2em', paddingY: '1em' }}
                variant='contained'
                endIcon={<SearchIcon />}
                onClick={handleSearchLoc}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={12}>
              <MapContainer style={{ height: '400px' }} center={position} zoom={zoomLvl}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                {validParkingLots.length > 0
                  ? validParkingLots.map((freeLot) => (
                      <Marker
                        icon={greenIcon}
                        position={[freeLot.location[0], freeLot.location[1]]}
                      >
                        <Popup>
                          <strong>{freeLot.name}</strong>
                          <br />
                          {freeLot.address}
                          <br />
                          Charges: ₹{freeLot.charges}
                          <br />
                          Free Slots: {freeLot.freeSlots.length}
                        </Popup>
                      </Marker>
                    ))
                  : null}
                <Marker icon={redIcon} position={position}>
                  <Popup>You selected location</Popup>
                </Marker>
                <MyMapComponent />
              </MapContainer>
            </Grid>
            <Grid item xs={12}>
              {inProgress1 ? (
                // <Button fullWidth sx={{ padding: "1em" }}  variant="contained" type="submit">Find Parking Lots</Button>
                <Button
                  fullWidth
                  sx={{ padding: '1em', fontWeight: 'bold', fontSize: 14 }}
                  color='info'
                  variant='contained'
                  startIcon={<CircularProgress size={20} sx={{ color: 'yellow' }} />}
                >
                  Searching..
                </Button>
              ) : (
                <Button
                  fullWidth
                  sx={{ padding: '1em', fontWeight: 'bold', fontSize: 14 }}
                  variant='contained'
                  type='submit'
                >
                  Find Parking Lots
                </Button>
              )}
            </Grid>
          </Grid>
        </form>

        {inProgress1 ? (
          <Grid container sx={styles.slotsCont} spacing={3} justifyContent='center'>
            <Grid item>
              <CustomCircularProgress inProgress={inProgress1} />
            </Grid>
          </Grid>
        ) : (
          <>
            {validParkingLots.length > 0 ? (
              <>
                <Grid container sx={styles.slotsCont} spacing={3}>
                  {/* Add proximity message component */}
                  <ParkingLotProximityMessage />

                  <Grid item xs={6} sm={8}></Grid>
                  <Grid item xs={6} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-label'>Sort By</InputLabel>
                      <Select
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        value={sortBy}
                        defaultValue={'distance'}
                        label='Sort By'
                        onChange={handleChangeSortBy}
                      >
                        <MenuItem value={'distance'}>Distance</MenuItem>
                        <MenuItem value={'charges'}>Charges</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container sx={styles.slotsCont} spacing={3}>
                  {sortBy == 'distance'
                    ? validParkingLots.map((freeLot) => (
                        <Grid item xs={12} sm={4}>
                          <ParkingLotCard
                            startTime={startTime}
                            endTime={endTime}
                            vehicleType={vehicleType}
                            type={freeLot.type}
                            lotImages={freeLot.lotImages}
                            key={freeLot.id}
                            id={freeLot.id}
                            freeSlots={freeLot.freeSlots}
                            engagedSlots={freeLot.engagedSlots}
                            address={freeLot.address}
                            lat={freeLot.location[0]}
                            lng={freeLot.location[1]}
                            currLoc={position}
                            charges={freeLot.charges}
                            name={freeLot.name}
                            noOfFreeSlots={freeLot.freeSlots.length}
                            distance={parseInt(freeLot.distance)}
                          />
                        </Grid>
                      ))
                    : [...validParkingLots]
                        .sort((a, b) => a.charges - b.charges)
                        .map((freeLot) => (
                          <Grid item xs={12} sm={4}>
                            <ParkingLotCard
                              startTime={startTime}
                              endTime={endTime}
                              vehicleType={vehicleType}
                              type={freeLot.type}
                              lotImages={freeLot.lotImages}
                              key={freeLot.id}
                              id={freeLot.id}
                              freeSlots={freeLot.freeSlots}
                              engagedSlots={freeLot.engagedSlots}
                              address={freeLot.address}
                              lat={freeLot.location[0]}
                              lng={freeLot.location[1]}
                              currLoc={position}
                              charges={freeLot.charges}
                              name={freeLot.name}
                              noOfFreeSlots={freeLot.freeSlots.length}
                              distance={parseInt(freeLot.distance)}
                            />
                          </Grid>
                        ))}
                </Grid>
              </>
            ) : null}
          </>
        )}

        {/* Location Search Bar */}
        <div style={{ marginBottom: '1em', position: 'relative', zIndex: 1000 }}>
          <input
            type='text'
            placeholder='Search for a location...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            style={{
              width: '100%',
              padding: '0.5em',
              fontSize: '1em',
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                position: 'absolute',
                width: '100%',
                background: '#fff',
                border: '1px solid #ccc',
                maxHeight: 200,
                overflowY: 'auto',
                zIndex: 1001,
              }}
            >
              {suggestions.map((s, idx) => (
                <li
                  key={s.place_id}
                  style={{ padding: '0.5em', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </Grow>
  );
};

export default HomePage;
