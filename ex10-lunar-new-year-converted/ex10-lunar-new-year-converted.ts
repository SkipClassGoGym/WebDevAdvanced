import { Component } from '@angular/core';

const STEMS = [
  'Gi\u00e1p',
  '\u1EA4t',
  'B\u00ednh',
  '\u0110inh',
  'M\u1EADu',
  'K\u1EF7',
  'Canh',
  'T\u00e2n',
  'Nh\u00e2m',
  'Qu\u00fd',
];

const BRANCHES = [
  'T\u00fd',
  'S\u1EEDu',
  'D\u1EA7n',
  'M\u00E3o',
  'Th\u00ECn',
  'T\u1EF5',
  'Ng\u1ECD',
  'M\u00F9i',
  'Th\u00E2n',
  'D\u1EADu',
  'Tu\u1EA5t',
  'H\u1EE3i',
];

const TIME_ZONE = 7;
const PI = Math.PI;

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  if (jd < 2299161) {
    jd =
      dd +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      32083;
  }

  return jd;
}

function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * M * dr) -
    0.4068 * Math.sin(Mpr * dr) +
    0.0161 * Math.sin(2 * Mpr * dr) -
    0.0004 * Math.sin(3 * Mpr * dr) +
    0.0104 * Math.sin(2 * F * dr) -
    0.0051 * Math.sin((M + Mpr) * dr) -
    0.0074 * Math.sin((M - Mpr) * dr) +
    0.0004 * Math.sin((2 * F + M) * dr) -
    0.0004 * Math.sin((2 * F - M) * dr) -
    0.0006 * Math.sin((2 * F + Mpr) * dr) +
    0.001 * Math.sin((2 * F - Mpr) * dr) +
    0.0005 * Math.sin((2 * Mpr + M) * dr);
  let deltaT = 0;

  if (T < -11) {
    deltaT =
      0.001 +
      0.000839 * T +
      0.0002261 * T2 -
      0.00000845 * T3 -
      0.000000081 * T * T3;
  } else {
    deltaT = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }

  const jdNew = jd1 + C1 - deltaT;
  return Math.floor(jdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  const DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * dr * M) +
    0.00029 * Math.sin(3 * dr * M);
  let L = L0 + DL;
  L *= dr;
  L -= PI * 2 * Math.floor(L / (PI * 2));
  return Math.floor((L / PI) * 6);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);

  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }

  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor(0.5 + (a11 - 2415021) / 29.530588853);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);

  do {
    last = arc;
    i += 1;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);

  return i - 1;
}

function convertSolar2Lunar(
  dd: number,
  mm: number,
  yy: number,
  timeZone: number
): [number, number, number, number] {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);

  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }

  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;

  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  let diff = Math.floor((monthStart - a11) / 29);
  let lunarMonth = diff + 11;
  let lunarLeap = 0;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = 1;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }

  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function getCanChiYear(year: number): string {
  const stem = STEMS[(year + 6) % 10];
  const branch = BRANCHES[(year + 8) % 12];
  return `${stem} ${branch}`;
}

function getCanChiMonth(lunarMonth: number, lunarYear: number): string {
  const stem = STEMS[(lunarYear * 12 + lunarMonth + 3) % 10];
  const branch = BRANCHES[(lunarMonth + 1) % 12];
  return `${stem} ${branch}`;
}

function getCanChiDay(dd: number, mm: number, yy: number): string {
  const jd = jdFromDate(dd, mm, yy);
  const stem = STEMS[(jd + 9) % 10];
  const branch = BRANCHES[(jd + 1) % 12];
  return `${stem} ${branch}`;
}

class LunarYear {
  constructor(
    readonly day: number,
    readonly month: number,
    readonly calendarYear: number
  ) {}

  findLunarYearDetail(): string {
    const [lunarDay, lunarMonth, lunarYear, lunarLeap] = convertSolar2Lunar(
      this.day,
      this.month,
      this.calendarYear,
      TIME_ZONE
    );
    const solarDate = `${pad2(this.day)}/${pad2(this.month)}/${this.calendarYear}`;
    const lunarDate = `${pad2(lunarDay)}/${pad2(lunarMonth)}/${lunarYear}`;
    const leapNote = lunarLeap ? ' <span class="lunar__note">&#40;nhu&#7853;n&#41;</span>' : '';
    const canChiDay = getCanChiDay(this.day, this.month, this.calendarYear);
    const canChiMonth = getCanChiMonth(lunarMonth, lunarYear);
    const canChiYear = getCanChiYear(lunarYear);

    return `
      <div class="lunar__detail">
        <p class="lunar__detail-label">Ng&#224;y d&#432;&#417;ng l&#7883;ch</p>
        <p class="lunar__detail-value">${solarDate}</p>
        <p class="lunar__detail-label">Ng&#224;y &#226;m l&#7883;ch</p>
        <p class="lunar__detail-value">${lunarDate}${leapNote}</p>
        <div class="lunar__detail-divider"></div>
        <ul class="lunar__detail-list">
          <li>Can chi ng&#224;y: <strong>${canChiDay}</strong></li>
          <li>Can chi th&#225;ng: <strong>${canChiMonth}</strong></li>
          <li>Can chi n&#259;m: <strong>${canChiYear}</strong></li>
        </ul>
      </div>
    `.trim();
  }
}

@Component({
  selector: 'app-ex10-lunar-new-year-converted',
  standalone: false,
  templateUrl: './ex10-lunar-new-year-converted.html',
  styleUrl: './ex10-lunar-new-year-converted.css',
})
export class Ex10LunarNewYearConverted {
  readonly months = Array.from({ length: 12 }, (_, index) => index + 1);
  readonly years: number[];
  days: number[] = [];

  selectedDay = 1;
  selectedMonth = 1;
  selectedYear = 2024;

  lunarDetailHtml = '';
  errorMessage = '';

  private readonly minYear = 1900;
  private readonly maxYear = 2100;

  constructor() {
    const now = new Date();
    this.years = this.generateYears(this.minYear, this.maxYear);
    this.selectedYear = this.clampYear(now.getFullYear());
    this.selectedMonth = now.getMonth() + 1;
    this.days = this.generateDays(this.selectedYear, this.selectedMonth);
    this.selectedDay = Math.min(now.getDate(), this.days.length);
  }

  trackByValue(_index: number, value: number): number {
    return value;
  }

  onMonthYearChange(): void {
    this.days = this.generateDays(this.selectedYear, this.selectedMonth);
    if (this.selectedDay > this.days.length) {
      this.selectedDay = this.days.length;
    }
  }

  onConvert(): void {
    this.errorMessage = '';
    this.lunarDetailHtml = '';

    if (!this.isValidDate(this.selectedDay, this.selectedMonth, this.selectedYear)) {
      this.errorMessage = 'Vui l\u00f2ng ch\u1ecdn ng\u00e0y h\u1ee3p l\u1ec7.';
      return;
    }

    const lunarYear = new LunarYear(this.selectedDay, this.selectedMonth, this.selectedYear);
    this.lunarDetailHtml = lunarYear.findLunarYearDetail();
  }

  private generateYears(start: number, end: number): number[] {
    const years: number[] = [];
    for (let year = end; year >= start; year -= 1) {
      years.push(year);
    }
    return years;
  }

  private generateDays(year: number, month: number): number[] {
    const dayCount = new Date(year, month, 0).getDate();
    return Array.from({ length: dayCount }, (_, index) => index + 1);
  }

  private isValidDate(day: number, month: number, year: number): boolean {
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  private clampYear(year: number): number {
    return Math.min(Math.max(year, this.minYear), this.maxYear);
  }
}
