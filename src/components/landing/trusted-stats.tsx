"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, DollarSign, Users, CheckCircle } from "lucide-react";

export function TrustedStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: "50K+", label: "Transactions Tracked", icon: TrendingUp },
    { value: "$8M+", label: "Expenses Managed", icon: DollarSign },
    { value: "99.9%", label: "Data Accuracy", icon: CheckCircle },
    { value: "12K+", label: "Active Users", icon: Users },
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>
              <motion.p
                className="text-4xl font-bold font-mono-num mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
              >
                {stat.value}
              </motion.p>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
