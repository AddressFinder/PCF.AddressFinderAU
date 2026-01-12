# PCF.Addressfinder

A PowerApps Component Framework (PCF) control that provides intelligent address autocomplete for Dynamics 365 and Power Apps forms using the [Addressfinder](https://addressfinder.com.au/) service. This control supports both Australian (GNAF/PAF) and New Zealand address databases with real-time search and validation.

## Features

- **Real-time address search** - Autocomplete addresses as users type
- **Dual country support** - Search Australian and New Zealand addresses
- **Precise geocoding** - Returns GPS coordinates with each address
- **Smart field mapping** - Automatically populates multiple form fields from a single search
- **Flexible filtering** - Filter by state codes (AU) or region codes (NZ)
- **Configurable data sources** - Choose between GNAF, PAF, or combined sources (AU only)
- **Dynamic country switching** - Bind to form fields to switch between AU/NZ databases

## What It Does

This control replaces standard address input fields with an intelligent autocomplete widget. As users type, it searches the Addressfinder API and displays matching addresses. When a user selects an address, the control automatically populates the following fields on your form:

- Full address name
- Address line 1
- Address line 2
- Suburb/locality
- State/territory
- Postcode
- Country
- GPS coordinates (in metadata)

## Prerequisites

- An [Addressfinder API key](https://addressfinder.com.au/plans/) (supports both AU and NZ with a single key)
- Dynamics 365 or Power Apps environment
- Form fields to bind for address output

## Installation

1. Download the latest release from the [Releases](../../releases) page
2. Import the solution into your Dynamics 365/Power Apps environment
3. Add the control to your form and configure the required field bindings
4. Enter your Addressfinder API key in the control configuration

## Credits

This PCF Control is a modified version of [Sankal Bansal's PCF for AddressFinder NZ](https://github.com/SankalpBansal/PCF-AddressFinderNZ)

## Configuration Parameters

### Required Parameters

- **Address Finder Key** - Your AddressFinder API key

### Optional Parameters

- **selectedCountry** - (Optional) Bind to a Choice/OptionSet field for dynamic country selection

  - Type: Choice/OptionSet (bound field)
  - Can be left unbound if not needed
  - Supports formatted labels: "Australia", "New Zealand", or codes within labels
  - Supports numeric values: `1` (Australia) or `2` (New Zealand)
  - When bound and populated, takes precedence over Default Country

- **defaultCountry** - Default country when Selected Country is not bound or empty

  - Type: Text (control property, not bound)
  - Default: `AU`
  - Valid values: `AU` or `NZ` (also accepts "Australia" or "New Zealand")
  - Only used when selectedCountry is not bound or has no value

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

## Setting up Country Selection

The control supports flexible country configuration:

### Option 1: Dynamic Selection with Choice Field (Recommended)

1. Create a Choice (Option Set) field on your entity:

   - Add options with labels like "Australia" and "New Zealand"
   - The numeric values can be any numbers (commonly 1 and 2)
   - The control reads the formatted label, not the numeric value

2. Add the field to your form

3. When configuring the PCF control:
   - Bind **selectedCountry** to your Choice field
   - Optionally set **defaultCountry** to `AU` or `NZ` as a fallback

### Option 2: Static Configuration

1. When configuring the PCF control:
   - Leave **selectedCountry** unbound
   - Set **defaultCountry** to `AU` or `NZ`

### Option 3: No Configuration

- If neither parameter is set, the control defaults to Australia (`AU`)

### How It Works

The control resolves the country in this priority order:

1. **selectedCountry** (bound Choice field) - if bound and has a value
2. **defaultCountry** (control property) - if selectedCountry not available
3. Hard-coded default: `AU`

When a country is selected, the control automatically:

- Search the selected country's address database
- Apply country-specific filtering (state_codes for AU, region_code for NZ)
- Set the Country output field to "Australia" or "New Zealand" accordingly

---

## Development

### Building from Source

Update the version in the xml file: `Solution/AddressfinderControl/src/Other/Solution.xml`

Update the version in the xml file: `AddressfinderControl/ControlManifest.Input.xml`

Update the version in the widget configuration file `index.ts` (ca parameter: `ca: "MD365/1.2.0"`)

In the root folder:

```powershell
npm install
npm run build
```

### Build a Release Package

Run the build script:

```powershell
.\build-release.ps1
```

This will:

1. Build the PCF control
2. Package the solution
3. Copy the release zip to the `Release` folder

The packaged solution will be ready to import into your Dynamics 365/Power Apps environment.

## License

See [LICENSE](LICENSE) file for details.

## Support

For issues related to the Addressfinder API, visit [Addressfinder Support](https://addressfinder.com.au/support/)

For issues with this PCF control, please open an issue in this repository.
