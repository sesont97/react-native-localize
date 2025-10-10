/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import I18n from '@ohos.i18n';
import Intl from '@ohos.intl';

export class RNLocalizeModule extends TurboModule implements TM.RNLocalize.Spec {

  // 判断字符是否为数字
  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private analyzeNumberFormat(formatted: string, original: number): { decimalSeparator: string, groupingSeparator: string } {
    const numStr = original.toString();
    const decimalIndex = numStr.indexOf('.');

    let decimalSeparator = '.';
    let groupingSeparator = ',';

    // 查找小数点分隔符
    if (decimalIndex !== -1) {
      const decimalPart = numStr.substring(decimalIndex + 1);
      const formattedDecimalIndex = formatted.length - decimalPart.length - 1;

      if (formattedDecimalIndex >= 0 && formattedDecimalIndex < formatted.length) {
        decimalSeparator = formatted[formattedDecimalIndex];
      }
    }

    // 查找千分位分隔符（找第一个非数字非小数点的字符）
    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      if (!this.isDigit(char) && char !== decimalSeparator) {
        groupingSeparator = char;
        break;
      }
    }

    return { decimalSeparator, groupingSeparator };
  }

  getCalendar(): string {
    let locale = new Intl.Locale();
    let calendar = locale.calendar;
    if(calendar == '') {
      return 'gregorian';
    }
    return calendar;
  }

  getCountry() {
    let systemRegion: string = '';
    try {
      systemRegion = I18n.System.getSystemRegion(); // 获取系统当前地区设置
    } catch(error) {
      systemRegion =  "US";
      console.error(`call System.getSystemRegion failed, error code: ${error.code}, message: ${error.message}.`);
    }
    return systemRegion;
  }

  getCurrencies() {
    let currenciesArray = [];
    let numfmt = new Intl.NumberFormat();
    let options = numfmt.resolvedOptions();
    let currency = options.currency;
    if(currency == undefined) {
      currency = "USD";
    }
    currenciesArray.push(currency);
    return currenciesArray;
  }

  localeOptions = {
    languageCode: '',
    scriptCode: '',
    countryCode: '',
    languageTag: '',
    isRTL: true
  }

  getLocales() {
    let localesArray = [];
    let locale = new Intl.Locale();
    this.localeOptions.languageCode = locale.language;
    this.localeOptions.scriptCode = locale.script;
    this.localeOptions.countryCode = locale.region;
    this.localeOptions.languageTag = locale.baseName;
    this.localeOptions.isRTL = I18n.isRTL(this.localeOptions.languageTag);
    localesArray.push(this.localeOptions);
    return localesArray;
  }

  getNumberFormatSettings = () => {
    let systemRegion: string = '';
    try {
      systemRegion = I18n.System.getSystemRegion();
      const numberFormat = new Intl.NumberFormat(systemRegion);

      const testNumber = 1000000.1;
      const formattedNumber = numberFormat.format(testNumber);

      const { decimalSeparator, groupingSeparator } = this.analyzeNumberFormat(formattedNumber, testNumber);

      return {
        decimalSeparator: decimalSeparator,
        groupingSeparator: groupingSeparator,
      };
    } catch (error) {
      console.error(`Failed to obtain digital format settings, error code: ${error.code}, message: ${error.message}.`);
      return {
        decimalSeparator: ".",
        groupingSeparator: ",",
      };
    }
  };

  getTemperatureUnit = () => "celsius"; // or "fahrenheit"

  getTimeZone() {
    let timezone = I18n.getTimeZone();
    let timezoneID = timezone.getID();
    return timezoneID;
  }

  uses24HourClock() {
    let is24HourClock: boolean = false;
    try {
      is24HourClock = I18n.System.is24HourClock();  // 系统24小时开关是否开启
    } catch(error) {
      console.error(`call System.is24HourClock failed, error code: ${error.code}, message: ${error.message}.`);
    }
    return is24HourClock;
  }

  usesMetricSystem = () => true;

  usesAutoDateAndTime(): null | boolean{
    return null
  }

  usesAutoTimeZone(): null | boolean{
    return null
  }
}
