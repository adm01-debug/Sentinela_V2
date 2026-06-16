import React from "react";
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
}
export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
}
export interface DataKanbanProps {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCard) => void;
  className?: string;
}
export const DataKanban: React.FC<DataKanbanProps> = ({ columns, onCardClick, className }) => (
  <div className={className} style={{ display: "flex", gap: 16, overflowX: "auto", padding: 16 }}>
    {columns.map((col) => (
      <div
        key={col.id}
        style={{ minWidth: 280, backgroundColor: "#f4f5f7", borderRadius: 8, padding: 12 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: col.color || "#1890ff",
            }}
          />
          <h4 style={{ margin: 0, fontSize: 14 }}>{col.title}</h4>
          <span style={{ fontSize: 12, color: "#999" }}>({col.cards.length})</span>
        </div>
        {col.cards.map((card) => (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            onClick={() => onCardClick?.(card)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCardClick?.(card);
              }
            }}
            style={{
              padding: 12,
              backgroundColor: "#fff",
              borderRadius: 6,
              marginBottom: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            <h5 style={{ margin: 0, fontSize: 14 }}>{card.title}</h5>
            {card.description && (
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>{card.description}</p>
            )}
            {card.tags && (
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {card.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "#e6f7ff",
                      borderRadius: 4,
                      fontSize: 10,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
);
export default DataKanban;
