"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, TrendingUp, Wallet, ArrowRight } from "lucide-react";

export function DashboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-display mb-4">Interactive Dashboard</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See your financial data come to life with beautiful visualizations
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pie Chart Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-surface/80 backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Spending by Category</h3>
              </div>
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="var(--chart-1)"
                    strokeWidth="20"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 0.35 } : {}}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="var(--chart-2)"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="163.28"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 0.25 } : {}}
                    transition={{ delay: 0.6, duration: 1 }}
                  />
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="var(--chart-3)"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="188.4"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 0.2 } : {}}
                    transition={{ delay: 0.7, duration: 1 }}
                  />
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="var(--chart-4)"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="213.52"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 0.15 } : {}}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="var(--chart-5)"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="238.64"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 0.05 } : {}}
                    transition={{ delay: 0.9, duration: 1 }}
                  />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {["Food & Dining", "Transportation", "Shopping", "Entertainment", "Others"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-chart-${i + 1}`} />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Trend Chart Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-surface/80 backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Monthly Spending Trend</h3>
              </div>
              <div className="h-48 flex items-end gap-2">
                {[30, 45, 35, 60, 40, 55, 50, 70, 45, 65, 55, 80].map((height, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={isInView ? { height: `${height}%` } : {}}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Budget Progress Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-surface/80 backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Budget Progress</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Food & Dining", progress: 82, color: "bg-primary" },
                  { name: "Transportation", progress: 65, color: "bg-accent" },
                  { name: "Shopping", progress: 45, color: "bg-chart-3" },
                  { name: "Entertainment", progress: 90, color: "bg-danger" },
                ].map((budget, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{budget.name}</span>
                      <span className="text-sm font-mono-num">{budget.progress}%</span>
                    </div>
                    <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${budget.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${budget.progress}%` } : {}}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Transactions Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-surface/80 backdrop-blur-xl border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ArrowRight className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                </div>
                <span className="text-sm text-muted-foreground">View All</span>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Grocery Store", amount: "-$125.50", date: "Today" },
                  { title: "Salary Deposit", amount: "+$4,500.00", date: "Yesterday" },
                  { title: "Netflix Subscription", amount: "-$15.99", date: "2 days ago" },
                  { title: "Gas Station", amount: "-$45.00", date: "3 days ago" },
                ].map((txn, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{txn.title}</p>
                      <p className="text-xs text-muted-foreground">{txn.date}</p>
                    </div>
                    <p className={`text-sm font-mono-num ${txn.amount.startsWith('+') ? 'text-primary' : 'text-danger'}`}>
                      {txn.amount}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
