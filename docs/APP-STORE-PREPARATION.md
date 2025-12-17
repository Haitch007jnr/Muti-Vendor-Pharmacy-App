# App Store Preparation Guide

## Overview

This guide provides step-by-step instructions for preparing and submitting the Multi-Vendor Pharmacy mobile applications to the Apple App Store and Google Play Store.

## Prerequisites

- [ ] Completed app development and testing
- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] App signing certificates configured
- [ ] Privacy policy and terms of service published
- [ ] App store assets prepared (screenshots, icons, descriptions)

## Pre-Submission Checklist

### General Requirements

- [ ] App has been tested on multiple devices
- [ ] All features are working correctly
- [ ] Payment integration tested with real transactions
- [ ] Push notifications tested and working
- [ ] App does not crash or freeze
- [ ] App handles errors gracefully
- [ ] App respects user privacy
- [ ] App complies with all platform guidelines
- [ ] Legal documents are ready (Privacy Policy, Terms of Service)

### Technical Requirements

- [ ] App icon in all required sizes
- [ ] Launch screen/splash screen
- [ ] App supports latest OS versions
- [ ] App is optimized for different screen sizes
- [ ] App has proper permissions handling
- [ ] Deep linking configured
- [ ] App analytics integrated
- [ ] Crash reporting configured

## iOS App Store Submission

### 1. App Store Connect Setup

#### Create App Record

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps" → "+" → "New App"
3. Fill in the required information:
   - Platform: iOS
   - Name: "Pharmacy Customer" (or Vendor/Delivery)
   - Primary Language: English
   - Bundle ID: `com.pharmacy.customer`
   - SKU: `pharmacy-customer-001`

#### Configure App Information

1. **App Information**
   - Category: Medical / Health & Fitness
   - Secondary Category: Shopping
   - Content Rights: Select appropriate option
   - Age Rating: Complete questionnaire

2. **Pricing and Availability**
   - Price: Free
   - Availability: All countries
   - Pre-orders: Optional

### 2. Prepare App Store Assets

#### App Icon

Required sizes:
- 1024x1024px (App Store)
- 180x180px (iPhone)
- 120x120px (iPhone)
- 167x167px (iPad Pro)
- 152x152px (iPad)

Save as PNG without transparency.

#### Screenshots

**iPhone 6.7" Display (Required)**
- Size: 1290 x 2796 pixels
- Minimum: 3 screenshots
- Maximum: 10 screenshots

**iPhone 6.5" Display (Required)**
- Size: 1242 x 2688 pixels
- Minimum: 3 screenshots
- Maximum: 10 screenshots

**iPhone 5.5" Display (Optional)**
- Size: 1242 x 2208 pixels

**iPad Pro 12.9" Display (Optional)**
- Size: 2048 x 2732 pixels

#### Preview Videos (Optional)

- Format: .mov, .m4v, or .mp4
- Max length: 30 seconds
- Recommended: 15-30 seconds

### 3. App Description

#### App Name
```
Pharmacy Customer App
```
(Max 30 characters)

#### Subtitle
```
Order medicines & health products
```
(Max 30 characters)

#### Description
```
The Pharmacy Customer App provides a convenient way to order medicines and health products from verified pharmacies in your area.

KEY FEATURES:
• Browse thousands of medicines and health products
• Upload prescriptions for quick processing
• Secure payment with Paystack & Monnify
• Real-time order tracking
• Push notifications for order updates
• Save favorite products for quick reorder
• Multiple delivery addresses
• 24/7 customer support

SAFE & SECURE:
• All pharmacies are verified and licensed
• Secure payment processing
• Data privacy protected
• Prescription verification
• Authentic products guaranteed

EASY TO USE:
• Simple and intuitive interface
• Quick search and filtering
• Easy checkout process
• Multiple payment options
• Order history and reordering

FAST DELIVERY:
• Track your order in real-time
• Multiple delivery options
• Reliable delivery partners
• Contact-free delivery available

Download now and experience hassle-free medicine shopping!
```
(Max 4000 characters)

#### Keywords
```
pharmacy,medicine,health,prescription,drugs,medical,healthcare,wellness,delivery
```
(Max 100 characters, comma-separated)

#### Support URL
```
https://pharmacy.com/support
```

#### Marketing URL (Optional)
```
https://pharmacy.com
```

### 4. App Privacy

Create detailed privacy policy covering:

- Data collection practices
- Data usage
- Data sharing
- User rights
- Contact information

Upload to: `https://pharmacy.com/privacy-policy`

#### Privacy Declarations in App Store Connect

1. Go to App Privacy section
2. Declare data types collected:
   - Contact Info (Email, Phone)
   - Health Data (Prescriptions)
   - Financial Info (Payment)
   - Location (Delivery address)
   - User Content (Photos)

3. For each data type, specify:
   - Usage purpose
   - Linked to user identity: Yes/No
   - Used for tracking: Yes/No

### 5. App Review Information

#### Contact Information
- First Name: [Your Name]
- Last Name: [Your Last Name]
- Phone: [Your Phone]
- Email: [Your Email]

#### Demo Account (Required)
```
Email: demo@pharmacy.com
Password: Demo123!@#

Note: This account has sample orders and data for testing.
```

#### Notes for Reviewer
```
Thank you for reviewing our app!

TESTING INSTRUCTIONS:
1. Log in with the demo account provided
2. Browse products in the catalog
3. Add items to cart and proceed to checkout
4. For payment testing, please contact us at review@pharmacy.com for test credentials

PAYMENT TESTING:
We use Paystack and Monnify for payments. Test mode is enabled for review.
Test Card: 4084084084084081
Expiry: Any future date
CVV: 408

FEATURES TO TEST:
- Product browsing and search
- Cart management
- Checkout process
- Order tracking
- Push notifications
- Profile management

NOTES:
- Location permission is used for delivery address
- Camera permission is used for prescription upload
- Notification permission is used for order updates

Please contact us if you need any assistance during the review.
```

### 6. Build and Upload

#### Using Expo EAS Build

```bash
cd apps/mobile-customer

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### Manual Upload with Xcode

```bash
# Build the app
cd apps/mobile-customer
npx expo prebuild
cd ios
pod install

# Open in Xcode
open PharmacyCustomer.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device" as destination
# 2. Product → Archive
# 3. Distribute App → App Store Connect
# 4. Upload
```

### 7. Submit for Review

1. Go to App Store Connect
2. Select your app
3. Go to "App Store" tab
4. Fill in all required information
5. Add build
6. Click "Submit for Review"

### 8. Review Process

- **Review Time:** Typically 24-48 hours
- **Status Tracking:** App Store Connect dashboard
- **Notifications:** Email notifications for status changes

#### Possible Review Outcomes

1. **Approved** - App goes live
2. **Rejected** - Address issues and resubmit
3. **Metadata Rejected** - Fix metadata issues
4. **In Review** - Currently being reviewed

### 9. Post-Approval

- [ ] Test app download from App Store
- [ ] Verify all features work in production
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Respond to user feedback

## Google Play Store Submission

### 1. Google Play Console Setup

#### Create App

1. Log in to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in details:
   - App name: "Pharmacy Customer"
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
   - Declarations: Accept all required

### 2. Store Listing

#### App Details

**App name**
```
Pharmacy Customer
```
(Max 50 characters)

**Short description**
```
Order medicines and health products from verified pharmacies with easy delivery
```
(Max 80 characters)

**Full description**
```
The Pharmacy Customer App is your trusted companion for ordering medicines and health products from verified pharmacies in your area.

🏥 KEY FEATURES

• Browse Medicines: Access thousands of medicines and health products
• Upload Prescriptions: Simply take a photo and upload for quick processing
• Secure Payments: Pay safely using Paystack or Monnify
• Track Orders: Monitor your order in real-time from pharmacy to doorstep
• Get Notifications: Receive updates about your orders instantly
• Quick Reorder: Save favorites and reorder with one tap
• Multiple Addresses: Manage multiple delivery locations
• 24/7 Support: Get help whenever you need it

🔒 SAFE & SECURE

• Verified Pharmacies: All partner pharmacies are licensed and verified
• Secure Checkout: Bank-level encryption for all transactions
• Privacy Protected: Your data is safe and never shared
• Prescription Verification: Licensed pharmacists verify all prescriptions
• Authentic Products: 100% genuine medicines guaranteed

✨ EASY TO USE

• Clean Interface: Simple and intuitive design
• Smart Search: Find products quickly with advanced filters
• Easy Checkout: Complete your order in just a few taps
• Payment Options: Multiple payment methods supported
• Order History: Track all your past orders

🚀 FAST DELIVERY

• Real-time Tracking: Know exactly where your order is
• Delivery Options: Choose the delivery speed that suits you
• Reliable Partners: Trusted delivery personnel
• Safe Delivery: Contact-free delivery available

Download the Pharmacy Customer App now and experience hassle-free medicine shopping from the comfort of your home!

Need help? Contact us at support@pharmacy.com
```
(Max 4000 characters)

#### Graphics Assets

**App icon**
- Size: 512 x 512 px
- Format: PNG (32-bit)
- No transparency

**Feature graphic**
- Size: 1024 x 500 px
- Format: PNG or JPEG
- Required for all apps

**Phone screenshots**
- Min 2, max 8 screenshots
- Size: 16:9 or 9:16 ratio
- Min dimension: 320px
- Max dimension: 3840px

**7-inch tablet screenshots (Optional)**
- Min 2, max 8 screenshots

**10-inch tablet screenshots (Optional)**
- Min 2, max 8 screenshots

**Promo video (Optional)**
- YouTube URL
- Example: https://youtube.com/watch?v=xxxxx

### 3. Content Rating

Complete the questionnaire:
- Violence: No
- Sexual content: No
- Crude humor: No
- Drugs: Yes (Medical context)
- Medical information: Yes

Expected rating: **Everyone** or **Teen**

### 4. App Content

#### Privacy Policy

URL: `https://pharmacy.com/privacy-policy`

#### App Access

- All functionality available without special access: Yes
- Provide demo account if required:
  ```
  Email: demo@pharmacy.com
  Password: Demo123!@#
  ```

#### Ads

- Contains ads: No

#### Target Audience and Content

- Target age: Adults
- Age groups: 18-64, 65+

#### Data Safety

Declare what data you collect:

**Personal Info**
- Name: Collected, not shared
- Email: Collected, not shared
- Phone: Collected, not shared
- Address: Collected, not shared

**Health and Fitness**
- Prescriptions: Collected, not shared
- Medical records: Collected, not shared

**Financial Info**
- Payment info: Collected, encrypted
- Purchase history: Collected, not shared

**Photos and Videos**
- Photos (prescriptions): Collected, not shared

**Location**
- Approximate location: Collected, not shared

### 5. Prepare Release

#### App signing

```bash
# Generate upload keystore
cd apps/mobile-customer/android/app
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore upload-keystore.keystore \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Add to gradle.properties
UPLOAD_STORE_FILE=upload-keystore.keystore
UPLOAD_STORE_PASSWORD=your-password
UPLOAD_KEY_ALIAS=upload
UPLOAD_KEY_PASSWORD=your-password
```

#### Build AAB

```bash
# Using Expo EAS
cd apps/mobile-customer
eas build --platform android --profile production

# Or manually
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 6. Create Release

1. Go to "Production" in Play Console
2. Click "Create new release"
3. Upload AAB file
4. Add release notes:

```
Version 1.0.0

🎉 Initial Release

Welcome to Pharmacy Customer App!

Features included:
• Browse and search medicines
• Upload prescriptions
• Secure online payment
• Real-time order tracking
• Push notifications
• Multiple delivery addresses

Thank you for using our app!
```

5. Set rollout percentage (optional): 100%
6. Review and roll out

### 7. Review and Publish

1. Review all sections for completeness
2. Click "Submit for review"
3. Wait for approval (typically 1-7 days)

### 8. Post-Launch

- [ ] Download and test from Play Store
- [ ] Monitor crash reports in Play Console
- [ ] Check user reviews and ratings
- [ ] Respond to user feedback
- [ ] Track app analytics

## App Updates

### Version Numbering

Follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes
- **MINOR:** New features
- **PATCH:** Bug fixes

Example: `1.0.0` → `1.1.0` → `1.1.1`

### Update Process

#### iOS

1. Increment version in `app.json`
2. Build new version
3. Upload to App Store Connect
4. Submit for review

#### Android

1. Increment `versionCode` and `versionName` in `app.json`
2. Build new AAB
3. Create new release in Play Console
4. Submit for review

### Release Notes Template

```
Version X.Y.Z

🆕 What's New
• New feature description
• Another new feature

🔧 Improvements
• Performance optimization
• UI/UX enhancements

🐛 Bug Fixes
• Fixed issue with...
• Resolved problem with...

Thank you for your continued support!
```

## Common Rejection Reasons

### iOS

1. **Incomplete App Information** - Fill all required fields
2. **Broken Links** - Ensure all URLs work
3. **Poor App Quality** - Fix crashes and bugs
4. **Privacy Policy Missing** - Add privacy policy URL
5. **In-App Purchase Issues** - Test payment flows
6. **Misleading Content** - Ensure accurate descriptions

### Android

1. **Insufficient Screenshots** - Provide at least 2 screenshots
2. **Missing Privacy Policy** - Add privacy policy for apps handling personal data
3. **Policy Violations** - Review Google Play policies
4. **Technical Issues** - Fix crashes and ANRs
5. **Content Rating Mismatch** - Provide accurate content rating

## Helpful Resources

### Apple

- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### Google

- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Material Design Guidelines](https://material.io/design)

### Tools

- [App Store Screenshot Generator](https://www.screenshot.rocks/)
- [Icon Generator](https://appicon.co/)
- [Fastlane](https://fastlane.tools/) - Automate deployments

## Support

For app store submission assistance:
- Email: app-store@pharmacy.com
- Documentation: https://docs.pharmacy.com/app-store
- Slack: #mobile-releases

## Checklist Summary

### Before First Submission

- [ ] Complete app development
- [ ] Test all features thoroughly
- [ ] Prepare all assets (icons, screenshots)
- [ ] Create privacy policy and terms
- [ ] Set up developer accounts
- [ ] Configure app signing
- [ ] Prepare demo accounts
- [ ] Write app descriptions
- [ ] Create release notes

### For Each Update

- [ ] Test new features
- [ ] Update version number
- [ ] Create new build
- [ ] Update screenshots if UI changed
- [ ] Write release notes
- [ ] Submit for review
- [ ] Monitor approval status

---

**Last Updated:** December 2024
**Version:** 1.0.0
