const mongoose = require('mongoose')

const ParkingLotRegistrationSchema = mongoose.Schema({
    // Owner Details
    ownerName: {
        type: String,
        required: true
    },
    ownerEmail: {
        type: String,
        required: true
    },
    ownerMobile: {
        type: String,
        required: true
    },
    ownerAadhar: {
        type: String,
        required: true
    },
    aadharCardPhoto: {
        type: String,
        required: true
    },
    
    // Parking Lot Details
    parkingLotName: {
        type: String,
        required: true
    },
    parkingValidDocuments: {
        type: String,
        required: true
    },
    parkingImage: {
        type: String
    },
    numberOfCarSlots: {
        type: Number,
        required: true
    },
    numberOfBikeSlots: {
        type: Number,
        required: true
    },
    parkingChargesBikePerHour: {
        type: Number
    },
    parkingChargesCarPerHour: {
        type: Number
    },
    
    // Location Details
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    
    // Status and Timestamps
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    adminNotes: {
        type: String
    }
})

const ParkingLotRegistration = mongoose.model('ParkingLotRegistration', ParkingLotRegistrationSchema)

module.exports = ParkingLotRegistration 