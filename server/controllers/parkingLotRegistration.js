const ParkingLotRegistration = require('../models/ParkingLotRegistration')
const sendEmail2 = require('../Utils/sendEmail2')

// Submit parking lot registration form
exports.submitParkingLotRegistration = async (req, res) => {
    try {
        const {
            ownerName,
            ownerEmail,
            ownerMobile,
            ownerAadhar,
            parkingLotName,
            numberOfCarSlots,
            numberOfBikeSlots,
            parkingChargesBikePerHour,
            parkingChargesCarPerHour,
            state,
            city,
            country,
            pincode,
            location,
            latitude,
            longitude
        } = req.body

        // Get file paths
        const aadharCardPhoto = req.files?.aadharCardPhoto?.[0]?.path || ''
        const parkingValidDocuments = req.files?.parkingValidDocuments?.[0]?.path || ''
        const parkingImage = req.files?.parkingImage?.[0]?.path || ''

        // Create new parking lot registration
        const registration = await ParkingLotRegistration.create({
            ownerName,
            ownerEmail,
            ownerMobile,
            ownerAadhar,
            aadharCardPhoto,
            parkingLotName,
            parkingValidDocuments,
            parkingImage,
            numberOfCarSlots: parseInt(numberOfCarSlots),
            numberOfBikeSlots: parseInt(numberOfBikeSlots),
            parkingChargesBikePerHour: parkingChargesBikePerHour ? parseInt(parkingChargesBikePerHour) : 0,
            parkingChargesCarPerHour: parkingChargesCarPerHour ? parseInt(parkingChargesCarPerHour) : 0,
            state,
            city,
            country,
            pincode,
            location,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        })

        // Send confirmation email to the owner
        const subject = '[Smart Parker] Parking Lot Registration Received'
        const html = `
        Dear ${ownerName},
        
        Thank you for submitting your parking lot registration for "${parkingLotName}".
        
        We have received your application and our team will review the details within the next 3-4 days. 
        A team member will visit your parking location to verify the submitted information.
        
        Registration Details:
        - Parking Lot Name: ${parkingLotName}
        - Location: ${location}, ${city}, ${state}
        - Car Slots: ${numberOfCarSlots}
        - Bike Slots: ${numberOfBikeSlots}
        
        You will receive an email notification once the verification is complete.
        
        Best regards,
        Smart Parking Team
        `
        
        await sendEmail2({
            subject,
            html,
            receiverMail: ownerEmail
        })

        res.status(201).json({
            success: true,
            message: 'Parking lot registration submitted successfully. You will receive a confirmation email shortly.',
            registrationId: registration._id
        })

    } catch (error) {
        console.error('Error submitting parking lot registration:', error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong while submitting the registration'
        })
    }
}

// Get all parking lot registrations (admin only)
exports.getAllRegistrations = async (req, res) => {
    try {
        const registrations = await ParkingLotRegistration.find()
            .sort({ submittedAt: -1 })
        
        res.status(200).json({
            success: true,
            registrations
        })
    } catch (error) {
        console.error('Error fetching registrations:', error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching registrations'
        })
    }
}

// Update registration status (admin only)
exports.updateRegistrationStatus = async (req, res) => {
    try {
        const { registrationId } = req.params
        const { status, adminNotes } = req.body

        const registration = await ParkingLotRegistration.findById(registrationId)
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            })
        }

        registration.status = status
        registration.adminNotes = adminNotes
        registration.reviewedAt = new Date()
        
        await registration.save()

        // Send email notification to owner
        const statusMessage = status === 'approved' 
            ? 'Your parking lot has been approved and is now live on our website!'
            : 'Your parking lot registration has been rejected. Please review the requirements and submit again.'

        const subject = `[Smart Parker] Parking Lot Registration ${status.charAt(0).toUpperCase() + status.slice(1)}`
        const html = `
        Dear ${registration.ownerName},
        
        ${statusMessage}
        
        Parking Lot: ${registration.parkingLotName}
        Location: ${registration.location}, ${registration.city}, ${registration.state}
        
        ${adminNotes ? `Admin Notes: ${adminNotes}` : ''}
        
        Best regards,
        Smart Parking Team
        `

        await sendEmail2({
            subject,
            html,
            receiverMail: registration.ownerEmail
        })

        res.status(200).json({
            success: true,
            message: `Registration ${status} successfully`,
            registration
        })

    } catch (error) {
        console.error('Error updating registration status:', error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong while updating registration status'
        })
    }
} 