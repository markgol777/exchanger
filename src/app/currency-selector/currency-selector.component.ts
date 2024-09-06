import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Currency } from "../Currency";
import { CurrencyService } from "../currency-service/currency-service.component";

@Component({
  selector: 'app-currency-selector',
  templateUrl: './currency-selector.component.html',
  styleUrls: ['../../styles/default.scss', './currency-selector.component.scss']
})
export class CurrencySelectorComponent implements OnInit, AfterViewInit {
  public edited = true;
  @Input() changeCurrency
  @Input() selectorId

  public currencies: Currency[] = [];
  public selectedCurrency!: Currency;
  public elementCurrenciesList!: HTMLElement;
  public findCurrency: string = '';
  public ignoreFocusOut = false;
  public noResultsFind = false;
  @ViewChild('search_input', { static: false }) search_input;

  constructor(private changeDetector: ChangeDetectorRef, public service: CurrencyService) { }

  public valueFinding() {
    this.currencies = this.service.getCurrencies().filter(item =>
      item.name.toLowerCase().includes(this.findCurrency.toLowerCase()) ||
      item.full_name.toLowerCase().includes(this.findCurrency.toLowerCase())
    );

    this.noResultsFind = this.currencies.length === 0;
  }

  selectCurrency = (currency: Currency): void => {
    this.selectedCurrency = currency;
    this.changeCurrency(currency);
    this.HideDropdown();

    localStorage.setItem(this.selectorId, currency.name);
  }

  ShowDropdown() {
    this.edited = false;
    this.elementCurrenciesList.classList.add('show');
  }

  HideDropdown() {
    this.edited = true;
    this.elementCurrenciesList.classList.remove('show');
  }

  dropClick() {
    this.findCurrency = '';
    this.ShowDropdown();
    setTimeout(() => {
      this.changeDetector.detectChanges();
      this.search_input.nativeElement.focus();
      this.valueFinding();
    }, 0);
  }

  focusOutInput() {
    if (!this.ignoreFocusOut) {
      this.HideDropdown();
    }
  }

  private selectCurrencyOnStart() {
    let data: Currency | undefined;
    const localData = localStorage.getItem(this.selectorId);
    if (localData) {
      data = this.service.getCurrencies().find(element => element.name === localData);
    }
    if (!data) {
      data = this.service.getCurrencies().find(element => element.name === (this.selectorId === 'from' ? 'EUR' : 'USD'));
    }
    if (data) {
      this.selectCurrency(data);
    }
  }

  ngAfterViewInit(): void {
    this.elementCurrenciesList = document.getElementById('currenciesList ' + this.selectorId) as HTMLElement;
    setTimeout(() => this.selectCurrencyOnStart(), 0);
  }

  ngOnInit(): void {
    this.currencies = this.service.getCurrencies();
    this.selectedCurrency = this.currencies[0];
    this.changeCurrency(this.currencies[0]);
  }
}
