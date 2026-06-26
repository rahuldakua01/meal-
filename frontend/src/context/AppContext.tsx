import React, { createContext, useContext, useState, useEffect } from 'react';

// Type definitions
export interface MenuItem {
  name: string;
  description: string;
  calories: number;
  image: string;
  type: 'veg' | 'nonveg';
}

export interface DayMenu {
  breakfastVeg: MenuItem;
  breakfastNonVeg: MenuItem;
  lunchVeg: MenuItem;
  lunchNonVeg: MenuItem;
  dinnerVeg: MenuItem;
  dinnerNonVeg: MenuItem;
}

export interface WeeklyMenu {
  [day: string]: DayMenu;
}

export interface SubscriptionPlan {
  id: 'base' | 'standard' | 'premium';
  name: string;
  price: number;
  mealCount: number;
  description: string;
  features: string[];
  color: string;
  glow: boolean;
}

export interface Subscription {
  tier: 'none' | 'base' | 'standard' | 'premium';
  meals: string[]; // e.g. ["breakfast"], ["breakfast", "dinner"], ["breakfast", "lunch", "dinner"]
  startDate: string;
  status: 'active' | 'cancelled';
  preference: 'veg' | 'nonveg';
}

export interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  total: number;
  date: string;
  type: 'subscription' | 'extra';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'admin';
  status?: 'Active' | 'Non-Active' | 'Always Active';
  subscription: Subscription | null;
}

export interface ExtraStoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: 'veg' | 'nonveg';
  calories: number;
  category: 'snack' | 'dessert' | 'beverage' | 'special';
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  weeklyMenu: WeeklyMenu;
  extraStore: ExtraStoreItem[];
  orders: Order[];
  notifications: Notification[];
  searchQuery: string;
  selectedCategory: string;
  subscriptionPlans: SubscriptionPlan[];
  registerUser: (user: Omit<User, 'id' | 'role' | 'subscription' | 'status'>) => Promise<{ success: boolean; message: string }>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; message: string; role?: string }>;
  logoutUser: () => void;
  subscribeToPlan: (tier: 'base' | 'standard' | 'premium', meals: string[], preference: 'veg' | 'nonveg') => Promise<{ success: boolean; message: string }>;
  cancelSubscription: () => void;
  placeExtraOrder: (items: OrderItem[], total: number) => void;
  updateWeeklyMenu: (day: string, slotKey: keyof DayMenu, updatedMeal: MenuItem) => void;
  updateSubscriptionPlan: (id: 'base' | 'standard' | 'premium', updatedPlan: Partial<SubscriptionPlan>) => Promise<{ success: boolean; message: string }>;
  addExtraStoreItem: (item: Omit<ExtraStoreItem, 'id'>) => void;
  deleteExtraStoreItem: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  markNotificationsAsRead: () => void;
  addNotification: (message: string) => void;
  clearNotifications: () => void;
  fetchUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Static Data
const defaultWeeklyMenu: WeeklyMenu = {
  monday: {
    breakfastVeg: {
      name: 'Aloo Paratha with Curd',
      description: 'Golden-crisp whole wheat flatbreads stuffed with spicy mashed potatoes. Served with fresh curd and pickles.',
      calories: 380,
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    breakfastNonVeg: {
      name: 'Egg Paratha with Raita',
      description: 'Layered flatbread stuffed with scrambled spiced eggs, served with cool cucumber raita.',
      calories: 420,
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    lunchVeg: {
      name: 'Rajma Chawal & Salad',
      description: 'Slow-cooked red kidney beans in a thick tomato-onion gravy, served with fluffy basmati rice and cucumber salad.',
      calories: 450,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    lunchNonVeg: {
      name: 'Rajma Chawal with Egg Curry',
      description: 'Slow-cooked kidney beans in gravy, paired with a spiced hard-boiled egg curry, fluffy rice, and salad.',
      calories: 520,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    dinnerVeg: {
      name: 'Kadai Paneer & Butter Tandoori Roti',
      description: 'Fresh cottage cheese cubes stir-fried with bell peppers in a freshly ground kadai spice mix. Served with hot roti.',
      calories: 520,
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    dinnerNonVeg: {
      name: 'Kadai Chicken & Butter Tandoori Roti',
      description: 'Tender chicken pieces stir-fried with bell peppers in a freshly ground kadai spice gravy. Served with tandoori roti.',
      calories: 590,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
  },
  tuesday: {
    breakfastVeg: {
      name: 'Indori Poha & Sev',
      description: 'Light, fluffy flattened rice seasoned with mustard seeds, turmeric, and peanuts, topped with crunchy Indori sev.',
      calories: 290,
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    breakfastNonVeg: {
      name: 'Indori Poha with Boiled Egg',
      description: 'Traditional Indori style flattened rice seasoned with turmeric and sev, accompanied by a seasoned boiled egg.',
      calories: 360,
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    lunchVeg: {
      name: 'Paneer Bhurji & Cumin Rice',
      description: 'Fresh cottage cheese scrambled with tomatoes, onions, and green chillies. Served with hot steamed rice and dal.',
      calories: 460,
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    lunchNonVeg: {
      name: 'Egg Curry & Steamed Rice',
      description: 'Hard-boiled eggs cooked in aromatic onion-tomato gravy. Served with steamed rice and yellow dal fry.',
      calories: 540,
      image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    dinnerVeg: {
      name: 'Soya Chaap Masala & Roti',
      description: 'Juicy soya chaap pieces simmered in a spiced tomato-onion curry gravy, served with hot wheat flatbreads.',
      calories: 490,
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    dinnerNonVeg: {
      name: 'Chicken Masala & Roti',
      description: 'Succulent chicken pieces slow-simmered in a traditional home-style spiced curry. Served with hot flatbreads.',
      calories: 610,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
  },
  wednesday: {
    breakfastVeg: {
      name: 'Steamed Idli & Medu Vada',
      description: 'Fluffy fermented rice cakes and crispy lentil donuts, served with hot sambar and fresh coconut chutney.',
      calories: 260,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    breakfastNonVeg: {
      name: 'Idli Vada with Chicken Kurma',
      description: 'Steamed rice cakes and crispy lentil donuts, served with warden special hot chicken kurma gravy.',
      calories: 410,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    lunchVeg: {
      name: 'Veg Pulao with Mixed Raita',
      description: 'Fragrant basmati rice cooked with assorted fresh vegetables and spices, accompanied by refreshing seasoned yogurt.',
      calories: 410,
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    lunchNonVeg: {
      name: 'Egg Pulao with Raita',
      description: 'Basmati rice slow-cooked with boiled eggs, spices, and mint. Served with refreshing seasoned yogurt.',
      calories: 490,
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    dinnerVeg: {
      name: 'Dal Makhani & Garlic Naan',
      description: 'Black lentils slow-cooked overnight with cream and butter, paired with clay-oven baked garlic flatbreads.',
      calories: 630,
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    dinnerNonVeg: {
      name: 'Mutton Keema Matar & Garlic Naan',
      description: 'Minced mutton cooked with green peas in active spices, served with fresh garlic naan.',
      calories: 710,
      image: 'https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
  },
  thursday: {
    breakfastVeg: {
      name: 'Grilled Vegetable Sandwich & Tea',
      description: 'Crispy grilled sandwich stuffed with seasoned potatoes, tomatoes, cucumber and cheese. Served with hot milk tea.',
      calories: 280,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    breakfastNonVeg: {
      name: 'Masala Omelette & Butter Toast',
      description: 'Double egg omelette with fresh herbs, onions, and chillies, accompanied by buttered toast and hot tea.',
      calories: 340,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    lunchVeg: {
      name: 'Amritsari Chole Bhature',
      description: 'Spicy, dark garbanzo beans cooked in traditional Punjabi spices, served with two large, fluffy fried breads.',
      calories: 680,
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    lunchNonVeg: {
      name: 'Amritsari Chole Bhature with Chicken Tikka',
      description: 'Spicy Punjabi garbanzo beans and bhature, complemented by a side of tandoori grilled chicken tikka.',
      calories: 790,
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    dinnerVeg: {
      name: 'Paneer Makhani & Rice',
      description: 'Soft cottage cheese cubes in a creamy, velvety sweet-and-spiced tomato gravy. Served with steamed basmati rice.',
      calories: 520,
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    dinnerNonVeg: {
      name: 'Butter Chicken & Rice',
      description: 'Tender chicken pieces simmered in a rich tomato, butter, and cashew nut gravy. Served with steamed basmati rice.',
      calories: 620,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
  },
  friday: {
    breakfastVeg: {
      name: 'Poori Bhaji & Sooji Halwa',
      description: 'Puffed deep-fried wheat breads served with a mildly spiced potato gravy and sweet semolina pudding.',
      calories: 460,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    breakfastNonVeg: {
      name: 'Poori Bhaji with Egg Bhurji',
      description: 'Fried wheat poori, spicy potato bhaji, and a side of scrambled masala eggs with herbs.',
      calories: 530,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    lunchVeg: {
      name: 'Bihari Khichdi & Aloo Chokha',
      description: 'Comforting rice and lentil porridge loaded with ghee, served with spiced mashed potatoes, papad, and pickles.',
      calories: 360,
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    lunchNonVeg: {
      name: 'Bihari Khichdi with Fish Fry',
      description: 'Comforting lentil rice khichdi with ghee, served with a crispy spiced shallow-fried fish steak and potato chokha.',
      calories: 480,
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    dinnerVeg: {
      name: 'Veg Dum Biryani with Raita',
      description: 'Layers of long-grain basmati rice and marinated mixed vegetables cooked on dum. Served with seasoned cucumber raita.',
      calories: 580,
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    dinnerNonVeg: {
      name: 'Hyderabadi Chicken Biryani',
      description: 'Fragrant basmati rice, mint, saffron, and chicken pieces marinated in yogurt and spices cooked slow on dum. Served with raita.',
      calories: 720,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
  },
  saturday: {
    breakfastVeg: {
      name: 'Masala Dosa & Sambar',
      description: 'Crispy fermented crepe filled with spiced potato mash, served with tangy sambar and tomato-coconut chutneys.',
      calories: 310,
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    breakfastNonVeg: {
      name: 'Chicken Keema Dosa & Sambar',
      description: 'Crispy dosa crepe stuffed with spicy minced chicken bhurji, served with sambar and fresh chutney.',
      calories: 430,
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    lunchVeg: {
      name: 'Aloo Gobhi & Dal Fry',
      description: 'Homestyle potato and cauliflower sabzi paired with tempered yellow lentils and piping hot chapati.',
      calories: 420,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    lunchNonVeg: {
      name: 'Aloo Gobhi Sabzi with Egg Scramble',
      description: 'Homestyle cauliflower potato dish, yellow lentils, flatbreads, and a side of spiced scrambled eggs.',
      calories: 490,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    dinnerVeg: {
      name: 'Paneer Tikka Masala & Naan',
      description: 'Clay-oven roasted cottage cheese cubes tossed in a rich, spiced cream gravy. Served with tandoori naan.',
      calories: 580,
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    dinnerNonVeg: {
      name: 'Fish Tikka Masala & Naan',
      description: 'Marinated tandoori fish tikka steaks simmered in a hot and spicy masala gravy. Served with soft naan.',
      calories: 640,
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
  },
  sunday: {
    breakfastVeg: {
      name: 'Chole Kulche & Sweet Lassi',
      description: 'Tangy, spice-loaded yellow peas served with soft, fluffy baked kulchas and a sweet glass of thick yogurt lassi.',
      calories: 510,
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    breakfastNonVeg: {
      name: 'Chicken Keema Kulcha & Lassi',
      description: 'Leavened flatbread stuffed with spiced minced chicken, served with sweet lassi and pickles.',
      calories: 590,
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    lunchVeg: {
      name: 'Shahi Paneer & Cumin Rice',
      description: 'Premium rich cashew-almond base gravy cooked with cottage cheese cubes. Served with cumin rice.',
      calories: 540,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    lunchNonVeg: {
      name: 'Chicken Korma & Cumin Rice',
      description: 'Rich, aromatic Mughlai chicken curry slow-cooked with nut paste and spices, paired with cumin rice.',
      calories: 660,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
    dinnerVeg: {
      name: 'Dal Makhani & Butter Roti',
      description: 'Creamy slow-cooked black lentils with white butter, served with freshly baked butter flatbreads.',
      calories: 540,
      image: 'https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=600',
      type: 'veg',
    },
    dinnerNonVeg: {
      name: 'Mutton Rogan Josh & Butter Roti',
      description: 'Traditional Kashmiri mutton curry slow-cooked in aromatic spices and red chili paste, served with butter flatbreads.',
      calories: 690,
      image: 'https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=600',
      type: 'nonveg',
    },
  },
};

const defaultExtraStore: ExtraStoreItem[] = [
  {
    id: 'ex-1',
    name: 'Spicy Paneer Tikka (6 pcs)',
    description: 'Juicy cubes of cottage cheese marinated in spiced yogurt and grilled to smoky perfection in the tandoor.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600',
    type: 'veg',
    calories: 280,
    category: 'special',
  },
  {
    id: 'ex-2',
    name: 'Tandoori Chicken (Half)',
    description: 'Fresh chicken joints marinated in authentic spices and grilled in clay-oven. Super smoky and hot.',
    price: 240,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
    type: 'nonveg',
    calories: 450,
    category: 'special',
  },
  {
    id: 'ex-3',
    name: 'Crispy Veg Spring Rolls',
    description: 'Crunchy golden wrappers loaded with stir-fried Chinese cabbage, carrots, onions, and spring greens. (4 pcs)',
    price: 90,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    type: 'veg',
    calories: 220,
    category: 'snack',
  },
  {
    id: 'ex-4',
    name: 'Samosa & Masala Chai Combo',
    description: 'Two crispy golden potato samosas served with sweet tamarind chutney and a piping hot cup of ginger milk tea.',
    price: 60,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600',
    type: 'veg',
    calories: 310,
    category: 'snack',
  },
  {
    id: 'ex-5',
    name: 'Chilled Mango Lassi',
    description: 'Thick, creamy traditional yogurt drink blended with fresh sweet Alphonso mango pulp and cardamom.',
    price: 70,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=600',
    type: 'veg',
    calories: 180,
    category: 'beverage',
  },
  {
    id: 'ex-6',
    name: 'Hot Chocolate Fudge Brownie',
    description: 'Rich dark chocolate brownie loaded with walnuts, topped with warm fudge syrup and served with vanilla ice cream.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
    type: 'veg',
    calories: 420,
    category: 'dessert',
  },
  {
    id: 'ex-7',
    name: 'Gulab Jamun (2 pcs)',
    description: 'Soft, melt-in-the-mouth fried dumplings made of milk solids, soaked in aromatic rose-cardamom sugar syrup.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    type: 'veg',
    calories: 290,
    category: 'dessert',
  },
  {
    id: 'ex-8',
    name: 'Extra Rice / Butter Naan Portions',
    description: 'Add an extra side serving of basmati rice or one clay-oven baked butter naan for your ongoing meal.',
    price: 40,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    type: 'veg',
    calories: 190,
    category: 'special',
  },
];

const initialUsers: User[] = [
  {
    id: 'u-admin',
    name: 'Hostel Chief Warden',
    email: 'admin@hostelbites.com',
    phone: '9876543210',
    password: 'admin123',
    role: 'admin',
    subscription: null,
  },
  {
    id: 'u-1',
    name: 'Rahul Sharma',
    email: 'student@hostel.com',
    phone: '9988776655',
    password: 'student123',
    role: 'user',
    subscription: {
      tier: 'standard',
      meals: ['breakfast', 'dinner'],
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      preference: 'nonveg',
    },
  },
];

const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    userId: 'u-1',
    userName: 'Rahul Sharma',
    userPhone: '9988776655',
    items: [{ name: 'Standard Meal Plan Subscription (2 meals/day)', price: 3500, qty: 1 }],
    total: 3500,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'subscription',
  },
  {
    id: 'ord-1002',
    userId: 'u-1',
    userName: 'Rahul Sharma',
    userPhone: '9988776655',
    items: [
      { name: 'Spicy Paneer Tikka (6 pcs)', price: 180, qty: 1 },
      { name: 'Chilled Mango Lassi', price: 70, qty: 1 }
    ],
    total: 250,
    date: new Date().toISOString().split('T')[0],
    type: 'extra',
  }
];

const defaultSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'base',
    name: 'Base Meal Plan',
    price: 2000,
    mealCount: 1,
    description: 'Perfect for students who want one healthy meal guaranteed every day (Breakfast or Lunch or Dinner).',
    features: [
      'Select any 1 meal slot daily',
      'Veg & Non-Veg menu options included',
      'Menu set by Hostel Wardens',
      'Save up to ₹700 compared to standalone purchases',
      'Cancel anytime',
    ],
    color: '#0a84ff',
    glow: false,
  },
  {
    id: 'standard',
    name: 'Standard Meal Plan',
    price: 3500,
    mealCount: 2,
    description: 'Our most popular tier. Choose any two daily meals as per your convenience (e.g., Breakfast + Dinner).',
    features: [
      'Select any 2 meal slots daily',
      'Full access to weekly menu variations',
      'Veg & Non-Veg menu options included',
      'Save up to ₹1,900 compared to standalone purchases',
      'Flexible choices updated daily',
      'Priority serving queue',
    ],
    color: '#ff9f0a',
    glow: true,
  },
  {
    id: 'premium',
    name: 'Premium Feast Plan',
    price: 4800,
    mealCount: 3,
    description: 'The ultimate culinary package. Get three wholesome meals a day: Breakfast, Lunch, and Dinner.',
    features: [
      'All 3 daily meal slots included',
      'Includes weekly special and warden choice dinners',
      'Complimentary entry to weekend feast nights',
      'Save up to ₹3,300 compared to standalone purchases',
      'Zero extra fees for regular menu dishes',
      'Priority serving queue & special seating area',
    ],
    color: 'var(--brand-color)',
    glow: false,
  },
];

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // If the code is running in a browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If we are in production on Render (not running on local machine)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  
  // Local development fallback
  return envUrl || 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database states with LocalStorage hydration
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('hms_users');
    return local ? JSON.parse(local) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const local = localStorage.getItem('hms_current_user');
    return local ? JSON.parse(local) : null;
  });

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(() => {
    const local = localStorage.getItem('hms_weekly_menu');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && parsed.monday && 'breakfastVeg' in parsed.monday) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse weekly menu from localStorage", e);
      }
    }
    return defaultWeeklyMenu;
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => {
    const local = localStorage.getItem('hms_plans');
    return local ? JSON.parse(local) : defaultSubscriptionPlans;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem('hms_orders');
    return local ? JSON.parse(local) : initialOrders;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const local = localStorage.getItem('hms_notifications');
    return local ? JSON.parse(local) : [
      { id: 'not-1', message: 'Welcome to HostelBites! Browse menu and plans.', time: '10 mins ago', isRead: false },
      { id: 'not-2', message: 'Warden added Wednesday Special: Dal Makhani & Garlic Naan.', time: '2 hours ago', isRead: false }
    ];
  });

  const [extraStore, setExtraStore] = useState<ExtraStoreItem[]>(() => {
    const local = localStorage.getItem('hms_extra_store');
    return local ? JSON.parse(local) : defaultExtraStore;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Keep LocalStorage updated
  useEffect(() => {
    localStorage.setItem('hms_extra_store', JSON.stringify(extraStore));
  }, [extraStore]);

  useEffect(() => {
    localStorage.setItem('hms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('hms_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hms_plans', JSON.stringify(subscriptionPlans));
  }, [subscriptionPlans]);

  useEffect(() => {
    localStorage.setItem('hms_weekly_menu', JSON.stringify(weeklyMenu));
  }, [weeklyMenu]);

  useEffect(() => {
    localStorage.setItem('hms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hms_current_user', JSON.stringify(currentUser));
      if (currentUser.role === 'admin') {
        fetchUsers();
      } else {
        // update this user in the full users list too
        setUsers(prev => prev.map(u => u.id === currentUser.id ? currentUser : u));
      }
    } else {
      localStorage.removeItem('hms_current_user');
    }
  }, [currentUser]);

  // Fetch user profile from backend
  const fetchUserProfile = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Failed to fetch profile' };
      }
      
      const userProfile: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        subscription: data.subscription
      };
      
      setCurrentUser(userProfile);
      return { success: true, user: userProfile };
    } catch (e: any) {
      return { success: false, message: e.message || 'Server error' };
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/plan/get_plans`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptionPlans(prev => prev.map(p => {
          const match = data.find((d: any) => d.plan_name === p.id);
          return match ? { ...p, price: match.price } : p;
        }));
      }
    } catch (e) {
      console.error("Failed to fetch plans from backend", e);
    }
  };

  const fetchWeeklyMenu = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/weekly`);
      if (res.ok) {
        const data = await res.json();
        
        // Format relative image paths to absolute URLs using API_BASE_URL
        const formattedMenu = { ...data };
        for (const day of Object.keys(formattedMenu)) {
          const dayMenu = formattedMenu[day];
          for (const slot of Object.keys(dayMenu)) {
            const meal = dayMenu[slot];
            if (meal && meal.image && !meal.image.startsWith('http') && !meal.image.startsWith('data:')) {
              const imgPath = meal.image.replace(/^\/+/, '');
              meal.image = `${API_BASE_URL}/${imgPath}`;
            }
          }
        }
        
        setWeeklyMenu(prev => ({
          ...prev,
          ...formattedMenu
        }));
      }
    } catch (e) {
      console.error("Failed to fetch weekly menu from backend", e);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('hms_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user_view`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to fetch users from backend", e);
    }
  };

  // Sync profile and fetch plans on load
  useEffect(() => {
    fetchPlans();
    fetchWeeklyMenu();
    const token = localStorage.getItem('hms_token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  // Auth Operations
  const registerUser = async (details: Omit<User, 'id' | 'role' | 'subscription' | 'status'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          phone: details.phone,
          mail: details.email,
          password: details.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Registration failed' };
      }
      return { success: true, message: data.Message || 'Registration successful. Verification email sent!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Server error' };
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mail: email,
          password: password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Invalid email or password.' };
      }
      
      localStorage.setItem('hms_token', data.token);
      const profileResult = await fetchUserProfile(data.token);
      
      if (profileResult.success && profileResult.user) {
        addNotification(`Logged in as ${profileResult.user.name}.`);
        return { success: true, message: 'Logged in successfully!', role: profileResult.user.role };
      } else {
        localStorage.removeItem('hms_token');
        return { success: false, message: profileResult.message || 'Failed to fetch user profile' };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Server error' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('hms_token');
    addNotification('Logged out successfully.');
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Subscription Operations
  const subscribeToPlan = async (
    tier: 'base' | 'standard' | 'premium',
    meals: string[],
    preference: 'veg' | 'nonveg'
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: "Please log in first" };
    
    if (currentUser.status === "Active") {
      return { success: false, message: "You already have an active subscription plan!" };
    }

    const token = localStorage.getItem('hms_token');
    if (!token) return { success: false, message: "Authentication token not found. Please log in again." };

    const plan = subscriptionPlans.find(p => p.id === tier);
    const price = plan ? plan.price : 0;

    try {
      const serializedPlanName = `${tier}:${preference}:${meals.join(',')}`;
      
      const orderRes = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_name: serializedPlanName
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        return { success: false, message: orderData.detail || "Failed to initiate transaction with backend" };
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        return { success: false, message: "Failed to load Razorpay payment SDK" };
      }

      return new Promise((resolve) => {
        const options = {
          key: "rzp_test_T5NuEtV7T5n6Ue",
          amount: orderData.amount,
          currency: orderData.currency,
          name: "HostelBites",
          description: `${tier.toUpperCase()} Plan Subscription`,
          order_id: orderData.order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch(`${API_BASE_URL}/payment/verify-payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan_name: serializedPlanName
                })
              });
              
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                resolve({ success: false, message: verifyData.detail || "Payment verification failed" });
                return;
              }

              await fetchUserProfile(token);
              
              const subOrder: Order = {
                id: `ord-${Date.now().toString().slice(-4)}`,
                userId: currentUser.id,
                userName: currentUser.name,
                userPhone: currentUser.phone,
                items: [{ name: `${preference === 'veg' ? 'Veg' : 'Non-Veg'} ${tier.toUpperCase()} Meal Subscription (${meals.length} meals/day)`, price, qty: 1 }],
                total: price,
                date: new Date().toISOString().split('T')[0],
                type: 'subscription',
              };
              setOrders(prev => [subOrder, ...prev]);
              addNotification(`Subscribed to the ${preference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan!`);
              
              resolve({ success: true, message: "Subscription activated successfully!" });
            } catch (e: any) {
              resolve({ success: false, message: e.message || "Error verifying payment" });
            }
          },
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
            contact: currentUser.phone,
          },
          theme: {
            color: "#ff9f0a",
          },
          modal: {
            ondismiss: function () {
              resolve({ success: false, message: "Payment cancelled by user" });
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    } catch (e: any) {
      return { success: false, message: e.message || "Network error occurred" };
    }
  };

  const cancelSubscription = () => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      subscription: null,
    };
    setCurrentUser(updatedUser);
    addNotification(`Your meal subscription has been cancelled.`);
  };

  // Extra Orders Operations
  const placeExtraOrder = (items: OrderItem[], total: number) => {
    if (!currentUser) return;

    const extraOrder: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      items,
      total,
      date: new Date().toISOString().split('T')[0],
      type: 'extra',
    };

    setOrders(prev => [extraOrder, ...prev]);
    addNotification(`Order placed successfully! Paid ₹${total}.`);
  };

  // Admin menu manager
  const updateWeeklyMenu = async (day: string, slotKey: keyof DayMenu, updatedMeal: MenuItem) => {
    const token = localStorage.getItem('hms_token');
    if (!token) {
      addNotification("Authentication token not found.");
      return;
    }

    const mealDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    const mealCategory = slotKey.endsWith('Veg') ? 'Veg' : 'Non-Veg';
    const mealType = slotKey.startsWith('breakfast') ? 'breakfast' : slotKey.startsWith('lunch') ? 'lunch' : 'dinner';

    try {
      const formData = new FormData();
      formData.append('name', updatedMeal.name);
      formData.append('calories', String(updatedMeal.calories));
      formData.append('description', updatedMeal.description);

      if (updatedMeal.image.startsWith('data:')) {
        const response = await fetch(updatedMeal.image);
        const blob = await response.blob();
        const file = new File([blob], `meal_${mealDay}_${mealCategory}.jpg`, { type: 'image/jpeg' });
        formData.append('image', file);
      } else if (updatedMeal.image.startsWith('http') && !updatedMeal.image.includes(API_BASE_URL)) {
        try {
          const response = await fetch(updatedMeal.image);
          const blob = await response.blob();
          const file = new File([blob], `meal_${mealDay}_${mealCategory}.jpg`, { type: blob.type || 'image/jpeg' });
          formData.append('image', file);
        } catch (imgErr) {
          console.error("Failed to fetch remote image to upload to backend", imgErr);
        }
      }

      const res = await fetch(`${API_BASE_URL}/admin/update_${mealType}/${mealDay}/${mealCategory}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        addNotification(`Failed to update menu: ${data.detail || 'Server error'}`);
        return;
      }

      addNotification(`Admin updated the menu for ${day.toUpperCase()} ${slotKey.replace('Veg', ' (Veg)').replace('NonVeg', ' (Non-Veg)')}.`);
      
      // Refresh weekly menu to sync with server
      await fetchWeeklyMenu();

    } catch (e: any) {
      console.error("Error updating weekly menu:", e);
      addNotification(`Error updating menu: ${e.message}`);
    }
  };

  const updateSubscriptionPlan = async (id: 'base' | 'standard' | 'premium', updatedPlan: Partial<SubscriptionPlan>) => {
    const token = localStorage.getItem('hms_token');
    if (!token) return { success: false, message: "Authentication token not found." };

    try {
      const formData = new FormData();
      if (updatedPlan.price !== undefined) {
        formData.append('price', String(updatedPlan.price));
      }
      
      const res = await fetch(`${API_BASE_URL}/plan/update_plan/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || "Failed to update plan" };
      }

      setSubscriptionPlans(prev => prev.map(p => p.id === id ? { ...p, ...updatedPlan } : p));
      addNotification(`Admin updated subscription plan details for ${id.toUpperCase()}.`);
      return { success: true, message: data.Message || "Plan updated successfully!" };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to connect to backend" };
    }
  };

  const addExtraStoreItem = (item: Omit<ExtraStoreItem, 'id'>) => {
    const newItem: ExtraStoreItem = {
      ...item,
      id: `ex-${Date.now()}`
    };
    setExtraStore(prev => [...prev, newItem]);
    addNotification(`Admin added canteen item: ${newItem.name}`);
  };

  const deleteExtraStoreItem = (id: string) => {
    setExtraStore(prev => {
      const item = prev.find(it => it.id === id);
      if (item) {
        addNotification(`Admin removed canteen item: ${item.name}`);
      }
      return prev.filter(it => it.id !== id);
    });
  };

  // Notification Operations
  const addNotification = (message: string) => {
    const newNot: Notification = {
      id: `not-${Date.now()}`,
      message,
      time: 'Just now',
      isRead: false,
    };
    setNotifications(prev => [newNot, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        weeklyMenu,
        extraStore,
        orders,
        notifications,
        searchQuery,
        selectedCategory,
        subscriptionPlans,
        registerUser,
        loginUser,
        logoutUser,
        subscribeToPlan,
        cancelSubscription,
        placeExtraOrder,
        updateWeeklyMenu,
        updateSubscriptionPlan,
        addExtraStoreItem,
        deleteExtraStoreItem,
        setSearchQuery,
        setSelectedCategory,
        markNotificationsAsRead,
        addNotification,
        clearNotifications,
        fetchUsers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
