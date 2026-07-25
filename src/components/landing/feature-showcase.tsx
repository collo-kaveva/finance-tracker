"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Wallet, Building2, BarChart3, Bell, Brain } from "lucide-react";

export function FeatureShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: PieChart,
      title: "Expense Tracking",
      description: "Track every transaction with precision and categorize spending automatically.",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      icon: Wallet,
      title: "Budget Planning",
      description: "Create monthly budgets and get real-time alerts when you're approaching limits.",
      color: "from-green-500/20 to-green-600/10",
    },
    {
      icon: Building2,
      title: "Connected Accounts",
      description: "Connect Bank, PayPal and M-Pesa for seamless financial aggregation.",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      icon: BarChart3,
      title: "Visual Reports",
      description: "Generate beautiful, interactive reports to understand your spending patterns.",
      color: "from-orange-500/20 to-orange-600/10",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Receive intelligent spending alerts and budget warnings in real-time.",
      color: "from-red-500/20 to-red-600/10",
    },
    {
      icon: Brain,
      title: "Spending Insights",
      description: "AI-ready financial analysis engine that provides actionable insights.",
      color: "from-pink-500/20 to-pink-600/10",
    },
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-display mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take control of your financial life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="p-6 h-full bg-surface/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
