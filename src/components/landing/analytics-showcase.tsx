"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp, Target } from "lucide-react";

export function AnalyticsShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-display mb-4">Advanced Analytics</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Deep insights into your financial behavior with beautiful visualizations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Spending by Category */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-surface/50 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Spending by Category</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Food & Dining", value: 35, color: "bg-primary" },
                  { name: "Transportation", value: 25, color: "bg-accent" },
                  { name: "Shopping", value: 20, color: "bg-chart-3" },
                  { name: "Entertainment", value: 15, color: "bg-chart-4" },
                  { name: "Others", value: 5, color: "bg-chart-5" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.name}</span>
                        <span className="font-mono-num">{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${item.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${item.value}%` } : {}}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Spending by Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-surface/50 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Payment Methods</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Bank Transfer", value: 45, color: "bg-primary" },
                  { name: "Credit Card", value: 30, color: "bg-accent" },
                  { name: "M-Pesa", value: 15, color: "bg-chart-3" },
                  { name: "PayPal", value: 10, color: "bg-chart-4" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.name}</span>
                        <span className="font-mono-num">{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${item.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${item.value}%` } : {}}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-surface/50 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Monthly Trend</h3>
              </div>
              <div className="h-32 flex items-end gap-1">
                {[20, 35, 25, 45, 30, 55, 40, 60, 35, 50, 45, 70].map((height, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-primary/60 to-primary/30 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={isInView ? { height: `${height}%` } : {}}
                    transition={{ delay: 0.5 + i * 0.03, duration: 0.4 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </Card>
          </motion.div>

          {/* Budget Utilization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-surface/50 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Budget Utilization</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "On Track", value: 65, color: "text-primary" },
                  { label: "At Risk", value: 25, color: "text-warning" },
                  { label: "Exceeded", value: 10, color: "text-danger" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="text-center p-3 rounded-lg bg-surface-muted/50"
                  >
                    <p className={`text-2xl font-bold font-mono-num ${item.color}`}>{item.value}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Financial Growth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="md:col-span-2"
          >
            <Card className="p-6 bg-surface/50 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Financial Growth</h3>
              </div>
              <div className="relative h-32">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <motion.path
                    d="M0,80 Q50,70 100,60 T200,40 T300,30 T400,10"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ delay: 0.7, duration: 1.5 }}
                  />
                  <motion.path
                    d="M0,80 Q50,70 100,60 T200,40 T300,30 T400,10 L400,100 L0,100 Z"
                    fill="url(#gradient)"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 0.2 } : {}}
                    transition={{ delay: 1, duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">6 months ago</span>
                <span className="text-primary font-semibold">+42% growth</span>
                <span className="text-muted-foreground">Today</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
