import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MonthData } from "../types";

interface MetricBarChartProps {
  data: MonthData[];
  color: "emerald" | "indigo" | "amber";
  unit?: string;
  title: string;
}

export default function MetricBarChart({ data, color, unit = "Orang", title }: MetricBarChartProps) {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  // Chart layout dimensions (SVG ViewBox coordinates)
  const svgWidth = 600;
  const svgHeight = 320;
  
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 40;
  const paddingBottom = 50;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate scales
  const maxVal = Math.max(...data.map(d => d.count), 10);
  // Add 15% buffer to the top of chart for visual breathing room
  const yMax = Math.ceil(maxVal * 1.15);

  const getX = (index: number) => {
    const step = chartWidth / data.length;
    return paddingLeft + index * step + step / 2;
  };

  const getY = (value: number) => {
    return svgHeight - paddingBottom - (value / yMax) * chartHeight;
  };

  const getBarHeight = (value: number) => {
    return (value / yMax) * chartHeight;
  };

  // Color mappings
  const theme = {
    emerald: {
      barFill: "fill-emerald-500",
      barHover: "hover:fill-emerald-400",
      stroke: "stroke-emerald-500",
      text: "text-emerald-400 font-medium",
      bgLight: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-950/20",
      gradientId: "grad-emerald",
      gradientColors: ["#10b981", "#059669"]
    },
    indigo: {
      barFill: "fill-indigo-500",
      barHover: "hover:fill-indigo-400",
      stroke: "stroke-indigo-500",
      text: "text-indigo-400 font-medium",
      bgLight: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      glow: "shadow-indigo-950/20",
      gradientId: "grad-indigo",
      gradientColors: ["#6366f1", "#4f46e5"]
    },
    amber: {
      barFill: "fill-amber-500",
      barHover: "hover:fill-amber-400",
      stroke: "stroke-amber-500",
      text: "text-amber-400 font-medium",
      bgLight: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-950/20",
      gradientId: "grad-amber",
      gradientColors: ["#f59e0b", "#d97706"]
    }
  }[color];

  // Helper for generating Y axis ticks
  const yTicks = [0, Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax];

  return (
    <div id={`chart-${title.toLowerCase().replace(/\s+/g, "-")}`} className="relative bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-display font-semibold text-slate-100 text-lg tracking-tight">
          {title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <span className={`w-2.5 h-2.5 rounded-sm ${theme.barFill}`}></span>
          <span>Pencapaian per Bulan</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto select-none"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id={theme.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.gradientColors[0]} />
              <stop offset="100%" stopColor={theme.gradientColors[1]} />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {yTicks.map((tick, i) => (
            <g key={i} className="opacity-40">
              <line 
                x1={paddingLeft} 
                y1={getY(tick)} 
                x2={svgWidth - paddingRight} 
                y2={getY(tick)} 
                className="stroke-slate-800 stroke-1"
                strokeDasharray="4,4"
              />
              <text 
                x={paddingLeft - 10} 
                y={getY(tick) + 4} 
                className="font-mono text-[10px] text-slate-500 text-right"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* X Axis Line */}
          <line 
            x1={paddingLeft} 
            y1={svgHeight - paddingBottom} 
            x2={svgWidth - paddingRight} 
            y2={svgHeight - paddingBottom} 
            className="stroke-slate-800 stroke-1"
          />

          {/* Bars */}
          {data.map((item, i) => {
            const barWidth = Math.min(32, (chartWidth / data.length) * 0.6);
            const x = getX(i) - barWidth / 2;
            const y = getY(item.count);
            const h = getBarHeight(item.count);

            return (
              <g 
                key={i}
                onMouseEnter={() => setActiveBar(i)}
                onMouseLeave={() => setActiveBar(null)}
                className="cursor-pointer"
              >
                {/* Invisible wider rect for easier hover targeting */}
                <rect
                  x={getX(i) - (chartWidth / data.length) / 2}
                  y={paddingTop}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Animated visual bar */}
                <motion.rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx={4}
                  fill={`url(#${theme.gradientId})`}
                  className={`${theme.barHover} transition-all duration-200`}
                  initial={{ height: 0, y: svgHeight - paddingBottom }}
                  animate={{ height: h, y: y }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                />

                {/* Value on top of bar (always show or show on hover) */}
                <text
                  x={getX(i)}
                  y={y - 8}
                  textAnchor="middle"
                  className={`font-mono text-xs font-semibold ${
                    activeBar === i ? theme.text : "text-slate-500 opacity-0 md:opacity-100"
                  } transition-opacity duration-200`}
                >
                  {item.count}
                </text>

                {/* X Axis Label */}
                <text
                  x={getX(i)}
                  y={svgHeight - paddingBottom + 20}
                  textAnchor="middle"
                  className={`font-sans text-[11px] ${
                    activeBar === i ? "text-slate-200 font-medium" : "text-slate-500"
                  } transition-colors duration-200`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip overlaid via absolute HTML placement for smooth high-contrast presentation */}
        <AnimatePresence>
          {activeBar !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs shadow-sm bg-slate-950/95 text-white border-slate-800 backdrop-blur-sm pointer-events-none"
            >
              <span className="font-medium text-slate-400">{data[activeBar].name}:</span>
              <span className="font-mono font-bold text-white">
                {data[activeBar].count} {unit}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`mt-2 p-3 rounded-xl border bg-slate-950/60 border-slate-800/85 flex justify-between items-center`}>
        <span className="text-xs text-slate-400 font-sans font-medium">Rata-rata Bulanan:</span>
        <span className={`text-sm font-mono font-bold ${theme.text}`}>
          {Math.round(data.reduce((acc, curr) => acc + curr.count, 0) / data.length)} {unit} / bulan
        </span>
      </div>
    </div>
  );
}
