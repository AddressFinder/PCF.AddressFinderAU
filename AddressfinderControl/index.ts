import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class AddressfinderControl
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  // Reference to ComponentFramework Context object
  private _context: ComponentFramework.Context<IInputs>;

  // PCF framework delegate which will be assigned to this object which would be called whenever any update happens.
  private _notifyOutputChanged: () => void;

  private inputElement: HTMLInputElement;

  private _addressfinderScript: HTMLScriptElement;

  private _address_fullname: string;

  private _address_line_1: string;

  private _container: HTMLDivElement;

  private _address_line_2: string;

  private _suburb: string;

  private _city_state: string;

  private _postcode: string;

  private _country: string;

  private _latitude: string;

  private _longitude: string;

  private widget: any;

  private AddressFinder: any;

  // eslint-disable-next-line no-undef
  private _refreshData: EventListenerOrEventListenerObject;

  private _domId: string;

  // Track the current country to detect changes
  private _currentCountry: "AU" | "NZ" = "AU";

  constructor() {
    // eslint-disable-next-line no-undef
    this.AddressFinder = require("./Widget"); // eslint-disable-line no-undef
  }

  /**
   * Resolves the country code from selectedCountry or defaultCountry parameters
   * @param context The control context
   * @returns "AU" or "NZ"
   */
  private resolveCountry(
    context: ComponentFramework.Context<IInputs>,
  ): "AU" | "NZ" {
    let resolvedCountry: "AU" | "NZ" = "AU";

    // 1. Check if selectedCountry is bound and has a value
    const selectedCountry = context.parameters.selectedCountry;
    if (
      selectedCountry &&
      selectedCountry.raw !== null &&
      selectedCountry.raw !== undefined
    ) {
      // Try formatted label first (handles "Australia", "New Zealand", "AU Australia", etc.)
      const formattedValue = selectedCountry.formatted?.toUpperCase() || "";

      if (
        formattedValue.includes("NEW ZEALAND") ||
        formattedValue.includes("NZ")
      ) {
        resolvedCountry = "NZ";
      } else if (
        formattedValue.includes("AUSTRALIA") ||
        formattedValue.includes("AU")
      ) {
        resolvedCountry = "AU";
      } else {
        // Fallback to numeric value mapping (1=AU, 2=NZ)
        const numericValue = selectedCountry.raw;
        if (typeof numericValue === "number") {
          if (numericValue === 2) {
            resolvedCountry = "NZ";
          } else if (numericValue === 1) {
            resolvedCountry = "AU";
          }
        }
      }
    }
    // 2. Fallback to defaultCountry if selectedCountry not available
    else {
      const defaultCountry =
        context.parameters.defaultCountry?.raw?.toUpperCase();
      if (defaultCountry) {
        if (defaultCountry === "NZ" || defaultCountry === "NEW ZEALAND") {
          resolvedCountry = "NZ";
        } else if (defaultCountry === "AU" || defaultCountry === "AUSTRALIA") {
          resolvedCountry = "AU";
        }
      }
    }

    // Final validation - ensure only AU or NZ
    if (resolvedCountry !== "AU" && resolvedCountry !== "NZ") {
      resolvedCountry = "AU";
    }

    return resolvedCountry;
  }

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement,
  ) {
    // Add control initialization code
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;
    this._address_fullname =
      this._context.parameters.address_fullname.raw || "";
    this._refreshData = this.refreshData.bind(this);
    this._domId = Math.random().toString(10);
    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("id", "search_field" + this._domId);
    this.inputElement.setAttribute("type", "text");
    this.inputElement.setAttribute("style", "width:95%;");
    this.inputElement.addEventListener("input", this._refreshData);
    this._addressfinderScript = document.createElement("script");
    this._addressfinderScript.setAttribute(
      "src",
      "https://api.addressfinder.io/assets/v3/widget.js",
    );
    this._container.appendChild(this._addressfinderScript);
    this._container.appendChild(this.inputElement);
    container = this._container;

    // Add control initialization code
    this.GetAddressFinderKeyandContinueCallBack(
      this._context.parameters.afKey.raw,
    );
  }

  public refreshData(evt: Event): void {
    if (this.inputElement.value.length == 0) {
      this._address_fullname = "";
      this._notifyOutputChanged();
    }
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Update context
    this._context = context;
    this.inputElement.value = this._address_fullname;

    // Check if country has changed
    const newCountry = this.resolveCountry(context);
    if (newCountry !== this._currentCountry) {
      this._currentCountry = newCountry;
      // Reinitialize the widget with the new country
      if (this.widget) {
        // Destroy the old widget if it exists
        this.widget = null;
      }
      this.loadWidget(this._context.parameters.afKey.raw);
    }
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {
      address_fullname: this._address_fullname,
      address_line_1: this._address_line_1,
      address_line_2: this._address_line_2,
      suburb: this._suburb,
      state: this._city_state,
      postcode: this._postcode,
      country: this._country,
      latitude: this._latitude,
      longitude: this._longitude,
    };
  }

  loadWidget = (addressFinderKey: string | null) => {
    var searchField = document.getElementById("search_field" + this._domId);

    // Resolve country using the new helper function
    const searchCountry = this.resolveCountry(this._context);
    this._currentCountry = searchCountry;

    // Update placeholder to show current country (full name)
    const countryName = searchCountry === "NZ" ? "New Zealand" : "Australia";
    this.inputElement.setAttribute(
      "placeholder",
      `Search ${countryName} addresses...`,
    );

    const stateCodesParam = this._context.parameters.state_codes?.raw;
    const sourceParam = this._context.parameters.source?.raw || "gnaf";
    const regionCodeParam = this._context.parameters.region_code?.raw;

    // Build address_params object conditionally
    const addressParams: any = {};

    // Only add source and state_codes if AU
    if (searchCountry === "AU") {
      addressParams.source = sourceParam;
      if (stateCodesParam && stateCodesParam.trim() !== "") {
        addressParams.state_codes = stateCodesParam;
      }
    } else if (searchCountry === "NZ") {
      // Add region_code if NZ and it exists
      if (regionCodeParam && regionCodeParam.trim() !== "") {
        addressParams.region_code = regionCodeParam;
      }
    }

    this.widget = new this.AddressFinder.Widget(
      searchField,
      addressFinderKey,
      searchCountry,
      {
        address_params: addressParams,
        address_metadata_params: {
          gps: "1",
        },
        max_results: 8,
        ca: "MD365/1.4.0",
      },
    );
    this.widget.on("result:select", (fullAddress: any, metaData: any) => {
      // Resolve country using the helper function
      const searchCountry = this.resolveCountry(this._context);

      this.inputElement.value = fullAddress;
      this._address_fullname = fullAddress;
      this._address_line_1 = metaData.address_line_1;
      this._address_line_2 = metaData.address_line_2;
      this._postcode = metaData.postcode;

      // Map fields differently for AU vs NZ
      if (searchCountry === "NZ") {
        this._suburb = metaData.suburb;
        this._city_state = metaData.city;
        this._country = "New Zealand";
        // NZ uses x (longitude) and y (latitude)
        this._latitude = metaData.y || "";
        this._longitude = metaData.x || "";
      } else {
        // AU
        this._suburb = metaData.locality_name;
        this._city_state = metaData.state_territory;
        this._country = "Australia";
        // AU uses latitude and longitude
        this._latitude = metaData.latitude || "";
        this._longitude = metaData.longitude || "";
      }

      this._notifyOutputChanged();
    });
  };

  public GetAddressFinderKeyandContinueCallBack(
    addressFinderKey: string | null,
  ) {
    this.loadWidget(addressFinderKey);
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
