import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import styled from "styled-components";
import {
  Settings,
  ArrowUp,
  MessageSquare,
  Sparkles,
  Info,
  LucideIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../../i18n/useLocale";
import { useCardStyle } from "../../stores/themeStore";

interface SideButtonProps {
  onAiChatClick?: () => void;
}

interface MenuItemConfig {
  id: string;
  icon: LucideIcon;
  labelZh: string;
  labelEn: string;
  onClick: () => void;
}

const SideButton: React.FC<SideButtonProps> = ({ onAiChatClick }) => {
  const { cardStyle } = useCardStyle();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useLocale();

  const isHome = location.pathname === "/";
  const radius = 95;

  const menuItems: MenuItemConfig[] = [
    {
      id: "top",
      icon: ArrowUp,
      labelZh: "返回顶部",
      labelEn: "Scroll to Top",
      onClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsOpen(false);
      },
    },
    {
      id: "moment",
      icon: MessageSquare,
      labelZh: "查看动态",
      labelEn: "View Moments",
      onClick: () => {
        navigate("/moment");
        setIsOpen(false);
      },
    },
    {
      id: "ai",
      icon: Sparkles,
      labelZh: "AI 助手",
      labelEn: "AI Assistant",
      onClick: () => {
        if (onAiChatClick) onAiChatClick();
        else navigate("/search");
        setIsOpen(false);
      },
    },
    {
      id: "about",
      icon: Info,
      labelZh: "关于本站",
      labelEn: "About Site",
      onClick: () => {
        navigate("/about");
        setIsOpen(false);
      },
    },
  ];

  const total = menuItems.length;
  const itemSpread = 26;
  const initialRot = 0;
  const minRot = -((total - 1) * itemSpread);
  const maxRot = 0;

  const rotation = useMotionValue(0);

  const handlePan = (_: any, info: PanInfo) => {
    const delta = -info.delta.y * 0.4;
    rotation.set(rotation.get() + delta);
  };

  const handlePanEnd = () => {
    const current = rotation.get();
    if (current < minRot) rotation.set(minRot);
    if (current > maxRot) rotation.set(maxRot);
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const current = rotation.get();
      let newRot = current + e.deltaY * 0.5;
      if (newRot < minRot) newRot = minRot;
      if (newRot > maxRot) newRot = maxRot;
      animate(rotation, newRot, { type: "spring", stiffness: 400, damping: 30 });
    },
    [isOpen, rotation, minRot, maxRot],
  );

  const wrapperRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !isOpen) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isOpen, rotation, minRot, maxRot]);

  return (
    <SideButtonRoot ref={wrapperRef} className="side-button-root" $isHome={isHome}>
      {isOpen && (
        <div
          className="side-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="side-menu-container">
        {menuItems.map((item, index) => {
          const itemBaseAngle = 90 + index * itemSpread;
          return (
            <MovingItem
              key={item.id}
              item={item}
              isOpen={isOpen}
              radius={radius}
              baseAngle={itemBaseAngle}
              rotation={rotation}
              locale={locale}
              onPan={handlePan}
              onPanEnd={handlePanEnd}
              onClick={item.onClick}
            />
          );
        })}
      </div>

      <motion.button
        type="button"
        className="side-trigger-btn"
        onClick={() => {
          if (!isOpen) rotation.set(initialRot);
          setIsOpen(!isOpen);
        }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 135 : 0 }}
        data-button={cardStyle}
        data-shape="circle"
        aria-label="Toggle Side Menu"
      >
        <Settings size={20} />
      </motion.button>
    </SideButtonRoot>
  );
};

export default SideButton;

interface MovingItemProps {
  item: MenuItemConfig;
  isOpen: boolean;
  radius: number;
  baseAngle: number;
  rotation: any;
  locale: string;
  onPan: (_: any, info: PanInfo) => void;
  onPanEnd: () => void;
  onClick: () => void;
}

const MovingItem: React.FC<MovingItemProps> = ({
  item,
  isOpen,
  radius,
  baseAngle,
  rotation,
  locale,
  onPan,
  onPanEnd,
  onClick,
}) => {
  const { cardStyle } = useCardStyle();
  const Icon = item.icon;
  const currentAngle = useTransform(rotation, (r: number) => baseAngle + r);

  const x = useTransform(currentAngle, (a: number) => {
    const rad = (a * Math.PI) / 180;
    return Math.cos(rad) * radius;
  });

  const y = useTransform(currentAngle, (a: number) => {
    const rad = (a * Math.PI) / 180;
    return -Math.sin(rad) * radius;
  });

  const label = locale === "zh-CN" ? item.labelZh : item.labelEn;

  return (
    <motion.button
      type="button"
      className="side-menu-item"
      title={label}
      aria-label={label}
      style={{
        x: isOpen ? x : 0,
        y: isOpen ? y : 0,
      }}
      initial={false}
      animate={{
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 1 : 0.4,
        pointerEvents: isOpen ? "auto" : "none",
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onPan={onPan}
      onPanEnd={onPanEnd}
      data-button={cardStyle}
      data-shape="circle"
    >
      <Icon size={20} />
    </motion.button>
  );
};

// Scoped Styled Root
const SideButtonRoot = styled.aside<{ $isHome: boolean }>`
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 998;
  user-select: none;

  @media (max-width: 48rem) {
    bottom: 20px;
    right: 20px;
  }

  .side-menu-container {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .side-trigger-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-1);
    z-index: 1002;
    outline: none;

    &:hover {
      color: var(--main-color);
    }

    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: 3px;
    }
  }

  .side-menu-item {
    position: absolute;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-1);
    padding: 0;
    pointer-events: auto;
    touch-action: none;

    &:hover {
      color: var(--main-color);
    }

    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: 3px;
    }
  }

  .side-backdrop {
    position: fixed;
    inset: 0;
    z-index: 990;
    background: transparent;
  }
`;
