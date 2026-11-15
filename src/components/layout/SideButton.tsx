import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
  type MotionValue,
} from "framer-motion";
import styled from "styled-components";
import { Settings, CircleHelp, icons, type LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../../i18n/useLocale";
import { useCardStyle } from "../../stores/themeStore";
import { siteConfig, type SideMenuItemConfig } from "../../config/site";

function resolveLucideIcon(name: string): LucideIcon {
  const trimmed = name.trim();
  if (trimmed in icons) {
    return icons[trimmed as keyof typeof icons];
  }
  const pascal = trimmed
    .replace(/[-_\s]+(.)?/g, (_, ch: string | undefined) =>
      ch ? ch.toUpperCase() : "",
    )
    .replace(/^(.)/, (ch) => ch.toUpperCase());
  if (pascal in icons) {
    return icons[pascal as keyof typeof icons];
  }
  return CircleHelp;
}

function getArcVisibility(angle: number): number {
  if (angle >= 86 && angle <= 206) return 1;
  if (angle > 64 && angle < 86) return (angle - 64) / (86 - 64);
  if (angle > 206 && angle < 228) return (228 - angle) / (228 - 206);
  return 0;
}

interface SideButtonProps {
  onAiChatClick?: () => void;
}

interface MenuItem extends SideMenuItemConfig {
  onClick: () => void;
}

const SideButton: React.FC<SideButtonProps> = ({ onAiChatClick }) => {
  const { cardStyle } = useCardStyle();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useLocale();

  const isHome = location.pathname === "/";
  const radius = 105;
  const isDraggingRef = useRef(false);

  const handleItemClick = (item: SideMenuItemConfig) => {
    if (isDraggingRef.current) return;
    if (item.onClick) {
      item.onClick();
    } else if (item.action === "scrollToTop") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.action === "aiChat") {
      if (onAiChatClick) onAiChatClick();
      else if (item.href) navigate(item.href);
    } else if (item.href) {
      if (/^https?:\/\//i.test(item.href)) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        navigate(item.href);
      }
    }
    setIsOpen(false);
  };

  const menuItems: MenuItem[] = siteConfig.sideMenu.map((item) => ({
    ...item,
    onClick: () => handleItemClick(item),
  }));

  const total = menuItems.length;
  const itemSpread = 28;
  const visibleSlots = 4;
  const initialRot = 0;
  const canScroll = total > visibleSlots + 1;
  const totalSpan = total * itemSpread;

  const rotation = useMotionValue(0);
  const openProgress = useMotionValue(0);

  useEffect(() => {
    const controls = animate(openProgress, isOpen ? 1 : 0, {
      type: "spring",
      stiffness: 350,
      damping: 25,
    });
    return () => controls.stop();
  }, [isOpen, openProgress]);

  const handlePan = (_: any, info: PanInfo) => {
    if (!canScroll) return;
    if (Math.hypot(info.offset.x, info.offset.y) > 4) {
      isDraggingRef.current = true;
    }
    const delta = (info.delta.y - info.delta.x) * 0.45;
    rotation.set(rotation.get() + delta);
  };

  const handlePanEnd = () => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!canScroll) return;
      e.preventDefault();
      const delta = -(e.deltaY - e.deltaX) * 0.45;
      rotation.set(rotation.get() + delta);
    },
    [canScroll, rotation],
  );

  const wrapperRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !isOpen) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isOpen, handleWheel]);

  return (
    <SideButtonRoot
      ref={wrapperRef}
      className="side-button-root"
      $isHome={isHome}
    >
      {isOpen && (
        <motion.div
          className="side-backdrop"
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          onClick={() => {
            if (!isDraggingRef.current) setIsOpen(false);
          }}
        />
      )}

      <div className="side-menu-container">
        {menuItems.map((item, index) => {
          const itemBaseAngle = 90 + index * itemSpread;
          return (
            <MovingItem
              key={`${item.id}-${index}`}
              item={item}
              radius={radius}
              baseAngle={itemBaseAngle}
              rotation={rotation}
              openProgress={openProgress}
              canScroll={canScroll}
              totalSpan={totalSpan}
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
  item: MenuItem;
  radius: number;
  baseAngle: number;
  rotation: MotionValue<number>;
  openProgress: MotionValue<number>;
  canScroll: boolean;
  totalSpan: number;
  locale: string;
  onPan: (_: any, info: PanInfo) => void;
  onPanEnd: () => void;
  onClick: () => void;
}

const MovingItem: React.FC<MovingItemProps> = ({
  item,
  radius,
  baseAngle,
  rotation,
  openProgress,
  canScroll,
  totalSpan,
  locale,
  onPan,
  onPanEnd,
  onClick,
}) => {
  const { cardStyle } = useCardStyle();
  const Icon = resolveLucideIcon(item.icon);
  const currentAngle = useTransform(rotation, (r: number) => {
    const raw = baseAngle + r;
    if (!canScroll) return raw;
    const offset = (((raw - 62) % totalSpan) + totalSpan) % totalSpan;
    return 62 + offset;
  });

  const x = useTransform([currentAngle, openProgress], ([a, p]: number[]) => {
    const rad = (a * Math.PI) / 180;
    return Math.cos(rad) * radius * p;
  });

  const y = useTransform([currentAngle, openProgress], ([a, p]: number[]) => {
    const rad = (a * Math.PI) / 180;
    return -Math.sin(rad) * radius * p;
  });

  const opacity = useTransform(
    [currentAngle, openProgress],
    ([a, p]: number[]) => getArcVisibility(a) * p,
  );

  const pointerEvents = useTransform(
    [currentAngle, openProgress],
    ([a, p]: number[]) => (p > 0.3 && getArcVisibility(a) > 0.3 ? "auto" : "none"),
  );

  const label =
    (locale === "zh-CN" ? item.labelZh : item.labelEn) ||
    item.labelEn ||
    item.labelZh;

  return (
    <motion.button
      type="button"
      className="side-menu-item"
      title={label}
      aria-label={label}
      style={{
        x,
        y,
        opacity,
        pointerEvents,
      }}
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
  --side-gap: 40px;
  bottom: calc(var(--safe-bottom) + var(--side-gap));
  right: calc(var(--safe-right) + var(--side-gap));
  z-index: 998;
  user-select: none;

  @media (max-width: 48rem) {
    --side-gap: 20px;
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
    z-index: 1001;
  }

  .side-trigger-btn {
    position: relative;
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
    touch-action: none;
  }
`;
