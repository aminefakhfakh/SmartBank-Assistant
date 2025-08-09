# SmartBank Assistant

A full-stack banking application with React Native mobile app and Node.js backend.

## 🏗️ Project Structure

```
SmartBankAssistant/
├── app.js                    # Main backend server
├── package.json              # Backend dependencies
├── setup-database.js         # Database setup script
├── config/                   # Database configuration
├── controllers/              # API controllers
├── routes/                   # API routes
├── middleware/               # Authentication middleware
├── mobile-app/               # React Native mobile app
│   ├── App.js               # Main app component
│   ├── package.json         # Mobile app dependencies
│   └── src/
│       ├── screens/         # App screens
│       ├── context/         # Authentication context
│       ├── services/        # API services
│       └── config/          # API configuration
```

## 🚀 Quick Start

### Backend Setup
```bash
# Install dependencies
npm install

# Setup database
node setup-database.js

# Start server
npm start
```

### Mobile App Setup
```bash
# Navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# Start development server
npm start
```

## 🔐 Test Account
- **Email**: test@bank.com
- **Password**: test123

## 📱 Features
- User authentication (login/register)
- Account balance viewing
- Money transfers
- Transaction history
- Admin dashboard
- Account management

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, PostgreSQL
- **Mobile**: React Native, Expo
- **Authentication**: JWT
- **UI**: React Native Paper 