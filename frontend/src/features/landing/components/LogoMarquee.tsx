import React from 'react';
import { motion } from 'framer-motion';

const BANKS = [
    { name: 'BBVA', color: '#5C4ABE' },
    { name: 'Santander', color: '#EC0000' },
    { name: 'Banorte', color: '#D4001A' },
    { name: 'Scotiabank', color: '#EC111A' },
    { name: 'HSBC', color: '#DB0011' },
    { name: 'Banamex', color: '#00539F' },
    { name: 'Stripe', color: '#6772E5' },
    { name: 'Mercado Pago', color: '#009EE3' },
    { name: 'BAC', color: '#1E3A8A' },
    { name: 'Inbursa', color: '#0066CC' },
    { name: 'Afirme', color: '#FF6B00' },
    { name: 'Banbajío', color: '#005B9A' },
];

// Duplicate for seamless infinite loop
const ITEMS = [...BANKS, ...BANKS];

export const LogoMarquee: React.FC = () => {
    return (
        <div className="relative w-full overflow-hidden py-10 border-y border-white/5 bg-slate-950">
            {/* Left fade mask */}
            <div className="absolute left-0 top-0 h-full w-24 bg-linear-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            {/* Right fade mask */}
            <div className="absolute right-0 top-0 h-full w-24 bg-linear-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

            {/* Section label */}
            <p className="text-center text-xs font-medium text-slate-600 uppercase tracking-widest mb-6">
                Compatible con los principales bancos y plataformas
            </p>

            {/* Marquee track */}
            <div className="flex">
                <motion.div
                    className="flex items-center gap-10 shrink-0"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                        repeat: Infinity,
                        duration: 28,
                        ease: 'linear',
                    }}
                >
                    {ITEMS.map((bank, index) => (
                        <div
                            key={`${bank.name}-${index}`}
                            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-white/20 transition-colors shrink-0 select-none"
                        >
                            {/* Color dot accent */}
                            <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: bank.color, boxShadow: `0 0 8px ${bank.color}66` }}
                            />
                            <span className="text-sm font-semibold text-slate-300 whitespace-nowrap">
                                {bank.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};
