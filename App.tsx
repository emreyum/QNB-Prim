import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EmployeeData, CalculatedEmployee } from './types';
import { calculateMikro, calculatePoolShare, calculateStandardPremium, calculateVintageBonus, formatCurrency, formatNumber } from './utils/calculations';
import { EmployeeCard } from './components/EmployeeCard';
import { InputGroup } from './components/InputGroup';
import { Users, Plus, Calculator, RefreshCw, Calendar } from 'lucide-react';

const INITIAL_EMPLOYEE: EmployeeData = {
    id: '1',
    name: 'Personel 1',
    mikroTarget: 4000000,
    mikroCollection: 4200000,
    bireyselCollection: 100000,
    vekaletCollection: 0,
    greenMonths: 2
};

function App() {
    const [employees, setEmployees] = useState<EmployeeData[]>([INITIAL_EMPLOYEE]);
    const [totalKTVUCollection, setTotalKTVUCollection] = useState<number>(500000);
    // Initialize with current month in YYYY-MM format
    const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7));

    // --- Derived State (Business Logic Application) ---
    const calculatedData: CalculatedEmployee[] = useMemo(() => {
        // Adım 1: Herkesin MİKRO skorunu hesapla
        const step1 = employees.map(emp => {
            const stats = calculateMikro(emp.mikroTarget, emp.mikroCollection);
            return {
                ...emp,
                mikroStats: stats
            };
        });

        // Tüm personellerin toplam puanını bul
        const totalAllScores = step1.reduce((sum, emp) => sum + emp.mikroStats.realizationPercent, 0);

        // Adım 2, 3, 4: Havuz, Diğer Kalemler, Vintage
        return step1.map(emp => {
            const poolShare = calculatePoolShare(totalKTVUCollection, emp.mikroStats.realizationPercent, totalAllScores);
            const bireyselPrem = calculateStandardPremium(emp.bireyselCollection, 'bireysel');
            const vekaletPrem = calculateStandardPremium(emp.vekaletCollection, 'vekalet');
            
            const subTotal = emp.mikroStats.premium + poolShare + bireyselPrem + vekaletPrem;
            const vintage = calculateVintageBonus(subTotal, emp.greenMonths);
            
            return {
                ...emp,
                poolSharePremium: poolShare,
                bireyselPremium: bireyselPrem,
                vekaletPremium: vekaletPrem,
                subTotal: subTotal,
                vintageBonus: vintage,
                finalTotal: subTotal + vintage
            };
        });

    }, [employees, totalKTVUCollection]);

    // --- Handlers ---

    const addEmployee = () => {
        setEmployees(prev => [
            ...prev, 
            {
                id: uuidv4(),
                name: `Personel ${prev.length + 1}`,
                mikroTarget: 3000000,
                mikroCollection: 0,
                bireyselCollection: 0,
                vekaletCollection: 0,
                greenMonths: 0
            }
        ]);
    };

    const removeEmployee = (id: string) => {
        if (employees.length > 1) {
            setEmployees(prev => prev.filter(e => e.id !== id));
        }
    };

    const updateEmployee = (id: string, field: string, value: string | number) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                return { ...emp, [field]: value };
            }
            return emp;
        }));
    };

    const reset = () => {
        setEmployees([INITIAL_EMPLOYEE]);
        setTotalKTVUCollection(500000);
    };

    const totalPayout = calculatedData.reduce((sum, emp) => sum + emp.finalTotal, 0);
    const totalPoolAmount = totalKTVUCollection * 0.02;

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="bg-indigo-900 text-white shadow-xl pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                <Calculator className="w-8 h-8 text-indigo-200" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Prim Hesaplayıcı Pro</h1>
                                <p className="text-indigo-200 text-sm">Mikro, KTVÜ Havuz ve Vintage Sistemi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Month Selector */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-4 w-4 text-indigo-200" />
                                </div>
                                <input 
                                    type="month"
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="pl-10 pr-3 py-2 bg-indigo-800/50 border border-indigo-700 rounded-md text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                                />
                            </div>

                            <button 
                                onClick={reset}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition-colors backdrop-blur-sm border border-white/10"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Sıfırla
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
                
                {/* Global Settings Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                    
                    <div className="flex-1 w-full z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-gray-800">Ortak Havuz Ayarları (KTVÜ/MUVU)</h2>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">
                            Tüm personelin performansına göre dağıtılacak toplam havuz matrahı.
                        </p>
                        <InputGroup 
                            label="Toplam KTVÜ Tahsilatı" 
                            value={totalKTVUCollection} 
                            onChange={(v) => setTotalKTVUCollection(Number(v))} 
                            type="number"
                            prefix="₺"
                            className="max-w-md"
                        />
                    </div>
                    
                    <div className="bg-indigo-50 px-6 py-4 rounded-xl border border-indigo-100 flex flex-col items-end min-w-[200px]">
                        <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Dağıtılacak Havuz</span>
                        <span className="text-2xl font-bold text-indigo-900">{formatCurrency(totalPoolAmount)}</span>
                        <span className="text-xs text-indigo-400 mt-1">%2 KTVÜ Payı</span>
                    </div>
                </div>

                {/* Team Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-gray-500 text-xs font-bold uppercase">Toplam Personel</span>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{employees.length}</div>
                     </div>
                     <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-gray-500 text-xs font-bold uppercase">Toplam Dağıtılan Prim</span>
                        <div className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalPayout)}</div>
                     </div>
                     <div className="bg-indigo-600 p-5 rounded-xl shadow-lg border border-indigo-500 text-white flex items-center justify-between cursor-pointer hover:bg-indigo-700 transition-colors" onClick={addEmployee}>
                        <div>
                            <span className="text-indigo-200 text-xs font-bold uppercase">Ekip Yönetimi</span>
                            <div className="font-bold text-lg mt-1">Personel Ekle</div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-full">
                            <Plus className="w-6 h-6" />
                        </div>
                     </div>
                </div>

                {/* Employee List */}
                <div className="space-y-6">
                    {calculatedData.map((emp) => (
                        <EmployeeCard 
                            key={emp.id} 
                            data={emp} 
                            onUpdate={updateEmployee}
                            onRemove={removeEmployee}
                            isSingle={employees.length === 1}
                            period={period}
                        />
                    ))}
                </div>

            </main>
        </div>
    );
}

export default App;