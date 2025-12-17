# Customer Mobile App

Customer-facing mobile application for the Multi-Vendor Pharmacy Platform built with React Native and Expo.

## Features

- **Authentication**: Login and registration with JWT tokens
- **Product Browsing**: Browse and search medicines and health products
- **Shopping Cart**: Add products to cart and manage quantities
- **Checkout**: Complete purchase with payment integration
- **Order Tracking**: Track order status and delivery
- **User Profile**: Manage personal information and preferences
- **Prescription Upload**: Upload prescription images for verification
- **Push Notifications**: Receive order updates and promotions

## Tech Stack

- React Native 0.73
- Expo SDK 50
- TypeScript
- React Navigation v6
- Async Storage for local data
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Run on specific platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
mobile-customer/
├── src/
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── home/         # Home screen
│   │   ├── products/     # Product screens
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout flow
│   │   ├── orders/       # Order history
│   │   └── profile/      # User profile
│   ├── navigation/       # Navigation configuration
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript types
├── assets/               # Images, fonts, etc.
├── App.tsx              # App entry point
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies

```

## Available Scripts

- `npm run dev` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

Create a `.env` file in the root directory:

```env
API_URL=http://localhost:4000/api/v1
PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

## Key Features Implementation

### Authentication
- JWT-based authentication
- Secure token storage with AsyncStorage
- Auto-login on app restart
- Logout functionality

### Product Catalog
- Browse products by category
- Search functionality
- Product details with images
- Add to cart

### Shopping Cart
- Add/remove items
- Update quantities
- Calculate totals
- Persist cart data

### Checkout
- Select delivery address
- Choose payment method
- Order summary
- Place order

### Order Tracking
- View order history
- Track order status
- View order details
- Reorder functionality

## API Integration

The app connects to the backend API at `http://localhost:4000/api/v1` (configurable).

Key endpoints:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /products` - Get products
- `POST /orders` - Create order
- `GET /orders` - Get user orders

## Push Notifications

Push notifications are configured using Expo Notifications:

- Order confirmations
- Delivery updates
- Promotional offers
- Prescription approvals

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Dependencies**: Delete `node_modules` and run `npm install`
3. **iOS Simulator**: Reset simulator if app crashes

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow React Native best practices
4. Test on both iOS and Android

## License

Proprietary and confidential.
