import { poolAmountTable, RATES } from '../constants';
import { MikroResult } from '../types';

/**
 * 1. MİKRO Hesaplaması
 * Girdi: Hedef, Tahsilat
 * Çıktı: Prim Oranı, Gerçekleşme Yüzdesi, Hak Edilen Tutar
 */
export function calculateMikro(target: number, collection: number): MikroResult {
    if (target <= 0) return { rate: 0, realizationPercent: 0, premium: 0 };

    // a. Gerçekleşme Yüzdesi
    const realizationRate = collection / target;
    const realizationPercent = realizationRate * 100;

    // b. Tablodan Havuz Değerini Bul
    // Gerçekleşme yüzdesine denk gelen satırı bulur
    const band = poolAmountTable.find(r => realizationPercent >= r.min) || { amount: 0, percent: 1 };

    // c. Efektif Prim Oranı Hesabı
    // Formül: TabloTutarı / (Hedef * TabloYüzdesi)
    let rate = 0;
    if (band.percent > 0) {
        rate = band.amount / (target * band.percent);
    }

    // d. Prim Tutarı
    const premium = collection * rate;

    return { rate, realizationPercent, premium };
}

/**
 * 2. KTVÜ / MUVU (Ortak Havuz) Hesaplaması
 * Mantık: Toplam paranın %2'si havuza girer. Bu havuz, personellerin MİKRO performansına (Puanına) göre dağıtılır.
 */
export function calculatePoolShare(totalCollection: number, myScore: number, totalAllScores: number): number {
    // a. Toplam Havuz Tutarı
    const poolAmount = totalCollection * RATES.havuzOrani;

    // b. Personelin Payı
    // Formül: (Benim Mikro Puanım / Toplam Mikro Puanı) * Havuz Parası
    let myPremium = 0;
    if (totalAllScores > 0) {
        myPremium = (myScore / totalAllScores) * poolAmount;
    }

    return myPremium;
}

/**
 * 3. DİĞER KATEGORİLER (Bireysel ve Vekalet)
 */
export function calculateStandardPremium(collection: number, type: 'bireysel' | 'vekalet'): number {
    const rate = type === 'bireysel' ? RATES.bireysel : RATES.vekalet;
    return collection * rate;
}

/**
 * 4. VINTAGE (Kıdem/Performans Bonusu)
 * Formül: Toplam Prim * (Yeşil Ay Sayısı * 0.05)
 */
export function calculateVintageBonus(baseTotalPremium: number, greenMonthsCount: number): number {
    const bonusRate = greenMonthsCount * RATES.vintageCarpan;
    return baseTotalPremium * bonusRate;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

export function formatPercent(value: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
}

export function formatNumber(value: number): string {
     return new Intl.NumberFormat('tr-TR').format(value);
}