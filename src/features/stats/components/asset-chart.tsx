'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AssetHistoryPoint } from '../actions';

interface AssetChartProps {
  data: AssetHistoryPoint[];
  title?: string;
}

export function AssetChart({ data, title = '資産推移' }: AssetChartProps) {
  const chartId = useId().replace(/:/g, '');

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[300px] items-center justify-center">データがありません</div>
        </CardContent>
      </Card>
    );
  }

  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.balance));
    const dataMin = Math.min(...data.map((i) => i.balance));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id={`${chartId}-splitColor`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="var(--color-primary)" stopOpacity={1} />
                  <stop offset={off} stopColor="var(--color-error)" stopOpacity={1} />
                </linearGradient>
                <linearGradient id={`${chartId}-splitFill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset={off} stopColor="var(--color-error)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  return value;
                }}
                minTickGap={30}
                tick={{ fontSize: 12 }}
              />
              <YAxis tickFormatter={(value) => `¥${value.toLocaleString()}`} tick={{ fontSize: 12 }} width={80} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Tooltip
                formatter={(value: number | undefined) => [
                  value !== undefined ? `¥${value.toLocaleString()}` : '',
                  '資産',
                ]}
                labelFormatter={(label) => label}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={`url(#${chartId}-splitColor)`}
                fill={`url(#${chartId}-splitFill)`}
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isPositive = payload.balance >= 0;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill={isPositive ? 'var(--color-primary)' : 'var(--color-error)'}
                      stroke={isPositive ? 'var(--color-primary)' : 'var(--color-error)'}
                    />
                  );
                }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
