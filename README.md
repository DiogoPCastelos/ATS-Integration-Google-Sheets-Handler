# ATS Google Sheets Integration Handler

## Description

A handler that reads values from a Google Sheet data pool and curls them to Greenhouse using both Greenhouse and Google APIs. If you want to see the code working in its full glory, make sure to check-out [GConnection](https://www.gconnection.nl/) and sign-up for a spot on their incredible recruiting app!

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/DiogoPCastelos/ATS-Integration-Google-Sheets-Handler.git
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

## Usage

1. Configure the necessary environment variables.

2. Get a "credentials.json" file from google cloud

3. Create a "constants.json" file where you initialize and export constants to the corresponding spreadsheetId [Check Google Excel API Documentation for more information](https://developers.google.com/sheets/api/guides/concepts)

4. Run the application:

   ```bash
   node index.js
   ```

## Contributing

Contributions are not being accepted as this already solves the initial issue with all the limitations in place.

## License

Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg
