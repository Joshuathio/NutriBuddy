# Malnutrition Tracker Mobile App

A comprehensive React Native mobile application for tracking and monitoring child malnutrition using WHO growth standards, AI-powered photo screening, and health guidance.

## 📱 Features

### 1. **Child Profile Management**
- Store child's basic information (name, DOB, gender)
- Calculate age automatically
- Easy profile editing

### 2. **Growth Tracking (WHO Standards)**
- Track weight and height measurements
- Compare with WHO growth standards
- Visual charts showing growth trends
- BMI calculation and nutritional status assessment
- Color-coded status indicators (normal, warning, critical)

### 3. **AI-Powered Photo Screening**
- Take or upload photos for malnutrition screening
- AI analysis of visual indicators
- Confidence scores and detailed recommendations
- Privacy-focused local processing
- Clear medical disclaimer

### 4. **AI Health Assistant Chatbot**
- 24/7 available health assistant
- Answers questions about nutrition, growth, and health
- Quick question suggestions
- Conversation history
- Evidence-based responses

### 5. **Health Articles & Resources**
- Curated health articles based on WHO guidelines
- Categories: Nutrition, Hygiene, Warning Signs, Development
- Search and filter functionality
- Offline reading capability

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development - Mac only)

### Setup Instructions

1. **Clone or extract the project**
```bash
cd MalnutritionTracker
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
expo start
# or
npm start
```

4. **Run on your device**
- **Android**: Press `a` in the terminal or scan QR code with Expo Go app
- **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
- **Physical Device**: Install Expo Go app and scan the QR code

## 📂 Project Structure

```
MalnutritionTracker/
├── App.js                    # Main application entry point
├── package.json              # Dependencies and scripts
├── src/
│   ├── screens/             # All screen components
│   │   ├── HomeScreen.js    # Main dashboard
│   │   ├── GrowthScreen.js  # Growth tracking & charts
│   │   ├── ScanScreen.js    # Photo screening
│   │   ├── ChatScreen.js    # AI chatbot
│   │   └── ArticlesScreen.js # Health articles
│   └── context/             # State management
│       ├── ChildDataContext.js    # Child information
│       └── MeasurementContext.js  # Growth measurements
```

## 🔧 Configuration

### API Integration (for production)

1. **AI Photo Analysis API**
   - Replace mock analysis in `ScanScreen.js`
   - Add your API endpoint and authentication

2. **Chatbot API**
   - Replace mock responses in `ChatScreen.js`
   - Integrate with your AI service (e.g., OpenAI, Claude)

3. **WHO Growth Standards**
   - Replace simplified data in `GrowthScreen.js`
   - Use actual WHO growth chart data

Example API integration:
```javascript
// In ScanScreen.js
const analyzeImage = async () => {
  const formData = new FormData();
  formData.append('image', {
    uri: image,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });

  const response = await fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
    },
  });

  const result = await response.json();
  setAnalysisResult(result);
};
```

## 🏗️ Building for Production

### Android APK
```bash
expo build:android -t apk
```

### Android App Bundle
```bash
expo build:android -t app-bundle
```

### iOS IPA
```bash
expo build:ios -t archive
```

## 🎨 Customization

### Theming
Edit the theme colors in `App.js`:
```javascript
const theme = {
  colors: {
    primary: '#4CAF50',    // Main green color
    accent: '#81C784',     // Light green
    error: '#FF5252',      // Red for errors
    warning: '#FFA726',    // Orange for warnings
    // ... other colors
  }
};
```

### Adding New Features

1. **New Screen**: Create in `src/screens/` and add to navigation
2. **New Context**: Create in `src/context/` for state management
3. **New Article**: Add to articles array in `ArticlesScreen.js`

## 📱 App Permissions

The app requires the following permissions:
- **Camera**: For taking photos in screening feature
- **Storage**: For selecting photos from gallery
- **Internet**: For API calls (when integrated)

## 🔐 Privacy & Security

- All data is stored locally on device using AsyncStorage
- Photos are processed locally (in demo mode)
- No data is sent to external servers without user consent
- Implements privacy notices for photo screening

## 🧪 Testing

### Run on Android Emulator
```bash
expo run:android
```

### Run on iOS Simulator
```bash
expo run:ios
```

### Unit Tests (if configured)
```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🏥 Medical Disclaimer

This app is a screening tool and does not replace professional medical advice. Always consult healthcare providers for medical decisions.

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team
- Check documentation for common problems

## 🚀 Future Enhancements

- [ ] Multi-language support
- [ ] Cloud backup and sync
- [ ] Family account with multiple children
- [ ] Appointment scheduling
- [ ] Medication reminders
- [ ] Export reports as PDF
- [ ] Integration with healthcare providers
- [ ] Offline WHO growth charts
- [ ] Push notifications for measurements
- [ ] Dark mode support

## 📝 Notes

- The current implementation uses mock data for AI analysis
- WHO growth charts are simplified for demo purposes
- Production deployment requires proper API integration
- Consider HIPAA compliance for US deployment
- Implement proper error handling for production

---

Built with ❤️ for child health monitoring
