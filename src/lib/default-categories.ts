export const DEFAULT_CATEGORIES: {
  name: string;
  color: string;
  icon: string;
  type: "income" | "expense";
}[] = [
  { name: "Food", color: "#b9862e", icon: "UtensilsCrossed", type: "expense" },
  { name: "Transport", color: "#6a8caf", icon: "Car", type: "expense" },
  { name: "Shopping", color: "#8a6bb0", icon: "ShoppingBag", type: "expense" },
  { name: "Entertainment", color: "#b23a48", icon: "Clapperboard", type: "expense" },
  { name: "Bills", color: "#4a4a42", icon: "Receipt", type: "expense" },
  { name: "Healthcare", color: "#3f8f8a", icon: "HeartPulse", type: "expense" },
  { name: "Rent", color: "#a15c3e", icon: "Home", type: "expense" },
  { name: "Education", color: "#4f7fbf", icon: "GraduationCap", type: "expense" },
  { name: "Salary", color: "#1f6f5c", icon: "Wallet", type: "income" },
  { name: "Investments", color: "#2c8a5f", icon: "TrendingUp", type: "income" },
  { name: "Gifts", color: "#c7548a", icon: "Gift", type: "income" },
  { name: "Other", color: "#7a7a6e", icon: "MoreHorizontal", type: "expense" },
];

export const CATEGORY_ICON_OPTIONS = [
  "UtensilsCrossed", "Car", "ShoppingBag", "Clapperboard", "Receipt",
  "HeartPulse", "Home", "GraduationCap", "Wallet", "TrendingUp", "Gift",
  "MoreHorizontal", "Plane", "Coffee", "Dumbbell", "PawPrint", "Baby",
  "Fuel", "Smartphone", "Wifi", "Music", "Book", "Tag",
];

export const CATEGORY_COLOR_OPTIONS = [
  "#1f6f5c", "#b9862e", "#6a8caf", "#b23a48", "#8a6bb0", "#3f8f8a",
  "#a15c3e", "#4f7fbf", "#c7548a", "#2c8a5f", "#7a7a6e", "#4a4a42",
];
