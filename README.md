# TextEditor 2.0 ✏️

<div align="center">



**A modern text editor with rich formatting, document management, and cloud storage capabilities.**

[![Next.js](https://img.shields.io/badge/Next.js-13.0+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9.0+-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[Features](#key-features) • [Demo](#live-demo) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation)

</div>

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="/screenshots/editor.JPG" alt="Editor Interface" width="400"/>
        <br/>
        <em>Rich Text Editing</em>
      </td>
      <td align="center">
        <img src="/screenshots/editor4.JPG" alt="Document Management" width="400"/>
        <br/>
        <em>Document Management</em>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="/screenshots/editor2.JPG" alt="Table Editing" width="400"/>
        <br/>
        <em>Advanced Table Editing</em>
      </td>
      <td align="center">
        <img src="/screenshots/editor3.JPG" alt="Export Options" width="400"/>
        <br/>
        <em>Multiple Export Formats</em>
      </td>
    </tr>
  </table>
</div>

## ✨ Key Features

- **Rich Text Formatting**
  - Bold, italic, underline, strikethrough
  - Headings, lists, blockquotes
  - Text alignment and indentation
  - Font styles, sizes, and colors

- **Advanced Table Editing**
  - Insert tables with configurable rows and columns
  - Add/remove rows and columns
  - Merge and split cells
  - Customize table properties

- **Document Management**
  - Create, edit, and organize documents
  - Tag-based organization system
  - Search and filter capabilities
  - Version history

- **Cloud Integration**
  - Firebase integration for cloud storage
  - Real-time synchronization
  - Local storage fallback for offline use
  - Secure authentication

- **Export Options**
  - Export to PDF
  - Export to Markdown
  - Export to HTML
  - Print-friendly formatting

## 🚀 Live Demo

Try TextEditor 2.0 live at: [https://texteditor-2.example.com](https://texteditor-2.example.com)

## 🔧 Installation

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/texteditor-2.git
cd texteditor-2
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file and replace the placeholder values with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🏃‍♂️ Usage

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Testing

Run Firebase connectivity tests:

```bash
npm run test:firebase
```

Run Tags functionality tests:

```bash
npm run test:tags
```

Run all tests:

```bash
npm test
```

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📖 Documentation

### User Guide

- [Getting Started Guide](docs/getting-started.md)
- [Text Formatting Guide](docs/formatting.md)
- [Table Editing Guide](docs/tables.md)
- [Document Management](docs/documents.md)
- [Export Options](docs/export.md)

### Developer Documentation

- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🔒 Security

This project uses environment variables to protect sensitive information like API keys. The `.env.local` file is excluded from version control in `.gitignore` to prevent accidental exposure of credentials.

Always use environment variables for sensitive configuration and never commit actual API keys or secrets to your repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React framework
- [Firebase](https://firebase.google.com/) - Backend and authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icon set

---

<div align="center">
  <p>Made with ❤️ by Thomas</p>
  <p>
    <a href="https://twitter.com/yourusername">Twitter</a> •
    <a href="https://github.com/yourusername">GitHub</a> •
    <a href="https://linkedin.com/in/yourusername">LinkedIn</a>
  </p>
</div>
