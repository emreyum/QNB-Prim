import React from 'react';
import { CalculatedEmployee } from '../types';
import { InputGroup } from './InputGroup';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { generateEmployeePDF } from '../utils/pdfGenerator';
import { Trash2, TrendingUp, Award, Briefcase, User, FileDown, Calendar } from 'lucide-react';

interface EmployeeCardProps {
    data: CalculatedEmployee;
    onUpdate: (id: string, field: string, value: string | number) => void;
    onRemove: (id: string) => void;
    isSingle: boolean;
    period: string;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ data, onUpdate, onRemove, isSingle, period }) => {
    
    const handleChange = (field: string, value: string) => {
        const numValue = value === '' ? 0 : parseFloat(value);
        onUpdate(data.id, field, isNaN(numValue) ? 0 : numValue);
    };

    const handleNameChange = (val: string) => {
        onUpdate(data.id, 'name', val);
    };
    
    // Format period for display (e.g., "2023-10" -> "Ekim 2023")
    const periodDisplay = new Date(period + "-01").toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <input 
                        type="text" 
                        value={data.name} 
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="bg-transparent font-bold text-gray-800 text-lg border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors w-40 sm:w-auto"
                        placeholder="Personel Adı"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => generateEmployeePDF(data, period)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                        title="PDF Olarak İndir"
                    >
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">PDF İndir</span>
                    </button>
                    {!isSingle && (
                        <button 
                            onClick={() => onRemove(data.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5"
                            title="Personeli Sil"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Sol Taraf - Veri Girişi */}
                <div className="space-y-6">
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <h4 className="text-sm font-bold text-blue-800 uppercase">Mikro Hedefleri</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup 
                                label="Hedef (TL)" 
                                value={data.mikroTarget || ''} 
                                onChange={(v) => handleChange('mikroTarget', v)} 
                                type="number"
                                prefix="₺"
                            />
                            <InputGroup 
                                label="Tahsilat (TL)" 
                                value={data.mikroCollection || ''} 
                                onChange={(v) => handleChange('mikroCollection', v)} 
                                type="number"
                                prefix="₺"
                            />
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-blue-200">
                             <span className="text-blue-600 font-medium">Gerçekleşme:</span>
                             <span className={`font-bold ${data.mikroStats.realizationPercent >= 100 ? 'text-green-600' : 'text-orange-500'}`}>
                                 {formatNumber(data.mikroStats.realizationPercent)}%
                             </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                         <div className="flex items-center space-x-2 mb-2">
                            <Briefcase className="w-4 h-4 text-gray-600" />
                            <h4 className="text-sm font-bold text-gray-700 uppercase">Diğer Tahsilatlar</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup 
                                label="Bireysel (TL)" 
                                value={data.bireyselCollection || ''} 
                                onChange={(v) => handleChange('bireyselCollection', v)} 
                                type="number"
                                prefix="₺"
                            />
                            <InputGroup 
                                label="Dava/Vekalet (TL)" 
                                value={data.vekaletCollection || ''} 
                                onChange={(v) => handleChange('vekaletCollection', v)} 
                                type="number"
                                prefix="₺"
                            />
                        </div>
                    </div>

                    <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center space-x-2 mb-4">
                            <Award className="w-4 h-4 text-green-600" />
                            <h4 className="text-sm font-bold text-green-800 uppercase">Vintage Durumu</h4>
                        </div>
                         <InputGroup 
                                label="Yeşil Ay Sayısı" 
                                value={data.greenMonths || ''} 
                                onChange={(v) => handleChange('greenMonths', v)} 
                                type="number"
                                step={1}
                                className="w-full"
                        />
                    </div>
                </div>

                {/* Sağ Taraf - Hesaplama Sonuçları */}
                <div className="bg-slate-800 text-white rounded-xl p-6 flex flex-col justify-between shadow-inner relative overflow-hidden">
                    
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <CalculatorIcon className="w-32 h-32" />
                    </div>

                    <div>
                        <div className="flex justify-between items-start border-b border-slate-700 pb-4 mb-4">
                            <div>
                                <h4 className="text-slate-200 text-sm font-bold uppercase tracking-wider">
                                    Prim Tablosu
                                </h4>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    <User className="w-3 h-3" /> {data.name}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border border-slate-600 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {periodDisplay}
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {/* 1. Mikro Tahsilat */}
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Mikro Tahsilat</span>
                                <span className="font-medium text-slate-200">{formatCurrency(data.mikroCollection)}</span>
                            </div>

                            {/* 2. Gerçekleşme */}
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Gerçekleşme</span>
                                <span className={`font-bold ${data.mikroStats.realizationPercent >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                                    %{formatNumber(data.mikroStats.realizationPercent)}
                                </span>
                            </div>

                            {/* 3. Mikro Tahsilat Primi */}
                            <div className="flex justify-between items-center bg-slate-700/30 p-2 -mx-2 rounded hover:bg-slate-700/50 transition-colors">
                                <span className="text-slate-300 text-sm font-medium">Mikro Tahsilat Primi</span>
                                <span className="font-bold text-white">{formatCurrency(data.mikroStats.premium)}</span>
                            </div>

                            {/* 4. Bireysel Tahsilat */}
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Bireysel Tahsilat</span>
                                <span className="font-medium text-slate-200">{formatCurrency(data.bireyselPremium)}</span>
                            </div>

                            {/* 5. Dava Vekalet */}
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Dava Vekalet</span>
                                <span className="font-medium text-slate-200">{formatCurrency(data.vekaletPremium)}</span>
                            </div>

                             {/* 6. KTVU / MUVU */}
                             <div className="flex justify-between items-center group">
                                <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">KTVÜ / MUVU</span>
                                <span className="font-medium text-emerald-400">{formatCurrency(data.poolSharePremium)}</span>
                            </div>

                            {/* 7. Vintage Bonusu */}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-700 border-dashed">
                                <span className="text-yellow-500/90 text-sm flex items-center gap-1">
                                    <Award className="w-3 h-3" /> Vintage Bonusu (+1 Ay)
                                </span>
                                <span className="font-medium text-yellow-400">+{formatCurrency(data.vintageBonus)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-slate-600">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-400 font-medium text-sm mb-1">TOPLAM HAKEDİŞ</span>
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {formatCurrency(data.finalTotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Icon for background decoration
const CalculatorIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 01.878.645 49.17 49.17 0 01.376 5.452.657.657 0 01-.66.664c-.353 0-.705.016-1.054.046l-1.218.104a6.602 6.602 0 01-1.77.126l-1.25-.095c-.378-.029-.757-.052-1.139-.068a.334.334 0 00-.285.457c.216.592.368 1.209.453 1.839.043.32-.196.61-.518.61h-1.55c-.322 0-.56-.289-.518-.61a9.92 9.92 0 00.453-1.838.334.334 0 00-.285-.458 19.336 19.336 0 01-1.138.068l-1.25.095a6.597 6.597 0 01-1.77-.125l-1.217-.104a.657.657 0 01-.66-.664c.05-1.815.178-3.635.376-5.452a.75.75 0 01.878-.645c1.842.334 3.722.562 5.632.676.332.02.61-.246.61-.578zM19.5 21a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-3a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h3zM13.5 21a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-3a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h3zM7.5 21a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-3a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h3zM19.5 13.5a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-3a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h3zM13.5 13.5a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-3a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h3zM7.5 13.5a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-3a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h3z" />
    </svg>
);