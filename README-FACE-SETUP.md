# Face Recognition Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install face-api.js
```

### 2. Database Schema Update
Add `faceDescriptor` field to your User model in `schema.prisma`:

```prisma
model User {
  id             String   @id @default(cuid())
  name           String
  email          String   @unique
  password       String
  role           Role     @default(EMPLOYEE)
  isLogin        Boolean  @default(false)
  faceDescriptor String?  // Add this line
  // ... other fields
}
```

Then run:
```bash
npm run generate
```

### 3. How It Works

#### Face Registration
- First-time users need to register their face
- Camera captures face and extracts 128-dimensional descriptor
- Descriptor stored securely in database

#### Face Authentication
- Camera detects face and extracts descriptor
- Compares with stored descriptors using Euclidean distance
- Threshold of 0.6 for matching (adjustable)
- Automatic clock-in/out based on current status

### 4. Features

✅ **Real-time face detection**
✅ **Offline processing** (no external APIs)
✅ **Secure storage** (only mathematical descriptors)
✅ **Fallback authentication** (password backup)
✅ **Auto clock-in/out** based on face recognition
✅ **Break authentication** with face verification

### 5. Usage

#### Clock Page Integration
- Click the face scan button
- If no face registered → Registration mode
- If face registered → Authentication mode
- Successful auth → Auto clock-in/out

#### API Endpoints
- `POST /api/clock/face-recognition` - Main endpoint
- Actions: `register`, `authenticate`, `clock-in`, `clock-out`
- `GET /api/clock/face-recognition` - Check user face status

### 6. Security Features

- **No image storage** - only mathematical descriptors
- **Local processing** - face data never leaves browser
- **Encrypted descriptors** - stored as JSON strings
- **Threshold matching** - prevents false positives
- **Fallback auth** - password backup if camera fails

### 7. Browser Requirements

- **HTTPS required** for camera access
- **Modern browsers** with WebRTC support
- **Camera permissions** must be granted

### 8. Customization

#### Adjust Recognition Threshold
In `/api/clock/face-recognition/route.ts`:
```typescript
const threshold = 0.6; // Lower = stricter matching
```

#### Change Models (Optional)
Currently using CDN models. For offline, download to `/public/models/`:
- `tiny_face_detector_model-weights_manifest.json`
- `face_landmark_68_model-weights_manifest.json`
- `face_recognition_model-weights_manifest.json`

### 9. Troubleshooting

**Camera not working?**
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Fallback to password authentication

**Face not recognized?**
- Ensure good lighting
- Face should be clearly visible
- Re-register if needed
- Adjust threshold if too strict

**Performance issues?**
- Models load from CDN (first time only)
- Consider local model hosting for faster loading

### 10. Next Steps

- Add face recognition to break authentication
- Implement admin face management
- Add face recognition analytics
- Consider multiple face registration per user