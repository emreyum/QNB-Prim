import { PoolBand } from './types';

// Mikro Havuz Tablosu (Gerçekleşme Yüzdesine Göre Çarpanlar)
export const poolAmountTable: PoolBand[] = [
    { min: 250, amount: 51000, percent: 2.50 },
    { min: 200, amount: 36000, percent: 2.00 },
    { min: 160, amount: 25500, percent: 1.60 },
    { min: 150, amount: 21500, percent: 1.50 },
    { min: 140, amount: 18500, percent: 1.40 },
    { min: 130, amount: 16000, percent: 1.30 },
    { min: 120, amount: 14000, percent: 1.20 },
    { min: 110, amount: 12000, percent: 1.10 },
    { min: 100, amount: 10000, percent: 1.00 },
    { min: 90, amount: 8000, percent: 0.90 },
    { min: 80, amount: 6000, percent: 0.80 },
    { min: 70, amount: 4000, percent: 0.70 },
    { min: 55, amount: 2000, percent: 0.55 },
    { min: 0, amount: 0, percent: 0 },
];

// Sabit Prim Oranları
export const RATES = {
    bireysel: 0.0025, // Bireysel dosyalardan %0.25
    vekalet: 0.01,    // Dava/Vekalet dosyalarından %1
    havuzOrani: 0.02, // Toplam KTVÜ tahsilatının %2'si havuza gider
    vintageCarpan: 0.05 // Her yeşil ay için %5 bonus
};