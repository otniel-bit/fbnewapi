//#region src/types/index.d.ts
interface PrefillAddress {
  country?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}
interface PrefillConfig {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: PrefillAddress;
}
interface FieldControl {
  hide?: boolean;
  disable?: boolean;
}
interface FieldsConfig {
  email?: FieldControl;
  first_name?: FieldControl;
  last_name?: FieldControl;
  phone?: FieldControl;
  address?: FieldControl;
}
type PrefillableFieldName = keyof FieldsConfig;
interface CustomizationParams {
  theme: 'light' | 'dark';
  show_product_info: boolean;
  product_layout: 'left' | 'above';
  show_coupon_row: boolean;
  coupon_row_disclaimer?: string;
  accent_color: string;
  background_color?: string;
  label_color?: string;
  input_background_color?: string;
  product_text_color?: string;
  heading_color?: string;
  secondary_color?: string;
  border_color?: string;
  surface_color?: string;
  product_image?: string;
  /** @deprecated Use `fields` for per-field visibility control instead */
  billing_display_fields?: string;
  billing_form_placement?: 'above' | 'left';
  show_headings?: boolean;
  show_powered_by?: boolean;
  prefill?: PrefillConfig;
  fields?: FieldsConfig;
}
type Theme = 'light' | 'dark';
type ProductLayout = 'left' | 'above';
interface RedirectSettings {
  success_redirect_url?: string;
  failure_redirect_url?: string;
  always_redirect?: boolean;
}
interface CheckoutConfig {
  creatorId: string;
  productId: string;
  bumpProductIds?: string[];
  couponCode?: string;
  affiliateCode?: string;
  checkoutSessionSecret: string;
  environment: 'sandbox' | 'production';
  overrideBaseUrl?: string;
  showAllAddons?: boolean;
  /** When true, shows a phone number field with country code selector on the checkout form */
  collectPhone?: boolean;
  metadata?: Record<string, string>;
  theme?: CustomizationParams;
  containerOptions?: {
    width?: string;
    height?: string;
  };
  redirectSettings?: RedirectSettings;
  showSubmitButton?: boolean;
}
interface CheckoutState {
  isOpen: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: PaymentError | null;
}
declare enum PaymentErrorCode {
  INVALID_CONFIG = "INVALID_CONFIG",
  CREATOR_ID_REQUIRED = "CREATOR_ID_REQUIRED",
  PRODUCT_ID_REQUIRED = "PRODUCT_ID_REQUIRED",
  CHECKOUT_SESSION_SECRET_REQUIRED = "CHECKOUT_SESSION_SECRET_REQUIRED",
  FIELD_VALIDATION_ERROR = "FIELD_VALIDATION_ERROR",
  FIELD_NOT_SETTABLE = "FIELD_NOT_SETTABLE",
  IFRAME_NOT_READY = "IFRAME_NOT_READY",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
interface FieldValueData {
  field: string;
  value: string | PrefillAddress | null;
}
declare class PaymentError extends Error {
  readonly code: PaymentErrorCode;
  readonly details?: any;
  constructor(code: PaymentErrorCode, message: string, details?: any);
}
interface CheckoutSuccessData {
  transactionId: string;
  amount: number;
  currency: string;
  customer: any;
  metadata: any;
}
interface SubmitFormOptions {
  paymentMethod?: string;
  forceValidation?: boolean;
}
interface FormSubmittingData {
  paymentMethod: string;
  timestamp: number;
  timestamp_iso?: string;
}
interface FormSubmissionErrorData {
  type: 'FORM_SUBMISSION_ERROR';
  timestamp: number;
  data: {
    errorCode: string;
    errorMessage: string;
    retryable: boolean;
  };
}
interface FormReadyData {
  timestamp: number;
}
interface Addon {
  id: string;
  title: string;
  price: number;
  description: string;
  subscription_details?: {
    starting_on: string;
    payment_frequency: string;
    free_trial_days: number;
    recurring_subtotal: number;
  };
}
interface AddonsChangedData {
  selectedAddons: string[];
  addons: Addon[];
}
interface CouponAppliedData {
  code: string;
  discountAmount: number;
  newTotal: number;
}
interface CouponErrorData {
  code: string;
  error: string;
}
interface FormValidationFieldStatus {
  valid: boolean;
  error: string | null;
}
interface FormValidationData {
  isValid: boolean;
  fields: Record<string, FormValidationFieldStatus>;
}
interface CheckoutEvents {
  'checkout:opened': () => void;
  'checkout:closed': () => void;
  'checkout:loaded': () => void;
  'checkout:error': (error: PaymentError) => void;
  'checkout:success': (data: CheckoutSuccessData) => void;
  'form:ready': (data: FormReadyData) => void;
  'form:submitting': (data: FormSubmittingData) => void;
  'form:submission_error': (data: FormSubmissionErrorData) => void;
  'form:validation': (data: FormValidationData) => void;
  'addons:changed': (data: AddonsChangedData) => void;
  'coupon:applied': (data: CouponAppliedData) => void;
  'coupon:error': (data: CouponErrorData) => void;
  'field:value': (data: FieldValueData) => void;
}
type CheckoutEventName = keyof CheckoutEvents;
type CheckoutEventListener<T extends CheckoutEventName> = CheckoutEvents[T];
//#endregion
//#region src/events/EventEmitter.d.ts
/**
 * Type-safe EventEmitter for the checkout system
 */
declare class EventEmitter {
  private listeners;
  /**
   * Add an event listener
   */
  on<T extends CheckoutEventName>(event: T, listener: CheckoutEventListener<T>): this;
  /**
   * Add a one-time event listener
   */
  once<T extends CheckoutEventName>(event: T, listener: CheckoutEventListener<T>): this;
  /**
   * Remove an event listener
   */
  off<T extends CheckoutEventName>(event: T, listener: CheckoutEventListener<T>): this;
  /**
   * Remove all listeners for a specific event
   */
  offAll(event: CheckoutEventName): this;
  /**
   * Remove all event listeners
   */
  removeAllListeners(): this;
  /**
   * Emit an event
   */
  emit<T extends CheckoutEventName>(event: T, ...args: any[]): boolean;
  /**
   * Get the number of listeners for a specific event
   */
  listenerCount(event: CheckoutEventName): number;
  /**
   * Get all event names that have listeners
   */
  eventNames(): CheckoutEventName[];
  /**
   * Get all listeners for a specific event
   */
  getListeners<T extends CheckoutEventName>(event: T): CheckoutEventListener<T>[];
  /**
   * Check if there are any listeners for a specific event
   */
  hasListeners(event: CheckoutEventName): boolean;
}
//#endregion
//#region src/PaymentCheckout.d.ts
/**
 * Main PaymentCheckout class for handling checkout display
 */
declare class PaymentCheckout extends EventEmitter {
  private config;
  private state;
  private iframe;
  private container;
  private pendingFieldRequests;
  constructor(config: CheckoutConfig);
  static create(config: CheckoutConfig): PaymentCheckout;
  /**
   * Create PaymentCheckout from an existing DOM element
   */
  static fromElement(element: HTMLElement, config: CheckoutConfig): PaymentCheckout;
  getState(): CheckoutState;
  updateConfig(newConfig: Partial<CheckoutConfig>): void;
  updateTheme(newTheme: CustomizationParams): void;
  init(): Promise<void>;
  destroy(): void;
  cleanup(): void;
  attachToElement(element: HTMLElement): void;
  submitForm(options?: SubmitFormOptions): void;
  isFormReady(): boolean;
  addAddon(addonId: string): void;
  removeAddon(addonId: string): void;
  toggleAddon(addonId: string): void;
  applyCoupon(code: string): void;
  removeCoupon(): void;
  setEmail(value: string): Promise<void>;
  getEmail(): Promise<string | null>;
  setFirstName(value: string): Promise<void>;
  getFirstName(): Promise<string | null>;
  setLastName(value: string): Promise<void>;
  getLastName(): Promise<string | null>;
  setPhone(value: string): Promise<void>;
  getPhone(): Promise<string | null>;
  setAddress(value: PrefillAddress): Promise<void>;
  getAddress(): Promise<PrefillAddress | null>;
  private setField;
  private getField;
  private validateAndMergeConfig;
  private emitPrefillFieldWarnings;
  private getInitialState;
  private setState;
  private initializeCheckout;
  private createEmbeddedCheckout;
  private getBaseUrl;
  private getCheckoutUrl;
  private handleMessage;
  private sendSecureMessage;
  private handleRedirect;
  private cleanupIframe;
}
//#endregion
//#region src/utils/config.d.ts
/**
 * Default configuration values
 */
declare const DEFAULT_CONFIG: Partial<CheckoutConfig>;
/**
 * Validate configuration object
 */
declare function validateConfig(config: CheckoutConfig): {
  isValid: boolean;
  errors: string[];
};
/**
 * Merge configuration with defaults
 */
declare function mergeConfig(config: Partial<CheckoutConfig>): CheckoutConfig;
/**
 * Create a minimal configuration object
 */
declare function createMinimalConfig(merchantId: string, productId: string, checkoutSessionSecret: string, environment?: 'sandbox' | 'production'): CheckoutConfig;
/**
 * Check if configuration is complete
 */
declare function isConfigComplete(config: Partial<CheckoutConfig>): config is CheckoutConfig;
/**
 * Get configuration summary for debugging
 */
declare function getConfigSummary(config: CheckoutConfig): Record<string, any>;
//#endregion
//#region src/utils/lazyLoader.d.ts
/**
 * Lazy loading system for dynamic imports and progressive enhancement
 */
interface LazyModuleConfig {
  name: string;
  importFn: () => Promise<any>;
  fallback?: any;
  timeout?: number;
}
declare class LazyLoader {
  private modules;
  private loadedModules;
  private loadingPromises;
  /**
   * Register a lazy-loadable module
   */
  register(config: LazyModuleConfig): void;
  /**
   * Load a module dynamically
   */
  load(moduleName: string): Promise<any>;
  /**
   * Load module with timeout handling
   */
  private loadModuleWithTimeout;
  /**
   * Preload a module in the background
   */
  preload(moduleName: string): void;
  /**
   * Check if a module is loaded
   */
  isLoaded(moduleName: string): boolean;
  /**
   * Check if a module is currently loading
   */
  isLoading(moduleName: string): boolean;
  /**
   * Get all loaded module names
   */
  getLoadedModules(): string[];
  /**
   * Clear all cached modules
   */
  clear(): void;
}
declare const lazyLoader: LazyLoader;
declare const LAZY_MODULES: {
  readonly SECURITY: "security";
  readonly EMBED: "embed";
};
//#endregion
//#region src/utils/serviceWorker.d.ts
/**
 * Service worker for offline support and asset caching
 */
interface ServiceWorkerConfig {
  cacheName: string;
  version: string;
  assets: string[];
  apiEndpoints: string[];
  offlinePage?: string;
}
declare class ServiceWorkerManager {
  private config;
  constructor(config: ServiceWorkerConfig);
  /**
   * Generate service worker script
   */
  generateServiceWorkerScript(): string;
  /**
   * Register service worker
   */
  register(swPath: string): Promise<ServiceWorkerRegistration | null>;
  /**
   * Unregister service worker
   */
  unregister(): Promise<boolean>;
  /**
   * Check if service worker is active
   */
  isActive(): Promise<boolean>;
}
/**
 * Default service worker configuration
 */
declare const DEFAULT_SW_CONFIG: ServiceWorkerConfig;
declare const swManager: ServiceWorkerManager;
//#endregion
//#region src/embed/globalConstructor.d.ts
declare function initializeGlobalConstructor(): void;
//#endregion
//#region src/embed/scriptLoader.d.ts
/**
 * Script loading and initialization utilities
 */
interface ScriptLoadOptions {
  url?: string;
  async?: boolean;
  defer?: boolean;
  crossorigin?: string;
  integrity?: string;
}
/**
 * Load a script dynamically
 */
declare function loadScript(options?: ScriptLoadOptions): Promise<void>;
/**
 * Load checkout script with default configuration
 */
declare function loadCheckoutScript(version?: string): Promise<void>;
/**
 * Set up global checkout initialization
 */
declare function setupGlobalInitialization(): void;
/**
 * Check if checkout script is loaded
 */
declare function isCheckoutLoaded(): boolean;
/**
 * Wait for checkout to be available
 */
declare function waitForCheckout(timeout?: number): Promise<void>;
//#endregion
//#region src/embed/index.d.ts
declare const createEmbeddedCheckout: (element: HTMLElement, config: any) => PaymentCheckout;
//#endregion
export { type Addon, type AddonsChangedData, type CheckoutConfig, type CheckoutEventListener, type CheckoutEventName, type CheckoutEvents, type CheckoutState, type CheckoutSuccessData, type CouponAppliedData, type CouponErrorData, type CustomizationParams, DEFAULT_CONFIG, DEFAULT_SW_CONFIG, EventEmitter, type FieldControl, type FieldValueData, type FieldsConfig, type FormReadyData, type FormSubmissionErrorData, type FormSubmittingData, type FormValidationData, type FormValidationFieldStatus, LAZY_MODULES, LazyLoader, LazyModuleConfig, PaymentCheckout, PaymentError, PaymentErrorCode, type PrefillAddress, type PrefillConfig, type PrefillableFieldName, type ProductLayout, ServiceWorkerConfig, ServiceWorkerManager, type SubmitFormOptions, type Theme, createEmbeddedCheckout, createMinimalConfig, getConfigSummary, initializeGlobalConstructor, isCheckoutLoaded, isConfigComplete, lazyLoader, loadCheckoutScript, loadScript, mergeConfig, setupGlobalInitialization, swManager, validateConfig, waitForCheckout };
//# sourceMappingURL=index.d.ts.map