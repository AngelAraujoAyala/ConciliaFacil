import React, { useRef } from 'react';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Raw motion values for mouse position (0 to 1)
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    // Spring physics for smooth return-to-flat animation
    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Map mouse position to rotation degrees
    const rotateY = useTransform(springX, [0, 1], [-10, 10]);
    const rotateX = useTransform(springY, [0, 1], [8, -8]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        // Snap back to center flat position
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: 800,
            }}
            className={`group bg-white/5 border border-white/10 rounded-2xl p-8 
                hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 
                transition-colors duration-300 backdrop-blur-sm cursor-default ${className}`}
        >
            {/* Inner content lifted in Z for depth effect */}
            <div style={{ transform: 'translateZ(20px)' }}>
                {children}
            </div>
        </motion.div>
    );
};
