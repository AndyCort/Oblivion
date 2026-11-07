import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "../../i18n/useLocale";
import { useCardStyle } from "../../stores/themeStore";

export function getPaginationNumbers(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const { cardStyle } = useCardStyle();
  const { t } = useLocale();
  if (totalPages <= 1) return null;

  return (
    <PaginationRoot className="pagination-root" aria-label="Pagination">
      <button
        type="button"
        className="pagination-btn"
        data-button={cardStyle}
        disabled={currentPage === 1}
        aria-label={t("articles.prev")}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </button>

      <div className="pagination-numbers">
        {getPaginationNumbers(currentPage, totalPages).map((p, i) => (
          <button
            key={`${p}-${i}`}
            type="button"
            className="pagination-num"
            data-button={p !== "..." ? cardStyle : undefined}
            data-shape={p !== "..." ? "circle" : undefined}
            data-active={p === currentPage ? "true" : undefined}
            data-ellipsis={p === "..." ? "true" : undefined}
            disabled={p === "..."}
            onClick={() => p !== "..." && onPageChange(p as number)}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="pagination-btn"
        data-button={cardStyle}
        disabled={currentPage === totalPages}
        aria-label={t("articles.next")}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </PaginationRoot>
  );
}

// Scoped Styled Root
const PaginationRoot = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 48px;

  @media (max-width: 48rem) {
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 32px;
  }

  .pagination-btn {
    &:hover:not(:disabled) {
      color: var(--main-color);
      border-color: var(--main-color);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: scale(0.96);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: 3px;
    }

    @media (max-width: 48rem) {
      padding: 8px 12px;
      font-size: var(--text-meta);
      span {
        display: none;
      }
    }
  }

  .pagination-numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    @media (max-width: 48rem) {
      order: -1;
      width: 100%;
      justify-content: center;
      gap: 6px;
    }
  }

  .pagination-num {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-meta);
    padding: 0;
    box-sizing: border-box;

    &[data-ellipsis="true"] {
      cursor: default;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
    }

    &[data-active="true"] {
      color: var(--main-color) !important;
      border-color: var(--main-color) !important;
    }

    &:hover:not(:disabled):not([data-active="true"]):not([data-ellipsis="true"]) {
      color: var(--main-color);
      border-color: var(--main-color);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: scale(0.94);
    }

    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: 3px;
    }

    @media (max-width: 48rem) {
      width: 36px;
      height: 36px;
      font-size: var(--text-meta);
    }
  }
`;
