# MediApp

A medicine search application built with React, TypeScript, and Vite using the openFDA Drug Label API.

Users can search medicines by brand name, get suggestion dropdown results, view full search results, and open a detailed medicine page with structured label information.

## Features

- Search medicines by brand name
- Debounced API calls for better performance
- Suggestion dropdown while typing
- Full search results on search action
- Medicine detail page
- Structured medicine information sections:
  - At a glance
  - Active ingredients
  - Uses and indications
  - Important safety information
  - Other ingredients
  - Label information and source metadata
- Loading state
- Error handling
- No results state
- Simple in-memory caching for repeated queries
- Request cancellation to avoid stale API responses
- Session storage fallback for detail page refresh

## Tech Stack

- React
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- openFDA API

## API Used

openFDA Drug Label API

Example:

```bash
https://api.fda.gov/drug/label.json?search=openfda.brand_name:"advil"&limit=20
