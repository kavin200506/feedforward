import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50],
  showItemsPerPage = true,
  showPageNumbers = true,
  maxPageNumbers = 5,
}) => {
  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxPageNumbers / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);

    if (end - start < maxPageNumbers - 1) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      {/* Items per page selector */}
      {showItemsPerPage && totalItems > 0 && (
        <div className="pagination-items-per-page">
          <label htmlFor="items-per-page">Items per page:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="items-per-page-select"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Page info */}
      {totalItems > 0 && (
        <div className="pagination-info">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          {/* Previous button */}
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <FiChevronLeft />
            <span className="pagination-button-text">Previous</span>
          </button>

          {/* Page numbers */}
          {showPageNumbers && (
            <div className="pagination-numbers">
              {/* First page */}
              {getPageNumbers()[0] > 1 && (
                <>
                  <button
                    className="pagination-number"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                  {getPageNumbers()[0] > 2 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                </>
              )}

              {/* Page number buttons */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  className={`pagination-number ${
                    page === currentPage ? 'active' : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}

              {/* Last page */}
              {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                <>
                  {getPageNumbers()[getPageNumbers().length - 1] <
                    totalPages - 1 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                  <button
                    className="pagination-number"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Next button */}
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <span className="pagination-button-text">Next</span>
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;



