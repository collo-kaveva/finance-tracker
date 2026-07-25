"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We use bank-level encryption to protect your data. Your information is never shared with third parties, and we're fully compliant with data protection regulations.",
  },
  {
    question: "Can I connect multiple bank accounts?",
    answer: "Yes! Depending on your plan, you can connect multiple accounts from different banks, PayPal, and M-Pesa. All your transactions are automatically synced and categorized.",
  },
  {
    question: "How does the budget tracking work?",
    answer: "You can set monthly budgets for different spending categories. We'll track your spending in real-time and send you alerts when you're approaching or exceeding your budget limits.",
  },
  {
    question: "Can I export my financial data?",
    answer: "Yes, Pro and Premium users can export their data in PDF or CSV format. This is perfect for tax purposes, sharing with accountants, or personal record-keeping.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and M-Pesa for subscription payments. You can change your payment method at any time from your account settings.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial on our Pro plan. No credit card required to start. You'll have full access to all Pro features during the trial period.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-display mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Ledger
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden bg-surface/80 backdrop-blur-sm border border-border/50">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold pr-8">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-0 text-muted-foreground">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
