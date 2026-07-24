import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, useSpring } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { getTheme, toggleTheme as storeToggleTheme, onThemeChange, type Theme } from '../stores/themeStore';
import { getLocale, toggleLocale, type Locale } from '../i18n/utils';

// --- Constants & Config ---
const BUTTON_SIZE = 40;
const OUTER_RADIUS = 160;
const MENU_RADIUS = 75;
const ITEM_SIZE = 40;
const FAN_ANGLE = 90;
const ITEM_SPACING = 35;
const toRad = (deg: number) => (deg * Math.PI) / 180;

const SideButton: React.FC = () => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof document !== 'undefined') return getTheme()
        return 'light'
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isMusicVisible, setIsMusicVisible] = useState(false);

    useEffect(() => {
        setThemeState(getTheme())
        return onThemeChange(setThemeState)
    }, []);

    const menuItems = [
        {
            id: 1,
            iconClass: 'fas fa-house',
            label: 'Home',
            onClick: () => { window.location.href = '/'; setIsOpen(false); }
        },
        {
            id: 2,
            iconClass: 'fas fa-music',
            label: 'Music',
            onClick: () => {
                setIsMusicVisible(prev => !prev);
                window.dispatchEvent(new CustomEvent('toggle-music'));
                setIsOpen(false);
            }
        },
        {
            id: 3,
            iconClass: theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon',
            label: 'Theme',
            onClick: storeToggleTheme
        },
        {
            id: 4,
            iconClass: 'fas fa-language',
            label: 'Language',
            onClick: () => {
                toggleLocale();
                window.location.reload();
                setIsOpen(false);
            }
        },
        {
            id: 5,
            iconClass: 'fas fa-user',
            label: 'Login',
            onClick: () => { window.location.href = '/login'; setIsOpen(false); }
        },
        { id: 6, iconClass: 'fas fa-bell', label: 'Notifications' },
        { id: 7, iconClass: 'fas fa-magnifying-glass', label: 'Search' },
        { id: 8, iconClass: 'fas fa-star', label: 'Favorites' },
        { id: 9, iconClass: 'fas fa-heart', label: 'Likes' },
    ];

    // Rotation Logic
    const rotation = useMotionValue(0);
    const rotationSpring = useSpring(rotation, { stiffness: 150, damping: 20 });

    const minRot = -FAN_ANGLE + 15;
    const maxRot = ((menuItems.length - 1) * ITEM_SPACING) - 15;

    const handlePan = (_: any, info: PanInfo) => {
        const sensitivity = 0.8;
        const delta = -info.delta.y + info.delta.x;
        const current = rotation.get();
        let next = current + delta * sensitivity;
        if (next < minRot) next = minRot - (minRot - next) * 0.2;
        if (next > maxRot) next = maxRot - (next - maxRot) * 0.2;
        rotation.set(next);
    };

    const handlePanEnd = () => {
        const current = rotation.get();
        if (current < minRot) rotation.set(minRot);
        else if (current > maxRot) rotation.set(maxRot);
    };

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const current = rotation.get();
        let newRot = current + (e.deltaY > 0 ? -20 : 20);
        if (newRot < minRot) newRot = minRot;
        if (newRot > maxRot) newRot = maxRot;
        if (isOpen) {
            animate(rotation, newRot, { type: "spring", stiffness: 200, damping: 20 });
        }
    }, [isOpen, rotation, minRot, maxRot]);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        return () => wrapper.removeEventListener('wheel', handleWheel);
    }, [isOpen, rotation, minRot, maxRot]);

    return (
        <div ref={wrapperRef} className="side-button-wrapper">
            <motion.div
                className="side-menu-container"
                initial={false}
                animate={isOpen ? "open" : "closed"}
                variants={{
                    open: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
                    closed: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
                }}
            >
                <motion.div
                    className="side-interaction-zone"
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                />
                {menuItems.map((item, index) => (
                    <MovingItem
                        key={item.id}
                        index={index}
                        rotation={rotationSpring}
                        iconClass={item.iconClass}
                        isOpen={isOpen}
                        onClick={item.onClick}
                        onPan={handlePan}
                        onPanEnd={handlePanEnd}
                    />
                ))}
            </motion.div>

            <motion.button
                className="side-trigger-button"
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) rotation.set(0);
                }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isOpen ? 135 : 0 }}
            >
                <i className="far fa-circle" style={{ fontSize: '1.25rem' }}></i>
            </motion.button>
        </div>
    );
};

const MovingItem = ({ index, rotation, iconClass, isOpen, onClick, onPan, onPanEnd }: { index: number, rotation: any, iconClass: string, isOpen: boolean, onClick?: () => void, onPan?: any, onPanEnd?: any }) => {
    const baseAngle = 270 - (index * ITEM_SPACING);

    const x = useTransform(rotation, (r: number) => {
        const theta = toRad(baseAngle + r);
        return (OUTER_RADIUS * 2) + (MENU_RADIUS * Math.cos(theta));
    });

    const y = useTransform(rotation, (r: number) => {
        const theta = toRad(baseAngle + r);
        return (OUTER_RADIUS * 2) + (MENU_RADIUS * Math.sin(theta));
    });

    const opacity = useTransform(rotation, (r: number) => {
        if (!isOpen) return 0;
        const angle = baseAngle + r;
        if (angle > 285) return Math.max(0, 1 - (angle - 285) / 20);
        if (angle < 165) return Math.max(0, 1 - (165 - angle) / 20);
        if (angle > 275) return 1 - (angle - 275) / 10;
        if (angle < 175) return 1 - (175 - angle) / 10;
        return 1;
    });

    const scale = useTransform(rotation, (r: number) => {
        const angle = baseAngle + r;
        if (angle > 275) return Math.max(0.6, 1 - (angle - 275) / 30);
        if (angle < 175) return Math.max(0.6, 1 - (175 - angle) / 30);
        return 1;
    });

    return (
        <motion.button
            className="side-menu-item"
            style={{
                left: 0, top: 0,
                x: useTransform(x, (val) => val - ITEM_SIZE / 2),
                y: useTransform(y, (val) => val - ITEM_SIZE / 2),
                opacity,
                scale
            }}
            onClick={onClick}
            onPan={onPan}
            onPanEnd={onPanEnd}
        >
            <i className={iconClass} style={{ fontSize: '1.25rem' }}></i>
        </motion.button>
    );
};

export default SideButton;
