import React, { ComponentType, useState } from 'react';
interface WithPaginationProps { initialPage?: number; pageSize?: number; }
interface PaginationState { page: number; pageSize: number; setPage: (p: number) => void; nextPage: () => void; prevPage: () => void; }
export function withPagination<P extends object>(Component: ComponentType<P & PaginationState>) {
  return function WithPaginationComponent({ initialPage = 1, pageSize = 10, ...props }: P & WithPaginationProps) {
    const [page, setPage] = useState(initialPage);
    const nextPage = () => setPage(p => p + 1);
    const prevPage = () => setPage(p => Math.max(1, p - 1));
    return <Component {...(props as P)} page={page} pageSize={pageSize} setPage={setPage} nextPage={nextPage} prevPage={prevPage} />;
  };
}
