# VP Mobil 25 - Stundenplan Viewer

This is a Next.js application designed to visualize the timetable data from `stundenplan24.de`.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configuration:**
    The credentials and URL are stored in `.env.local`. You can modify them there if the URL changes.

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Server-side Fetching:** Fetches XML data securely on the server to avoid CORS issues.
- **XML Parsing:** Uses `xml2js` to convert the school's XML format into a usable JSON structure.
- **Responsive Table:** A clean, modern table built with Tailwind CSS that works on mobile and desktop.
- **Error Handling:** Displays friendly error messages if the data cannot be fetched or parsed.

## Project Structure

- `src/lib/stundenplan.ts`: Logic for fetching and parsing the XML.
- `src/app/page.tsx`: The main dashboard showing the timetable entries.
- `.env.local`: Environment variables for sensitive data.
