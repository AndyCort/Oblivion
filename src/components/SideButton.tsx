import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, useSpring } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toggleLocale } from '../i18n/utils';
import { Home, Music, Languages, User, Bell, Search, Star, Heart, Settings } from 'lucide-react';
import { musicStore } from '../stores/musicStore';
import styled from 'styled-components';

// --- Constants & Config ---
const OUTER_RADIUS = 160;
const MENU_RADIUS = 75;
const ITEM_SIZE = 40;
const FAN_ANGLE = 90;
const ITEM_SPACING = 35;
const toRad = (deg: number) => (deg * Math.PI) / 180;

const SideButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        {
            id: 1,
            icon: Home,
            label: 'Home',
            onClick: () => { navigate('/'); setIsOpen(false); }
        },
        {
            id: 2,
            icon: Music,
            label: 'Music',
            onClick: () => {
                musicStore.togglePlay();
                setIsOpen(false);
            }
        },
        {
            id: 4,
            icon: Languages,
            label: 'Language',
            onClick: () => {
                toggleLocale();
                setIsOpen(false);
            }
        },
        {
            id: 5,
            icon: User,
            label: 'Login',
            onClick: () => { navigate('/login'); setIsOpen(false); }
        },
        { id: 6, icon: Bell, label: 'Notifications' },
        { id: 7, icon: Search, label: 'Search' },
        { id: 8, icon: Star, label: 'Favorites' },
        { id: 9, icon: Heart, label: 'Likes' },
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
        <SideButtonWrapper ref={wrapperRef}>
            <SideMenuContainer
                initial={false}
                animate={isOpen ? "open" : "closed"}
                variants={{
                    open: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
                    closed: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
                }}
            >
                <SideInteractionZone
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                />
                {menuItems.map((item, index) => (
                    <MovingItem
                        key={item.id}
                        index={index}
                        rotation={rotationSpring}
                        icon={item.icon}
                        isOpen={isOpen}
                        onClick={item.onClick}
                        onPan={handlePan}
                        onPanEnd={handlePanEnd}
                    />
                ))}
            </SideMenuContainer>

            <SideTriggerButton
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) rotation.set(0);
                }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isOpen ? 135 : 0 }}
                data-card="glass"
            >
                <Settings size={20} />
            </SideTriggerButton>
        </SideButtonWrapper>
    );
};

const MovingItem = ({ index, rotation, icon: Icon, isOpen, onClick, onPan, onPanEnd }: { index: number, rotation: any, icon: React.ElementType, isOpen: boolean, onClick?: () => void, onPan?: any, onPanEnd?: any }) => {
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
        <SideMenuItem
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
            <Icon size={20} />
        </SideMenuItem>
    );
};

export default SideButton;

const SideButtonWrapper = styled.div`
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SideMenuContainer = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 320px;
  height: 320px;
  transform-origin: 100% 100%;
  pointer-events: none;
`;

const SideInteractionZone = styled(motion.div)`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 160px;
  height: 160px;
  border-radius: 100% 0 0 0;
  cursor: grab;
  pointer-events: auto;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

const SideMenuItem = styled(motion.button)`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-1);
  border: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-1);
  cursor: pointer;
  padding: 0;
  pointer-events: auto;
  touch-action: none;
`;

const SideTriggerButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50% !important;
  background: var(--bg-1);
  border: var(--border);
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-1);
  z-index: 1002;
  cursor: pointer;
  outline: none;

  &:hover {
    background: var(--main-color);
  }
`;
