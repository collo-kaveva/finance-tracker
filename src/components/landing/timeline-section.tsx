"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { ArrowDown, Link, BarChart3, TrendingUp } from "lucide-react";

export function TimelineSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: Link,
      title: "Connect Accounts",
      description: "Link your Bank, PayPal, and M-Pesa accounts for seamless data sync",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      icon: BarChart3,
      title: "Track Transactions",
      description: "Automatically import and categorize every transaction across all accounts",
      color: "from-green-500/20 to-green-600/10",
    },
    {
      icon: TrendingUp,
      title: "Analyze Spending",
      description: "Get detailed insights into your spending patterns and financial habits",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      icon: TrendingUp,
      title: "Improve Habits",
      description: "Set budgets, receive alerts, and make smarter financial decisions",
      color: "from-orange-500/20 to-orange-600/10",
    },
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-display mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple 4-step process
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border hidden lg:block" />

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15 }}
                  className={`flex ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-4`}
                >
                  {/* Step number */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {i + 1}
                    </div>
                  </div>

                  {/* Card */}
                  <Card className={`flex-1 p-6 bg-surface/80 backdrop-blur-sm border border-border/50 ${i % 2 === 0 ? "lg:ml-8" : "lg:mr-8"}`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </Card>
                </motion.div>

                {/* Arrow for next step */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="flex justify-center my-4 lg:hidden"
                  >
                    <ArrowDown className="w-6 h-6 text-muted-foreground" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
