import * as React from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface SankeyNode {
  id: string;
  label: string;
  value?: number;
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  className?: string;
}

export function SankeyDiagram({
  nodes,
  links,
  width = 600,
  height = 400,
  nodeWidth = 20,
  nodePadding = 10,
  className,
}: SankeyDiagramProps) {
  const layout = useMemo(() => {
    // Group nodes by column (source nodes left, target nodes right)
    const sourceIds = new Set(links.map(l => l.source));
    const targetIds = new Set(links.map(l => l.target));
    const leftNodes = nodes.filter(n => sourceIds.has(n.id) && !targetIds.has(n.id));
    const rightNodes = nodes.filter(n => targetIds.has(n.id) && !sourceIds.has(n.id));
    const middleNodes = nodes.filter(n => sourceIds.has(n.id) && targetIds.has(n.id));

    // Calculate values for each node
    const nodeValues: Record<string, number> = {};
    nodes.forEach(n => {
      const outgoing = links.filter(l => l.source === n.id).reduce((s, l) => s + l.value, 0);
      const incoming = links.filter(l => l.target === n.id).reduce((s, l) => s + l.value, 0);
      nodeValues[n.id] = Math.max(outgoing, incoming, n.value || 0);
    });

    const totalLeft = leftNodes.reduce((s, n) => s + nodeValues[n.id], 0);
    const totalRight = rightNodes.reduce((s, n) => s + nodeValues[n.id], 0);
    const maxTotal = Math.max(totalLeft, totalRight);
    const availableHeight = height - (Math.max(leftNodes.length, rightNodes.length) - 1) * nodePadding;

    // Position nodes
    const nodePositions: Record<string, { x: number; y: number; height: number }> = {};
    
    let yOffset = 0;
    leftNodes.forEach(n => {
      const h = (nodeValues[n.id] / maxTotal) * availableHeight;
      nodePositions[n.id] = { x: 0, y: yOffset, height: h };
      yOffset += h + nodePadding;
    });

    yOffset = 0;
    rightNodes.forEach(n => {
      const h = (nodeValues[n.id] / maxTotal) * availableHeight;
      nodePositions[n.id] = { x: width - nodeWidth, y: yOffset, height: h };
      yOffset += h + nodePadding;
    });

    return { nodePositions, nodeValues };
  }, [nodes, links, width, height, nodeWidth, nodePadding]);

  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

  return (
    <TooltipProvider>
      <svg className={cn('', className)} width={width} height={height}>
        {/* Links */}
        {links.map((link, i) => {
          const source = layout.nodePositions[link.source];
          const target = layout.nodePositions[link.target];
          if (!source || !target) return null;
          
          const linkHeight = (link.value / Math.max(layout.nodeValues[link.source], 1)) * source.height;
          const path = `M${nodeWidth},${source.y + source.height / 2} C${width / 2},${source.y + source.height / 2} ${width / 2},${target.y + target.height / 2} ${target.x},${target.y + target.height / 2}`;
          
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <path
                  d={path}
                  fill="none"
                  stroke={colors[i % colors.length]}
                  strokeWidth={Math.max(1, linkHeight)}
                  strokeOpacity={0.5}
                  className="cursor-pointer hover:stroke-opacity-80 transition-opacity"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{link.source} → {link.target}: {link.value}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {/* Nodes */}
        {nodes.map((node, i) => {
          const pos = layout.nodePositions[node.id];
          if (!pos) return null;
          
          return (
            <Tooltip key={node.id}>
              <TooltipTrigger asChild>
                <g>
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={nodeWidth}
                    height={Math.max(pos.height, 4)}
                    fill={node.color || colors[i % colors.length]}
                    className="cursor-pointer"
                  />
                  <text
                    x={pos.x < width / 2 ? pos.x + nodeWidth + 5 : pos.x - 5}
                    y={pos.y + pos.height / 2}
                    textAnchor={pos.x < width / 2 ? 'start' : 'end'}
                    dominantBaseline="middle"
                    className="text-xs fill-current"
                  >
                    {node.label}
                  </text>
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p>{node.label}: {layout.nodeValues[node.id]}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </svg>
    </TooltipProvider>
  );
}

export default SankeyDiagram;
