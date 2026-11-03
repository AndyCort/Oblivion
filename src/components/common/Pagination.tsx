import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "../../i18n/useLocale";

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
  const { t } = useLocale();
  if (totalPages <= 1) return null;

  return (
    <PaginationContainer>
      <PaginationBtn
        data-card
        data-button
        disabled={currentPage === 1}
        aria-label={t("articles.prev")}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </PaginationBtn>

      <PaginationNumbers>
        {getPaginationNumbers(currentPage, totalPages).map((p, i) => (
          <PaginationNum
            key={`${p}-${i}`}
            data-card={p !== "..."}
            data-button={p !== "..."}
            $isActive={p === currentPage}
            $isEllipsis={p === "..."}
            disabled={p === "..."}
            onClick={() => p !== "..." && onPageChange(p as number)}
          >
            {p}
          </PaginationNum>
        ))}
      </PaginationNumbers>

      <PaginationBtn
        data-card
        data-button
        disabled={currentPage === totalPages}
        aria-label={t("articles.next")}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </PaginationBtn>
    </PaginationContainer>
  );
}

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 32px;
  }
`;

const PaginationBtn = styled.button`
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

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8rem;
    span {
      display: none;
    }
  }
`;

const PaginationNumbers = styled.div`
  display: flex;
  gap: 8px;
  @media (max-width: 768px) {
    order: -1;
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
`;

const PaginationNum = styled.button<{
  $isActive?: boolean;
  $isEllipsis?: boolean;
}>`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--border);
  border-radius: 50% !important;
  background: var(--bg-3);
  box-shadow: var(--box-shadow);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-1);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  box-sizing: border-box;
  transition: all 0.25s ease;

  ${(props) =>
    props.$isEllipsis &&
    `cursor: default; background: transparent !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important;`}

  ${(props) =>
    !props.$isEllipsis &&
    `
    &:hover:not(:disabled):not(.active) {
      color: var(--main-color);
      border-color: var(--main-color);
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: scale(0.94);
    }
  `}

  ${(props) =>
    props.$isActive &&
    `
    background: var(--main-color) !important;
    color: var(--on-main) !important;
    border-color: var(--main-color) !important;
    font-weight: 700;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--main-color) 35%, transparent) !important;
  `}

  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 3px;
  }

  @media (max-width: 768px) {
    width: 34px;
    height: 34px;
    font-size: 0.8rem;
  }
`;
