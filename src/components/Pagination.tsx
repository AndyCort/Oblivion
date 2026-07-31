import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '../i18n/useLocale';

export function getPaginationNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const { t } = useLocale();
  if (totalPages <= 1) return null;

  return (
    <PaginationContainer>
      <PaginationBtn disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft size={16} />
        <span>{t('articles.prev')}</span>
      </PaginationBtn>

      <PaginationNumbers>
        {getPaginationNumbers(currentPage, totalPages).map((p, i) => (
          <PaginationNum
            key={`${p}-${i}`}
            $isActive={p === currentPage}
            $isEllipsis={p === '...'}
            disabled={p === '...'}
            onClick={() => p !== '...' && onPageChange(p as number)}
          >
            {p}
          </PaginationNum>
        ))}
      </PaginationNumbers>

      <PaginationBtn disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <span>{t('articles.next')}</span>
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
  @media (max-width: 768px) { flex-wrap: wrap; gap: 10px; margin-top: 32px; }
`;

const PaginationBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: var(--border);
  border-radius: 12px;
  background: var(--bg-1);
  color: var(--text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover:not(:disabled) { background: var(--main-color); color: #fff; border-color: var(--main-color); transform: translateY(-2px); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  @media (max-width: 768px) { padding: 8px 12px; font-size: 0.8rem; span { display: none; } }
`;

const PaginationNumbers = styled.div`
  display: flex;
  gap: 8px;
  @media (max-width: 768px) { order: -1; width: 100%; justify-content: center; gap: 6px; }
`;

const PaginationNum = styled.button<{ $isActive?: boolean; $isEllipsis?: boolean }>`
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border: var(--border);
  border-radius: 12px; background: var(--bg-1);
  color: var(--text-1); font-size: 0.9rem; cursor: pointer; transition: all 0.3s ease;
  ${props => props.$isEllipsis && `cursor: default; background: transparent; border: none;`}
  ${props => !props.$isEllipsis && `&:hover:not(:disabled):not(.active) { background: var(--main-color); color: #fff; border-color: var(--main-color); }`}
  ${props => props.$isActive && `background: var(--main-color); color: #fff; border-color: var(--main-color); font-weight: 600; box-shadow: 0 4px 14px color-mix(in srgb, var(--main-color) 35%, transparent);`}
  @media (max-width: 768px) { width: 32px; height: 32px; font-size: 0.8rem; }
`;
