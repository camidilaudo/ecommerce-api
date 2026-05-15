import React from 'react';
import './SkeletonCard.css';

/**
 * Componente Skeleton que simula una tarjeta de producto mientras cargan los datos.
 */
const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image shimmer"></div>
            <div className="skeleton-text shimmer"></div>
            <div className="skeleton-text short shimmer"></div>
            <div className="skeleton-footer shimmer"></div>
        </div>
    );
};

export default SkeletonCard;