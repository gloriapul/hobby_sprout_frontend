# HobbySprout Frontend
## 6.104 Assignment 4b

A Vue.js frontend application for HobbySprout, an application designed to support users in following through on their hobbies.

## � Quick Start

### 1. Start the Backend

The backend for HobbySprout is contained in [this repo](https://github.com/gloriapul/hobby_sprout/tree/main). See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

**Quick backend start:**

```bash
# In your hobby_sprout repository
deno task concepts
```

### 2. Start the Frontend

```bash
# Make sure you're using Node.js v22+
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

### 3. Test the Connection

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Use the API Demo component to test connectivity

## �📋 Prerequisites

- Node.js (v20.19.0 or >=22.12.0)
- npm (comes with Node.js)
- Backend API running at `http://localhost:8000/api`

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd hobby_sprout_frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create environment files for different stages:

```bash
# Development environment (already created)
# .env contains:
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=HobbySprout
VITE_APP_VERSION=1.0.0

# Production environment
# .env.production contains production API URL
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## 📖 Available Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start development server             |
| `npm start`            | Alias for `npm run dev`              |
| `npm run build`        | Build for production                 |
| `npm run preview`      | Preview production build             |
| `npm run test`         | Run all tests (unit + e2e)           |
| `npm run test:unit`    | Run unit tests with Vitest           |
| `npm run test:e2e`     | Run end-to-end tests with Playwright |
| `npm run lint`         | Lint and fix code with ESLint        |
| `npm run lint:check`   | Check linting without fixing         |
| `npm run format`       | Format code with Prettier            |
| `npm run format:check` | Check formatting without fixing      |
| `npm run type-check`   | Type check with TypeScript           |
| `npm run clean`        | Clean build artifacts                |

## 🏗️ Project Structure

```
src/
├── assets/          # Static assets (CSS, images)
├── components/      # Reusable Vue components
│   ├── ApiDemo.vue  # API connection demo component
│   └── __tests__/   # Component tests
├── composables/     # Vue composition functions
│   └── useApi.ts    # API request composable
├── router/          # Vue Router configuration
├── services/        # API and external services
│   ├── api.ts       # Base API client with axios
│   └── hobbySprout.ts # HobbySprout-specific API methods
├── stores/          # Pinia state management
├── types/           # TypeScript type definitions
│   └── index.ts     # Common types and interfaces
├── utils/           # Utility functions
│   └── index.ts     # Common utilities
├── views/           # Page components
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## 🔌 API Integration

The frontend is configured to work with a concept-based API structure:

- **Base URL**: `http://localhost:8000/api`
- **Method**: All endpoints use POST
- **Format**: JSON request/response
- **Structure**: `/{conceptName}/{actionOrQueryName}`

### Example API Usage

```typescript
import HobbySproutService from '@/services/hobbySprout'

// Create a new hobby
const hobbyData = {
  name: 'Photography',
  description: 'Learning digital photography',
  userId: 'user123',
}

const result = await HobbySproutService.createHobby(hobbyData)

if (HobbySproutService.isError(result)) {
  console.error('Error:', result.error)
} else {
  console.log('Created hobby:', result)
}
```

### Using the API Composable

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi'
import HobbySproutService from '@/services/hobbySprout'

const { data, error, loading, execute } = useApi()

const createHobby = () => {
  execute(() =>
    HobbySproutService.createHobby({
      name: 'New Hobby',
      description: 'Description',
      userId: 'user123',
    }),
  )
}
</script>
```

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

### E2E Tests

```bash
npm run test:e2e
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```
