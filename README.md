# PCF.AddressFinderAU

Dynamics 365/PowerApps PCF Control for AddressFinder (https://addressfinder.com.au/) - Australian and New Zealand Address Lookup

This PCF Control is a modified version of Sankal Bansal's PCF of New Zealand-based AddressFinder (https://github.com/SankalpBansal/PCF-AddressFinderNZ)

This PCF Control will bind the full address to a specific field and map the granular address breakdown:

- Address Name (Full Address) - main field
- Address Line 1
- Address Line 2
- Suburb
- State
- Postcode
- Country - automatically set to "Australia" or "New Zealand" based on the SearchCountry parameter

## Configuration Parameters

### Required Parameters

- **Address Finder Key** - Your AddressFinder API key

### Optional Parameters

- **SearchCountry** - Country to search addresses in. Can be bound to a form field or set as a static value.

  - Default: `AU`
  - Valid values: `AU` (Australia) or `NZ` (New Zealand)
  - Example: Bind to a country dropdown field to dynamically switch between AU and NZ addresses

- **State Codes** - (AU only) State codes to filter Australian addresses

  - Default: Empty (no filter)
  - Example: `VIC,NSW,QLD` to limit results to these states
  - Only applied when SearchCountry is `AU`

- **Address Source** - (AU only) Address source to search

  - Default: `gnaf`
  - Example: `gnaf,paf` to include both GNAF and PAF sources
  - Only applied when SearchCountry is `AU`

- **Region Code** - (NZ only) Region codes to filter New Zealand addresses
  - Default: Empty (no filter)
  - Example: `1` to limit results to Auckland (see https://addressfinder.com/nz/docs/api/nz/nz-address-autocomplete-api for a full reference list)
  - Only applied when SearchCountry is `NZ`

## Setting up a Country Dropdown

To allow users to dynamically switch between Australian and New Zealand addresses:

1. Create an Option Set field (or use an existing country field) on your form with values:

   - `AU` - Australia
   - `NZ` - New Zealand

2. When configuring the PCF control, bind the **SearchCountry** parameter to this field

3. The control will automatically:
   - Search the selected country's address database
   - Apply country-specific filtering (state_codes for AU, region_code for NZ)
   - Set the Country output field to "Australia" or "New Zealand" accordingly

# Building

Update the version in the xml file: `Solution/AddressFinderControlAU/Other/Solution.xml`

Update the version in the xml file: `AddressFinderAU/ControlManifest.Input.xml`

Update the version in the widget configuration file `index.ts`

In the root folder

`npm install`
`npm run build`

## Build a Release Package

Run the build script:

`.\build-release.ps1`

This will build the PCF control, package the solution, and copy the release zip to the `Release` folder.
