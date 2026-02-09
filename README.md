# CSV Field Mapper

A frontend application designed to parse CSV files, map columns to system fields, validate data, and submit the transformed data to a REST API.

## Objectives

CSV Parsing: Upload and parse CSV files directly in the frontend to display data in a list format.

Field Mapping: Map CSV columns to predefined system fields (name, email, phone, address).

Field Mapping Modal: Utilize a Modal for mapping configuration.

API Integration: Submit transformed data via a POST request to a public API (JSONPlaceholder).

## Additional Features

- Drag & Drop: Intuitive file upload zone.
- UX Feedback: Loading states and submission feedback (success/error).
- Validation: Required field check and email format validation.

## Tools Used

- React + TypeScript: Frontend framework.
- Vite: Build tool for fast initialization.
- Tailwind CSS: Styling framework.

## How to Run

- Clone the repository:

```Bash
git clone https://github.com/dev-uncle/CSV-Field-Mapper
cd CSV-Field-Mapper
```

Install dependencies:

```Bash
npm install
```

Run the development server:

```Bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173).

Explanation of Logic

Shutterstock

1. File Handling & Parsing
   Using the FileReader API, the application reads the uploaded CSV file as raw text. The parseCSV function splits this text using newlines (\r?\n) to separate rows, and commas (,) to separate columns. The first line is treated as headers, and the rest as data rows.

2. Field Mapping (Modal)
   Once parsed, a MappingModal appears. This component provides dropdown selects to match the CSV columns (headers) to the required system fields (name, email, etc.).

3. Data Transformation & Validation
   Upon clicking "Map and Preview", the processData function executes:

Required Fields: Checks if Name and Email are mapped.

Email Validation: Uses a regular expression to validate email formats.

```TypeScript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
If validation fails, an error message is displayed, and data is not processed.
```

4. API Submission
   Finally, the handleSubmit function sends the mapped data to https://jsonplaceholder.typicode.com/posts using fetch with the POST method. The UI provides feedback on whether the submission was successful or failed.

# LIVE

https://csv-field-mapper-71iz.vercel.app/

## Developer

Uncledev

Portfolio: https://uncle-dev.com
GitHub: https://github.com/dev-uncle
Email: jhonbrian@uncle-dev.com
