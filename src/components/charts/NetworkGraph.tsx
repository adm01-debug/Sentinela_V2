import * as React from 'react';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface NetworkNode {
  id: string;
  label: string;
  group?: string;
  size?: number;
  color?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight?: number;
  label?: string;
}

export interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  width?: number;
  height?: number;
  className?: string;
  onNodeClick?: (node: NetworkNode) => void;
  interactive?: boolean;
}

export function NetworkGraph({
  nodes,
  edges,
  width = 600,
  height = 400,
  className,
  onNodeClick,
  interactive = true,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  // Initialize positions using force-directed layout simulation
  useEffect(() => {
    const initialPositions: Record<string, { x: number; y: number }> = {};
    const angleStep = (2 * Math.PI) / nodes.length;
    const radius = Math.min(width, height) / 3;
    
    nodes.forEach((node, i) => {
      initialPositions[node.id] = {
        x: width / 2 + radius * Math.cos(angleStep * i),
        y: height / 2 + radius * Math.sin(angleStep * i),
      };
    });
    setPositions(initialPositions);

    // Simple force simulation
    let iteration = 0;
    const maxIterations = 100;
    const interval = setInterval(() => {
      if (iteration >= maxIterations) { clearInterval(interval); return; }
      
      setPositions(prev => {
        const newPos = { ...prev };
        nodes.forEach(node => {
          let fx = 0, fy = 0;
          
          // Repulsion between all nodes
          nodes.forEach(other => {
            if (node.id === other.id) return;
            const dx = newPos[node.id].x - newPos[other.id].x;
            const dy = newPos[node.id].y - newPos[other.id].y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const force = 2000 / (dist * dist);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          });
          
          // Attraction along edges
          edges.forEach(edge => {
            if (edge.source !== node.id && edge.target !== node.id) return;
            const otherId = edge.source === node.id ? edge.target : edge.source;
            const dx = newPos[otherId].x - newPos[node.id].x;
            const dy = newPos[otherId].y - newPos[node.id].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = dist * 0.01;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          });
          
          // Center gravity
          fx += (width / 2 - newPos[node.id].x) * 0.01;
          fy += (height / 2 - newPos[node.id].y) * 0.01;
          
          newPos[node.id] = {
            x: Math.max(30, Math.min(width - 30, newPos[node.id].x + fx * 0.1)),
            y: Math.max(30, Math.min(height - 30, newPos[node.id].y + fy * 0.1)),
          };
        });
        return newPos;
      });
      iteration++;
    }, 50);

    return () => clearInterval(interval);
  }, [nodes, edges, width, height]);

  const handleMouseDown = useCallback((nodeId: string) => {
    if (interactive) setDraggedNode(nodeId);
  }, [interactive]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setPositions(prev => ({
      ...prev,
      [draggedNode]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    }));
  }, [draggedNode]);

  const handleMouseUp = useCallback(() => setDraggedNode(null), []);

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4'];
  const groupColors = useMemo(() => {
    const groups = [...new Set(nodes.map(n => n.group))];
    return Object.fromEntries(groups.map((g, i) => [g, colors[i % colors.length]]));
  }, [nodes]);

  return (
    <svg
      ref={svgRef}
      className={cn('bg-muted/20 rounded-lg', className)}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Edges */}
      {edges.map((edge, i) => {
        const source = positions[edge.source];
        const target = positions[edge.target];
        if (!source || !target) return null;
        const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
        
        return (
          <line
            key={i}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke={isHighlighted ? '#6366f1' : '#94a3b8'}
            strokeWidth={isHighlighted ? 2 : (edge.weight || 1)}
            strokeOpacity={isHighlighted ? 1 : 0.4}
          />
        );
      })}
      
      {/* Nodes */}
      {nodes.map(node => {
        const pos = positions[node.id];
        if (!pos) return null;
        const isHovered = hoveredNode === node.id;
        const size = node.size || 20;
        
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x},${pos.y})`}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onMouseDown={() => handleMouseDown(node.id)}
            onClick={() => onNodeClick?.(node)}
          >
            <circle
              r={isHovered ? size * 1.2 : size}
              fill={node.color || groupColors[node.group || ''] || colors[0]}
              stroke={isHovered ? '#1e293b' : 'white'}
              strokeWidth={2}
              className="transition-all"
            />
            <text
              y={size + 15}
              textAnchor="middle"
              className="text-xs fill-current pointer-events-none"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default NetworkGraph;
