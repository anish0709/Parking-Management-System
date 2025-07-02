const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/parking-registrations'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false)
    }
  }
})

const { 
    submitParkingLotRegistration, 
    getAllRegistrations, 
    updateRegistrationStatus 
} = require('../controllers/parkingLotRegistration')

// Public route - anyone can submit a parking lot registration
router.post('/submit', upload.fields([
    { name: 'aadharCardPhoto', maxCount: 1 },
    { name: 'parkingValidDocuments', maxCount: 1 },
    { name: 'parkingImage', maxCount: 1 }
]), submitParkingLotRegistration)

// Admin routes - require authentication
router.get('/admin/all', auth, getAllRegistrations)
router.put('/admin/:registrationId/status', auth, updateRegistrationStatus)

module.exports = router 