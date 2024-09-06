export interface Currency {
  rate: number;
  full_name: string;
  name: string;
  symbol: string;
}

export interface ExchangeRateResponse {
  base_code: string;
  rates: { [key: string]: number };
  time_last_update_utc: string;
  [key: string]: any;
}

export interface CountryCurrencyInfo {
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}