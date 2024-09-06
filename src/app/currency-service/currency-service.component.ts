import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Currency } from 'src/app/Currency';
import { ExchangeRateResponse, CountryCurrencyInfo } from '../Currency';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private currencies: Currency[] = [];
  private lastUpdate?: string;
  private readonly exchangeRateUrl = 'https://open.er-api.com/v6/latest/USD';
  private readonly countryCurrencyUrl = 'https://restcountries.com/v3.1/all?fields=currencies';

  constructor(private http: HttpClient) {}

  public getCurrencies(): Currency[] {
    return this.currencies;
  }

  public getLastUpdate(): string | undefined {
    return this.lastUpdate;
  }

  public async fetchCurrencies(): Promise<Currency[]> {
    if (this.currencies.length === 0) {
      try {
        const exchangeRateData = await this.http.get<ExchangeRateResponse>(this.exchangeRateUrl).toPromise();
        if (exchangeRateData && exchangeRateData.rates) {
          this.currencies = Object.entries(exchangeRateData.rates).map(([name, rate]) => ({
            rate,
            full_name: '',
            name,
            symbol: ''
          }));
          this.lastUpdate = exchangeRateData.time_last_update_utc;
        }

        const countryData = await this.http.get<CountryCurrencyInfo[]>(this.countryCurrencyUrl).toPromise();
        if (countryData) {
          this.updateCurrencyDetails(countryData);
        }
      } catch (error) {
        console.error('Error fetching currency data:', error);
        throw new Error('Failed to fetch currency data.');
      }
    }
    return this.currencies;
  }

  private updateCurrencyDetails(countryData: CountryCurrencyInfo[]): void {
    countryData.forEach((country) => {
      const currencies = country.currencies || {};
      const currencyCode = Object.keys(currencies)[0];
      const currencyInfo = currencies[currencyCode];

      if (currencyCode && currencyInfo) {
        const index = this.currencies.findIndex((currency) => currency.name === currencyCode);

        if (index !== -1) {
          this.currencies[index] = {
            ...this.currencies[index],
            full_name: currencyInfo.name || '',
            symbol: currencyInfo.symbol || '',
          };
        }
      }
    });
  }
}
