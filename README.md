# Vertretungsplan FDS-Limburg

A web application to display the substitution plan for FDS Limburg.

## Features

- Fetches and displays the substitution plan.
- Search functionality to filter substitution entries.
- Responsive design optimized for mobile, tablet, and desktop.
- Displays a loading animation while fetching data.
- Shows an error message if the data fetch fails.

## Technologies Used

- React
- Next.js
- Tailwind CSS
- TypeScript

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/vertretungsplan-fds-limburg.git
   ```
2. Navigate to the project directory:
   ```sh
   cd vertretungsplan-fds-limburg
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

## Usage

1. Start the development server:
   ```sh
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`.

## Folder Structure

- `src/`
  - `components/`
    - `Header.tsx`
    - `Footer.tsx`
    - `SearchBar.tsx`
    - `SubstitutionPlan.tsx`
  - `pages/`
    - `index.tsx`
    - `impressum.tsx`
    - `datenschutz.tsx`
    - `_app.tsx`
    - `_document.tsx`
  - `styles/`
    - `globals.css`

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```sh
   git checkout -b feature/YourFeature
   ```
3. Make your changes.
4. Commit your changes:
   ```sh
   git commit -m 'Add some feature'
   ```
5. Push to the branch:
   ```sh
   git push origin feature/YourFeature
   ```
6. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
