# Maiyya Samman Yojna Application

A comprehensive welfare scheme application for Jharkhand's Maiyya Samman Yojna with fraud prevention and verification features.

## Project Overview

This application is designed to streamline the application, verification, and disbursement process for the Maiyya Samman Yojna scheme in Jharkhand. It offers both a mobile application for beneficiaries and a web interface for Anganwadi workers and administrative staff.

## Key Features

### User Authentication
- Secure login and registration with Aadhaar verification
- Biometric authentication support
- JWT-based authentication

### Fraud Prevention
- Advanced duplicate detection algorithms
- Ghost beneficiary prevention
- Document validation and verification
- Risk scoring system

### Application Processing
- Step-by-step application flow
- Document scanning and validation
- Real-time application status tracking
- Automated verification workflow

### Administrative Dashboard
- Comprehensive analytics
- Application verification queue
- Report generation
- Status monitoring

## Technology Stack

### Mobile App (React Native)
- React Native for cross-platform mobile development
- Redux for state management
- Formik and Yup for form validation
- React Native Biometrics for biometric authentication

### Web Interface (React)
- React with Material UI
- Redux for state management
- Chart.js for analytics visualization
- Formik for form handling

### Backend (Node.js)
- Express.js REST API
- MongoDB database with Mongoose
- JWT authentication
- Advanced fraud detection algorithms

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- React Native development environment

### Setup Instructions
1. Clone the repository
2. Install dependencies for backend, frontend, and web-frontend
3. Set up environment variables
4. Start the development servers

## Project Structure
```
maiyya-samman-yojna/
├── backend/            # Node.js Express backend
├── frontend/           # React Native mobile app
└── web-frontend/       # React web interface for admins
```

## Deployment

### Backend
- Deploy to any Node.js hosting service (AWS, Heroku, etc.)
- Configure MongoDB Atlas for database

### Mobile App
- Build APK for Android
- Generate IPA for iOS

### Web Interface
- Deploy to any static hosting service

## Contributors
- Initial development by [Your Name]

## License
This project is licensed under the MIT License - see the LICENSE file for details.