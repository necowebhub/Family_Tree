# Antipyn't Family Tree

A React-based family tree web application with admin panel for managing genealogical data. Built with Firebase for backend services and featuring a drag-and-drop tree editor.

## Features

- **Interactive Family Tree**: Click on any family member to view detailed information
- **Admin Panel**: Comprehensive editing interface with authentication
- **Drag & Drop**: Intuitive tree reorganization with visual feedback
- **Rich Text Editor**: Full-featured content editing with Quill.js
- **Responsive Design**: Mobile-friendly interface
- **Firebase Integration**: Real-time database and authentication

## Tech Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router v7
- **UI Components**: 
  - React Quill (rich text editor)
  - @dnd-kit (drag and drop)
  - React Scroll (smooth scrolling)
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Styling**: CSS Modules

## Project Structure

```
frontend/
├── public/
│   ├── favicon_light.png
│   └── favicon_dark.png
├── src/
│   ├── components/
│   │   ├── Footer/
│   │   ├── ModalComment/
│   │   ├── Navbar/
│   │   ├── TextTree/
│   │   └── TreeEditor/
│   ├── pages/
│   │   ├── AdminPage.jsx
│   │   └── PublicPage.jsx
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── buildTree.js
│   ├── api.js
│   ├── firebase.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Set up Firebase Collections**
   
   Create the following collections in Firestore:
   - `components` - stores family tree nodes
   - `single_text` - stores the family history text
   - `footer` - stores footer content

## Usage

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Application Routes

- `/` - Public family tree view
- `/admin` - Admin panel (requires authentication)

## Admin Features

1. **Authentication**
   - Email/password login
   - Password reset via email
   - Change password functionality

2. **Tree Management**
   - Add/delete family members
   - Drag and drop to reorganize
   - Edit member details (name, birth/death dates)
   - Add rich text biographies
   - Color-code family members

3. **Content Management**
   - Edit family history section
   - View footer information

## Data Structure

Each family tree node contains:
- `title` - Full name
- `birthday` - Birth date
- `deathday` - Death date
- `comment_text` - Rich text biography
- `parent_id` - Parent node reference
- `position` - Sort order among siblings
- `bgColor` - Background color for highlighting

## Browser Support

Requires a modern browser with JavaScript enabled. The application uses:
- ES6+ features
- CSS Grid and Flexbox
- Firebase SDK

## Requirements

- Node.js >= 18
- Modern web browser
- Firebase project with Firestore and Authentication enabled

## Contact

email: 63we0la45@mozmail.com
tg: https://t.me/epithah
