import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Currency } from './Currency';
import { CurrencyService } from './currency-service/currency-service.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'currency-exchange';
  public isDataAvailable = false;
  public failedToLoad = false;
  private _from?: Currency;
  private to?: Currency;
  public amount_value: string = '1.00';
  @ViewChild('from', { static: false }) fromCmp!: any;
  @ViewChild('to', { static: false }) toCmp!: any;
  @ViewChild('amount_input', { static: false }) amount_input!: ElementRef<HTMLInputElement>;
  @ViewChild('submitBtn', { static: false }) submitBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('formExchange', { static: false }) formExchange!: ElementRef<HTMLFormElement>;

  public resultFrom?: string;
  public resultTo?: string;
  public resultInfo?: string;
  public isResult = false;
  public lastUpdate?: string;

  get from_symbol(): string {
    return this._from?.symbol || '';
  }

  constructor(private modalService: NgbModal, public service: CurrencyService) {}

  public selectFrom = (currency: Currency): void => {
    this._from = currency;
    if (this.isResult) this.exchange();
  }

  public selectTo = (currency: Currency): void => {
    this.to = currency;
    if (this.isResult) this.exchange();
  }

  changeAmountValue(): void {
    this.amount_value = (Math.round(parseFloat(this.amount_value) * 100) / 100).toFixed(2);
    localStorage.setItem('amount', this.amount_value);
    if (this.isResult) this.exchange();
  }

  public switchCurrencies(): void {
    if (this._from && this.to) {
      const temp = this._from;
      this.fromCmp.selectCurrency(this.to);
      this.toCmp.selectCurrency(temp);
      if (this.isResult) this.exchange();
    }
  }

  public exchange(): void {
    if (this._from && this.to && this.amount_value) {
      const rateBase = this.to.rate / this._from.rate;
      const result = parseFloat(this.amount_value) * rateBase;
      this.resultFrom = `${this.amount_value} ${this._from.full_name || this._from.name} =`;
      this.resultTo = `${result.toFixed(5)} ${this.to.full_name || this.to.name}`;
      this.resultInfo = `${(1).toFixed(2)} ${this._from.name} = ${rateBase.toFixed(6)} ${this.to.name}\n${(1).toFixed(2)} ${this.to.name} = ${(1 / rateBase).toFixed(6)} ${this._from.name}`;
    }
  }

  onSubmit(): void {
    this.exchange();
    this.isResult = true;
    const lastUpdate = this.service.getLastUpdate();
    const date = new Date(lastUpdate || '');
    this.lastUpdate = date.toLocaleString() + ' UTC';
  }

  ngOnInit(): void {
    this.service.fetchCurrencies().then((data) => {
      this._from = data[0];
      this.to = data[1];
      this.isDataAvailable = true;
    }).catch(() => {
      this.failedToLoad = true;
    });

    const localAmount = localStorage.getItem('amount');
    this.amount_value = localAmount || '1.00';
  }

  windowResize(): void {
    if (this.submitBtn && this.formExchange) {
      this.submitBtn.nativeElement.style.width = this.formExchange.nativeElement.offsetWidth + 'px';
    }
  }
}
