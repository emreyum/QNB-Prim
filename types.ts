export interface PoolBand {
    min: number;
    amount: number;
    percent: number;
}

export interface MikroResult {
    rate: number;
    realizationPercent: number;
    premium: number;
}

export interface EmployeeData {
    id: string;
    name: string;
    mikroTarget: number;
    mikroCollection: number;
    bireyselCollection: number;
    vekaletCollection: number;
    greenMonths: number;
}

export interface CalculatedEmployee extends EmployeeData {
    mikroStats: MikroResult;
    poolSharePremium: number;
    bireyselPremium: number;
    vekaletPremium: number;
    subTotal: number;
    vintageBonus: number;
    finalTotal: number;
}