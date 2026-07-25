"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CreditCard, Building2, Smartphone } from "lucide-react";

export function AnimatedDashboardMockup() {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Glass effect container */}
      <Card className="p-6 bg-surface/80 backdrop-blur-xl border border-border/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Dashboard</h3>
            <p className="text-sm text-muted-foreground">January 2025</p>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Income</span>
            </div>
            <motion.p
              className="text-2xl font-bold font-mono-num"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              $8,450
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-4 rounded-xl bg-gradient-to-br from-danger/20 to-danger/5 border border-danger/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-danger" />
              <span className="text-xs text-muted-foreground">Expenses</span>
            </div>
            <motion.p
              className="text-2xl font-bold font-mono-num"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              $5,230
            </motion.p>
          </motion.div>
        </div>

        {/* Connected Accounts */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Connected Accounts</h4>
          <div className="space-y-2">
            {[
              { icon: Building2, name: "Chase Bank", balance: "$4,200" },
              { icon: CreditCard, name: "PayPal", balance: "$1,850" },
              { icon: Smartphone, name: "M-Pesa", balance: "$2,400" },
            ].map((account, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted/50 border border-border/30"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <account.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
                <p className="text-sm font-semibold font-mono-num">{account.balance}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Spending Chart Mockup */}
        <div className="p-4 rounded-xl bg-surface-muted/30 border border-border/30">
          <h4 className="text-sm font-medium mb-3">Spending Trend</h4>
          <div className="flex items-end gap-2 h-24">
            {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75, 65, 90].map((height, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 1.2 + i * 0.05, duration: 0.5 }}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Floating notification card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute -right-4 top-20 p-4 rounded-xl bg-surface border border-border shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-warning" />
          </div>
          <div>
            <p className="text-sm font-medium">Budget Alert</p>
            <p className="text-xs text-muted-foreground">Food budget at 82%</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
