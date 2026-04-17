/* ════════════════════════════════════════════
   NutriTrack – script.js
   All dynamic functionality for the app
════════════════════════════════════════════ */

/* ──────────────────────────────────────────
   APP STATE
────────────────────────────────────────── */
const state = {
  auth: {
    mode: 'signin',
    user: null,
    verificationCode: '',
    isAuthenticated: false,
    isReady: false,
    pendingVerificationEmail: ''
  },
  goals: {
    calories: 2000,
    protein:  150,
    carbs:    250,
    fat:      65,
    water:    8
  },
  profile: {
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    dietPreference: '',
    allergies: '',
    goalType: 'maintain',
    targetWeight: '',
    weeklyTarget: '',
    avatarImage: ''
  },
  preferences: {
    mealReminders: true,
    waterReminders: true,
    workoutReminders: true,
    weeklySummary: true,
    aiRecommendations: true
  },
  dashboard: {
    hydrationLiters: 0,
    weeklyCalories: [],
    weightTrend: []
  },
  currentDate: '',
  history: [],
  consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  burned:   0,
  water:    0,
  currentSection: 'dashboard',
  currentMood: 'energetic',
  selectedFood: null,
  portionMultiplier: 1,
  groceryChecked: {},
  language: 'en',
  scanner: {
    mode: 'idle',
    fileName: '',
    imageData: '',
    imageBlob: null,
    stream: null,
    uploadedFile: null,
    isAnalyzing: false,
    detectedFood: null,
    nutrition: null,
    baseResult: null,
    scanWeight: 100,
    errorMessage: ''
  }
};

const APP_STATE_STORAGE_KEY_PREFIX = 'nutritrack-app-state';
const DUMMY_SCAN_INDEX_KEY = 'nutritrack-dummy-scan-index';
const SCAN_API_ENDPOINT = '/api/scan';
const LOG_API_ENDPOINT = '/api/log';

/* ──────────────────────────────────────────
   FOOD DATABASE (Simulated AI Food Data)
────────────────────────────────────────── */
const FOODS = [
  { id: 1,  name: 'Grilled Chicken',  emoji: '🍗', cal: 165, protein: 31, carbs: 0,  fat: 3.6, category: 'Protein' },
  { id: 2,  name: 'Avocado Toast',    emoji: '🥑', cal: 295, protein: 8,  carbs: 35, fat: 15,  category: 'Grains' },
  { id: 3,  name: 'Greek Salad',      emoji: '🥗', cal: 180, protein: 6,  carbs: 14, fat: 12,  category: 'Vegetables' },
  { id: 4,  name: 'Brown Rice',       emoji: '🍚', cal: 215, protein: 5,  carbs: 45, fat: 1.8, category: 'Grains' },
  { id: 5,  name: 'Salmon Fillet',    emoji: '🐟', cal: 208, protein: 28, carbs: 0,  fat: 10,  category: 'Protein' },
  { id: 6,  name: 'Banana',           emoji: '🍌', cal: 89,  protein: 1,  carbs: 23, fat: 0.3, category: 'Fruits' },
  { id: 7,  name: 'Scrambled Eggs',   emoji: '🍳', cal: 148, protein: 10, carbs: 1,  fat: 11,  category: 'Protein' },
  { id: 8,  name: 'Oatmeal',          emoji: '🥣', cal: 158, protein: 6,  carbs: 27, fat: 3.2, category: 'Grains' },
  { id: 9,  name: 'Mixed Berries',    emoji: '🫐', cal: 57,  protein: 0.7,carbs: 13, fat: 0.3, category: 'Fruits' },
  { id: 10, name: 'Quinoa Bowl',      emoji: '🥙', cal: 222, protein: 8,  carbs: 39, fat: 3.5, category: 'Grains' },
  { id: 11, name: 'Almonds',          emoji: '🥜', cal: 164, protein: 6,  carbs: 6,  fat: 14,  category: 'Nuts' },
  { id: 12, name: 'Sweet Potato',     emoji: '🍠', cal: 103, protein: 2,  carbs: 24, fat: 0.1, category: 'Vegetables' },
  { id: 13, name: 'Paneer Tikka',     emoji: '🧀', cal: 265, protein: 18, carbs: 9,  fat: 18,  category: 'Protein' },
  { id: 14, name: 'Dal Tadka',        emoji: '🍲', cal: 198, protein: 12, carbs: 28, fat: 5,   category: 'Protein' },
  { id: 15, name: 'Roti',             emoji: '🫓', cal: 120, protein: 4,  carbs: 22, fat: 3,   category: 'Grains' },
  { id: 16, name: 'Curd Bowl',        emoji: '🥛', cal: 98,  protein: 5,  carbs: 7,  fat: 5,   category: 'Dairy' },
  { id: 17, name: 'Tofu Stir Fry',    emoji: '🥬', cal: 240, protein: 20, carbs: 18, fat: 11,  category: 'Protein' },
  { id: 18, name: 'Apple',            emoji: '🍎', cal: 95,  protein: 0.5,carbs: 25, fat: 0.3, category: 'Fruits' },
  { id: 19, name: 'Whey Shake',       emoji: '🥤', cal: 130, protein: 25, carbs: 4,  fat: 2,   category: 'Protein' },
  { id: 20, name: 'Vegetable Poha',   emoji: '🍛', cal: 250, protein: 7,  carbs: 46, fat: 6,   category: 'Grains' },
];

/* ──────────────────────────────────────────
   MEALS DATABASE
────────────────────────────────────────── */
const MEALS = [
  { id: 1,  name: 'Power Oat Bowl',      type: 'breakfast', emoji: '🥣', cal: 380, protein: 18, carbs: 52, fat: 10, ingredients: ['Oatmeal','Banana','Almonds','Berries'] },
  { id: 2,  name: 'Avocado Toast & Eggs',type: 'breakfast', emoji: '🥑', cal: 440, protein: 18, carbs: 36, fat: 26, ingredients: ['Avocado Toast','Scrambled Eggs'] },
  { id: 3,  name: 'Grilled Chicken Bowl',type: 'lunch',     emoji: '🍗', cal: 510, protein: 42, carbs: 48, fat: 10, ingredients: ['Grilled Chicken','Brown Rice','Greek Salad'] },
  { id: 4,  name: 'Salmon & Quinoa',     type: 'lunch',     emoji: '🐟', cal: 480, protein: 36, carbs: 40, fat: 14, ingredients: ['Salmon Fillet','Quinoa Bowl'] },
  { id: 5,  name: 'Veggie Power Salad',  type: 'lunch',     emoji: '🥗', cal: 290, protein: 14, carbs: 30, fat: 13, ingredients: ['Greek Salad','Quinoa Bowl','Almonds'] },
  { id: 6,  name: 'Baked Salmon Plate',  type: 'dinner',    emoji: '🐟', cal: 540, protein: 48, carbs: 28, fat: 22, ingredients: ['Salmon Fillet','Sweet Potato','Greek Salad'] },
  { id: 7,  name: 'Chicken & Rice',      type: 'dinner',    emoji: '🍚', cal: 490, protein: 44, carbs: 46, fat: 10, ingredients: ['Grilled Chicken','Brown Rice'] },
  { id: 8,  name: 'Berry Protein Shake', type: 'snack',     emoji: '🫐', cal: 180, protein: 20, carbs: 18, fat: 3,  ingredients: ['Mixed Berries','Banana'] },
  { id: 9,  name: 'Almond Energy Mix',   type: 'snack',     emoji: '🥜', cal: 220, protein: 7,  carbs: 16, fat: 14, ingredients: ['Almonds','Mixed Berries'] },
  { id: 10, name: 'Sweet Potato Rounds', type: 'snack',     emoji: '🍠', cal: 160, protein: 3,  carbs: 36, fat: 0.5,ingredients: ['Sweet Potato'] },
  { id: 11, name: 'Vegetable Poha Bowl', type: 'breakfast', emoji: '🍛', cal: 360, protein: 11, carbs: 62, fat: 8,  ingredients: ['Vegetable Poha','Curd Bowl'] },
  { id: 12, name: 'Greek Yogurt Fruit Cup', type: 'breakfast', emoji: '🥛', cal: 310, protein: 20, carbs: 42, fat: 7, ingredients: ['Curd Bowl','Mixed Berries','Almonds'] },
  { id: 13, name: 'Dal Roti Plate',     type: 'lunch',      emoji: '🍲', cal: 520, protein: 24, carbs: 76, fat: 14, ingredients: ['Dal Tadka','Roti','Greek Salad'] },
  { id: 14, name: 'Paneer Tikka Salad', type: 'lunch',      emoji: '🧀', cal: 450, protein: 30, carbs: 24, fat: 24, ingredients: ['Paneer Tikka','Greek Salad'] },
  { id: 15, name: 'Tofu Stir Fry Bowl', type: 'lunch',      emoji: '🥬', cal: 430, protein: 29, carbs: 42, fat: 15, ingredients: ['Tofu Stir Fry','Brown Rice'] },
  { id: 16, name: 'Lean Protein Thali', type: 'dinner',     emoji: '🍽️', cal: 580, protein: 45, carbs: 58, fat: 16, ingredients: ['Grilled Chicken','Dal Tadka','Roti','Greek Salad'] },
  { id: 17, name: 'Light Tofu Dinner',  type: 'dinner',     emoji: '🥗', cal: 390, protein: 30, carbs: 28, fat: 15, ingredients: ['Tofu Stir Fry','Greek Salad'] },
  { id: 18, name: 'Paneer Roti Wrap',   type: 'dinner',     emoji: '🌯', cal: 520, protein: 31, carbs: 48, fat: 22, ingredients: ['Paneer Tikka','Roti','Greek Salad'] },
  { id: 19, name: 'Apple Curd Crunch',  type: 'snack',      emoji: '🍎', cal: 210, protein: 8,  carbs: 32, fat: 6,  ingredients: ['Apple','Curd Bowl','Almonds'] },
  { id: 20, name: 'Whey Banana Shake',  type: 'snack',      emoji: '🥤', cal: 240, protein: 27, carbs: 29, fat: 3,  ingredients: ['Whey Shake','Banana'] },
];

/* ──────────────────────────────────────────
   MOOD FOOD DATABASE
────────────────────────────────────────── */
const MOOD_FOODS = {
  energetic: {
    label: 'Fuel Your Peak Performance ⚡',
    desc: 'Complex carbs and lean proteins to sustain your energy',
    foods: [
      { emoji: '🍌', name: 'Banana', desc: 'Quick energy with natural sugars & potassium' },
      { emoji: '🥜', name: 'Almonds', desc: 'Healthy fats for sustained mental energy' },
      { emoji: '🥚', name: 'Eggs', desc: 'Complete protein for muscle recovery' },
      { emoji: '🫐', name: 'Blueberries', desc: 'Antioxidants for brain performance' },
      { emoji: '🍗', name: 'Grilled Chicken', desc: 'Lean protein to maintain strength' },
      { emoji: '🍚', name: 'Brown Rice', desc: 'Slow-release carbs for endurance' },
    ]
  },
  tired: {
    label: 'Revive & Restore Energy 😴',
    desc: 'Iron-rich and energising foods to fight fatigue',
    foods: [
      { emoji: '🥬', name: 'Spinach', desc: 'High iron to combat tiredness' },
      { emoji: '🍫', name: 'Dark Chocolate', desc: 'Quick energy boost with magnesium' },
      { emoji: '☕', name: 'Green Tea', desc: 'Gentle caffeine with L-theanine' },
      { emoji: '🐟', name: 'Salmon', desc: 'Omega-3 to reduce inflammation' },
      { emoji: '🥣', name: 'Oatmeal', desc: 'Slow-release carbs to stabilise blood sugar' },
      { emoji: '🫚', name: 'Chia Seeds', desc: 'Omega-3, fiber & sustained energy' },
    ]
  },
  stressed: {
    label: 'Calm Your Mind & Body 😤',
    desc: 'Magnesium and vitamin C-rich foods to ease stress',
    foods: [
      { emoji: '🫐', name: 'Blueberries', desc: 'Vitamin C to lower cortisol levels' },
      { emoji: '🥑', name: 'Avocado', desc: 'B vitamins to regulate mood hormones' },
      { emoji: '🫛', name: 'Edamame', desc: 'Plant protein with calming properties' },
      { emoji: '🥜', name: 'Walnuts', desc: 'Omega-3 to reduce anxiety' },
      { emoji: '🍊', name: 'Oranges', desc: 'Vitamin C boosts immunity under stress' },
      { emoji: '🍫', name: 'Dark Chocolate', desc: 'Magnesium and serotonin boost' },
    ]
  },
  low: {
    label: 'Lift Your Energy Levels 😔',
    desc: 'Serotonin and dopamine-boosting foods',
    foods: [
      { emoji: '🍌', name: 'Banana', desc: 'Tryptophan to boost serotonin' },
      { emoji: '🥜', name: 'Peanut Butter', desc: 'Protein & healthy fats for mood' },
      { emoji: '🍵', name: 'Chamomile Tea', desc: 'Calms nerves and improves sleep' },
      { emoji: '🥚', name: 'Eggs', desc: 'Choline for brain health' },
      { emoji: '🍠', name: 'Sweet Potato', desc: 'Complex carbs to raise serotonin' },
      { emoji: '🐟', name: 'Tuna', desc: 'Vitamin D & omega-3 for mood' },
    ]
  },
  happy: {
    label: 'Keep the Good Vibes Going 😊',
    desc: 'Nourish your happiness with balanced nutrition',
    foods: [
      { emoji: '🥗', name: 'Rainbow Salad', desc: 'Colourful veggies = diverse nutrients' },
      { emoji: '🍓', name: 'Strawberries', desc: 'Vitamin C and natural sweetness' },
      { emoji: '🫐', name: 'Mixed Berries', desc: 'Antioxidants to sustain your glow' },
      { emoji: '🥒', name: 'Cucumber', desc: 'Hydrating and refreshing' },
      { emoji: '🍋', name: 'Lemon Water', desc: 'Detoxifying and energising' },
      { emoji: '🥝', name: 'Kiwi', desc: 'Vitamin C and digestive enzymes' },
    ]
  },
  focused: {
    label: 'Sharpen Focus 🎯',
    desc: 'Steady glucose, omega-3, and hydration for deep work',
    foods: [
      { emoji: '🐟', name: 'Salmon', desc: 'Omega-3 fats support cognitive performance' },
      { emoji: '🥣', name: 'Oatmeal', desc: 'Slow carbs for stable concentration' },
      { emoji: '🫐', name: 'Blueberries', desc: 'Polyphenols for brain health' },
      { emoji: '🥚', name: 'Eggs', desc: 'Choline supports memory pathways' },
      { emoji: '🥤', name: 'Whey Shake', desc: 'Protein without a heavy meal crash' },
      { emoji: '💧', name: 'Water', desc: 'Even mild dehydration hurts focus' },
    ]
  },
  anxious: {
    label: 'Calm and Ground 🌿',
    desc: 'Magnesium-rich and gentle foods for a steadier mood',
    foods: [
      { emoji: '🍵', name: 'Chamomile Tea', desc: 'Warm, calming ritual before meals' },
      { emoji: '🥑', name: 'Avocado', desc: 'B vitamins and healthy fats' },
      { emoji: '🥜', name: 'Almonds', desc: 'Magnesium and crunch without sugar spikes' },
      { emoji: '🍌', name: 'Banana', desc: 'Potassium and easy carbs' },
      { emoji: '🥛', name: 'Curd Bowl', desc: 'Protein and gut-friendly cultures' },
      { emoji: '🍲', name: 'Dal Tadka', desc: 'Comforting protein and fiber' },
    ]
  },
  sore: {
    label: 'Muscle Recovery 💪',
    desc: 'Protein, electrolytes, and anti-inflammatory choices',
    foods: [
      { emoji: '🍗', name: 'Grilled Chicken', desc: 'Lean protein for repair' },
      { emoji: '🥤', name: 'Whey Shake', desc: 'Fast protein after training' },
      { emoji: '🍠', name: 'Sweet Potato', desc: 'Carbs and potassium for recovery' },
      { emoji: '🐟', name: 'Salmon', desc: 'Omega-3 support for soreness' },
      { emoji: '🍚', name: 'Brown Rice', desc: 'Refuels glycogen stores' },
      { emoji: '🥬', name: 'Tofu Stir Fry', desc: 'Plant protein with micronutrients' },
    ]
  },
  cravings: {
    label: 'Handle Cravings 🍫',
    desc: 'Satisfying foods that keep calories under control',
    foods: [
      { emoji: '🍎', name: 'Apple', desc: 'Fiber and sweetness with volume' },
      { emoji: '🥛', name: 'Curd Bowl', desc: 'Creamy protein snack' },
      { emoji: '🍫', name: 'Dark Chocolate', desc: 'Small portion for sweet cravings' },
      { emoji: '🥜', name: 'Almonds', desc: 'Crunchy fats help fullness' },
      { emoji: '🫐', name: 'Mixed Berries', desc: 'Low-calorie sweetness' },
      { emoji: '🥤', name: 'Whey Shake', desc: 'High-protein dessert-style option' },
    ]
  },
  recovery: {
    label: 'Rest Day Recovery 🛌',
    desc: 'Nutrient-dense, easy digestion, and hydration support',
    foods: [
      { emoji: '🍲', name: 'Dal Tadka', desc: 'Protein and fiber without heaviness' },
      { emoji: '🥗', name: 'Greek Salad', desc: 'Micronutrients and hydration' },
      { emoji: '🥛', name: 'Curd Bowl', desc: 'Gentle protein and probiotics' },
      { emoji: '🍌', name: 'Banana', desc: 'Potassium for muscle function' },
      { emoji: '🥣', name: 'Oatmeal', desc: 'Comforting slow carbs' },
      { emoji: '🍵', name: 'Green Tea', desc: 'Light caffeine and antioxidants' },
    ]
  }
};

/* ──────────────────────────────────────────
   EXERCISE TYPES
────────────────────────────────────────── */
const EXERCISES = [
  { name: '🏃 Running',   cal: 400 },
  { name: '🚴 Cycling',   cal: 300 },
  { name: '🏊 Swimming',  cal: 350 },
  { name: '🏋️ Weight Training', cal: 250 },
  { name: '🧘 Yoga',      cal: 150 },
  { name: '🚶 Walking',   cal: 180 },
  { name: '⚽ Football',  cal: 450 },
  { name: '🥊 Boxing',    cal: 420 },
  { name: '🪜 Stair Climb', cal: 360 },
  { name: '🧗 HIIT Circuit', cal: 380 },
  { name: '🪷 Mobility Flow', cal: 120 },
  { name: '🏸 Badminton', cal: 310 },
];

const TRANSLATIONS = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      scanner: 'Food Scanner',
      meals: 'Meal Planner',
      coach: 'AI Coach',
      mood: 'Mood Food',
      water: 'Water Tracker',
      calories: 'Calorie Balance',
      training: 'Training',
      grocery: 'Grocery List',
      profile: 'Profile',
      logout: 'Logout'
    },
    coachGreeting: 'Hi, I am your NutriTrack coach. Ask me about meals, hydration, calories, or training.',
    mealAdvice: 'Based on your remaining calories, choose a lean protein, slow carbs, and vegetables. A good pick is Grilled Chicken Bowl or Salmon & Quinoa.',
    workoutAdvice: 'Try a moderate full-body session today: 10 min warm-up, 3 strength rounds, then 12 min cardio.',
    hydrationAdvice: 'Hydration is part of performance. Keep sipping water steadily and aim for your daily glass goal.',
    defaultAdvice: 'I can help with meal ideas, calorie balance, hydration, grocery planning, and exercise recommendations.'
  },
  hi: {
    nav: {
      dashboard: 'डैशबोर्ड',
      scanner: 'फूड स्कैनर',
      meals: 'मील प्लानर',
      coach: 'AI कोच',
      mood: 'मूड फूड',
      water: 'वाटर ट्रैकर',
      calories: 'कैलोरी बैलेंस',
      training: 'ट्रेनिंग',
      grocery: 'ग्रोसरी लिस्ट',
      profile: 'प्रोफाइल',
      logout: 'लॉग आउट'
    },
    coachGreeting: 'नमस्ते, मैं आपका NutriTrack कोच हूं। मील, पानी, कैलोरी या ट्रेनिंग के बारे में पूछें।',
    mealAdvice: 'आपकी बची हुई कैलोरी के हिसाब से लीन प्रोटीन, धीमे कार्ब्स और सब्जियां चुनें। Grilled Chicken Bowl या Salmon & Quinoa अच्छा विकल्प है।',
    workoutAdvice: 'आज मध्यम फुल-बॉडी सेशन करें: 10 मिनट वार्म-अप, 3 स्ट्रेंथ राउंड, फिर 12 मिनट कार्डियो।',
    hydrationAdvice: 'हाइड्रेशन परफॉर्मेंस का हिस्सा है। पानी धीरे-धीरे पीते रहें और अपना दैनिक लक्ष्य पूरा करें।',
    defaultAdvice: 'मैं मील आइडिया, कैलोरी बैलेंस, पानी, ग्रोसरी प्लानिंग और एक्सरसाइज सुझावों में मदद कर सकता हूं।'
  },
  es: {
    nav: {
      dashboard: 'Panel',
      scanner: 'Escaner',
      meals: 'Comidas',
      coach: 'Coach IA',
      mood: 'Estado',
      water: 'Agua',
      calories: 'Calorias',
      training: 'Entreno',
      grocery: 'Compras',
      profile: 'Perfil',
      logout: 'Salir'
    },
    coachGreeting: 'Hola, soy tu coach de NutriTrack. Preguntame sobre comidas, hidratacion, calorias o entrenamiento.',
    mealAdvice: 'Segun tus calorias restantes, elige proteina magra, carbohidratos lentos y verduras. Buenas opciones: Grilled Chicken Bowl o Salmon & Quinoa.',
    workoutAdvice: 'Prueba una rutina moderada: 10 min de calentamiento, 3 rondas de fuerza y 12 min de cardio.',
    hydrationAdvice: 'La hidratacion mejora el rendimiento. Bebe agua durante el dia y alcanza tu meta diaria.',
    defaultAdvice: 'Puedo ayudarte con ideas de comida, balance calorico, hidratacion, compras y ejercicios.'
  }
};

const TRAINING_LIBRARY = {
  'fat-loss': [
    { title: 'Cardio Intervals', minutes: 28, cal: 320, level: 'Moderate', detail: 'Alternate 1 minute fast and 90 seconds easy. Keep breathing controlled.' },
    { title: 'Incline Walk', minutes: 35, cal: 260, level: 'Low Impact', detail: 'Steady incline walk for a strong calorie burn without heavy joint load.' },
    { title: 'Bodyweight Circuit', minutes: 24, cal: 290, level: 'Moderate', detail: 'Squats, push-ups, lunges, plank. Repeat 4 rounds with short rests.' },
    { title: 'Zone 2 Walk-Jog', minutes: 38, cal: 310, level: 'Steady', detail: 'Alternate comfortable jogs with brisk walking while staying conversational.' },
    { title: 'Low Impact Sweat', minutes: 30, cal: 250, level: 'Beginner', detail: 'Marches, step-ups, mountain climbers, and light core without jumping.' }
  ],
  strength: [
    { title: 'Upper Body Strength', minutes: 40, cal: 240, level: 'Strength', detail: 'Press, row, shoulder work, and core. Keep reps controlled.' },
    { title: 'Lower Body Builder', minutes: 42, cal: 300, level: 'Strength', detail: 'Squats, hinges, lunges, calf raises, and glute bridges.' },
    { title: 'Full Body Lift', minutes: 45, cal: 330, level: 'Advanced', detail: 'One push, one pull, one squat, one hinge, then loaded carry.' },
    { title: 'Core Stability Block', minutes: 25, cal: 160, level: 'Focused', detail: 'Dead bugs, side planks, bird dogs, and slow hollow holds.' },
    { title: 'Dumbbell Hypertrophy', minutes: 44, cal: 310, level: 'Muscle', detail: 'Higher-rep push, pull, squat, and hinge work with clean form.' }
  ],
  mobility: [
    { title: 'Recovery Mobility', minutes: 22, cal: 90, level: 'Easy', detail: 'Hip openers, thoracic rotations, hamstring flows, and slow breathing.' },
    { title: 'Yoga Reset', minutes: 30, cal: 150, level: 'Low', detail: 'Slow flow focused on spine, hips, shoulders, and relaxed nasal breathing.' },
    { title: 'Walk + Stretch', minutes: 35, cal: 180, level: 'Easy', detail: '20 minute walk followed by 15 minutes of full-body stretching.' },
    { title: 'Desk Reset Flow', minutes: 14, cal: 55, level: 'Quick', detail: 'Neck, wrists, hips, and thoracic spine for long study or work blocks.' },
    { title: 'Evening Decompression', minutes: 20, cal: 70, level: 'Calm', detail: 'Slow stretching and breathwork to reduce tension before sleep.' }
  ],
  endurance: [
    { title: 'Tempo Run', minutes: 34, cal: 390, level: 'Endurance', detail: '10 minute warm-up, 16 minute steady tempo, then easy cooldown.' },
    { title: 'Cycling Base Ride', minutes: 50, cal: 420, level: 'Steady', detail: 'Moderate cycling pace focused on breathing and cadence.' },
    { title: 'Rowing Intervals', minutes: 26, cal: 330, level: 'Power', detail: 'Eight rounds of 45 seconds strong rowing and 75 seconds easy.' },
    { title: 'Long Brisk Walk', minutes: 55, cal: 310, level: 'Low Impact', detail: 'A sustainable walk that builds aerobic capacity without stress.' }
  ],
  recovery: [
    { title: 'Active Recovery Walk', minutes: 25, cal: 120, level: 'Recovery', detail: 'Gentle walking to improve circulation and reduce soreness.' },
    { title: 'Breath and Stretch', minutes: 18, cal: 45, level: 'Calm', detail: 'Box breathing, child pose, hip flexor stretch, and spinal rotations.' },
    { title: 'Light Swim Reset', minutes: 24, cal: 180, level: 'Low Impact', detail: 'Easy laps or water walking for joints and recovery.' },
    { title: 'Foam Roll Flow', minutes: 16, cal: 50, level: 'Recovery', detail: 'Quads, calves, glutes, lats, and upper back with slow breathing.' }
  ]
};

/* ══════════════════════════════════════
   UTILITY FUNCTIONS
══════════════════════════════════════ */

/** Show a toast notification */
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type === 'error' ? ' error' : '');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

/** Animate a number from current to target */
function animateNum(el, to, suffix = '') {
  const from = parseInt(el.textContent) || 0;
  const diff = to - from;
  const duration = 600;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    el.textContent = Math.round(from + diff * ease) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Clamp a value between min and max */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/** Percentage helper */
const pct = (val, max) => {
  const safeMax = Number(max) || 0;
  if (safeMax <= 0) return 0;
  return clamp(Math.round((Number(val) / safeMax) * 100), 0, 100);
};

const $ = (id) => document.getElementById(id);

function getTodayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}

function getReadableDate(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey || 'Unknown day';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getInitials(name = 'User') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('') || 'NT';
}

function getFallbackNameFromEmail(email = '') {
  return email.split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase()) || 'NutriTrack User';
}

function isFirebaseConfigured() {
  const config = window.FIREBASE_CONFIG || {};
  const values = [
    config.apiKey,
    config.authDomain,
    config.projectId,
    config.appId
  ];

  return values.every(value => value && !String(value).includes('YOUR_'));
}

function showFirebaseConfigMessage() {
  if ($('auth-provider-status')) {
    $('auth-provider-status').textContent = 'Authentication setup needed';
  }
  showAuthAlert(
    'auth-alert',
    'Authentication is not configured yet. Add your web app config, then refresh.'
  );
}

function getAuthErrorMessage(error) {
  const raw = [
    error?.code,
    error?.message,
    error?.customData?._tokenResponse?.error?.message,
    error?.serverResponse
  ].filter(Boolean).join(' ');
  const code = error?.code || (raw.match(/auth\/[a-z0-9-]+/i)?.[0]) || '';
  const normalized = raw.toLowerCase();

  const messages = {
    'auth/email-already-in-use': 'That email already has an account. Switch to Sign In.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-credential': 'No matching account was found, or the password is wrong. Use Create Account first if this is your first time.',
    'auth/invalid-login-credentials': 'No matching account was found, or the password is wrong. Use Create Account first if this is your first time.',
    'auth/user-not-found': 'No account exists for this email. Switch to Create Account first.',
    'auth/wrong-password': 'That password is incorrect. Please try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
    'auth/unauthorized-domain': 'This domain is not authorized for sign-in. Add this app domain in Firebase Authentication settings.',
    'auth/unauthorized-continue-uri': 'Email verification is blocked because this return link is not authorized in Firebase. Try Resend verification email now.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled in your auth console yet.',
    'auth/too-many-requests': 'Too many attempts. Wait a bit, then try again.',
    'auth/missing-continue-uri': 'Email verification is not configured correctly.'
  };

  if (messages[code]) return messages[code];
  if (normalized.includes('invalid_login_credentials') || normalized.includes('invalid password') || normalized.includes('password_invalid')) {
    return 'The email or password is wrong. If you verified from your phone but forgot the password, use “Forgot password?”.';
  }
  if (normalized.includes('email_not_found')) return 'No account exists for this email. Switch to Create Account first.';
  if (normalized.includes('email_exists')) return 'That email already has an account. Switch to Sign In.';
  if (normalized.includes('too_many_attempts_try_later')) return 'Too many attempts. Wait a bit, then try again.';

  console.error('Authentication error:', error);
  return `Authentication failed${code ? ` (${code})` : raw ? `: ${String(raw).slice(0, 140)}` : ''}.`;
}

async function sendVerificationEmail(user) {
  if (!user || user.emailVerified) return;

  await user.sendEmailVerification();
}

async function checkVerifiedAndContinue() {
  const authClient = getAuthClient();
  const user = authClient?.currentUser;

  if (!authClient || !user) {
    showAuthAlert('auth-alert', 'Please sign in again so we can check your verification status.');
    setVerificationActionsVisible(false);
    return;
  }

  const btn = $('auth-check-verified-btn');
  const defaultLabel = btn?.textContent || 'I verified my email';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Checking...';
  }

  try {
    await user.reload();
    if (!authClient.currentUser.emailVerified) {
      showAuthAlert('auth-alert', 'This email is not verified yet. Open the verification link, then click this button again.');
      return;
    }
    state.auth.pendingVerificationEmail = '';
    setVerificationActionsVisible(false);
    openDashboardForUser(authClient.currentUser);
    toast('Email verified. Welcome in.');
  } catch (error) {
    showAuthAlert('auth-alert', getAuthErrorMessage(error));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = defaultLabel;
    }
  }
}

async function resendVerificationForCurrentUser() {
  const authClient = getAuthClient();
  const user = authClient?.currentUser;
  if (!user) {
    showAuthAlert('auth-alert', 'Please sign in again before resending the verification email.');
    return;
  }

  try {
    await user.reload();
    if (authClient.currentUser.emailVerified) {
      state.auth.pendingVerificationEmail = '';
      openDashboardForUser(authClient.currentUser);
      return;
    }
    await sendVerificationEmail(authClient.currentUser);
    showVerificationPending(authClient.currentUser.email || '', `Verification email resent to ${authClient.currentUser.email}.`);
    toast('Verification email resent');
  } catch (error) {
    showAuthAlert('auth-alert', getAuthErrorMessage(error));
  }
}

async function sendPasswordReset() {
  const authClient = getAuthClient();
  const email = $('auth-email')?.value.trim();
  if (!authClient) {
    showFirebaseConfigMessage();
    return;
  }
  if (!email) {
    showAuthAlert('auth-alert', 'Enter your email first, then click Forgot password.');
    return;
  }

  try {
    await authClient.sendPasswordResetEmail(email);
    showAuthAlert('auth-alert', `Password reset email sent to ${email}.`);
    toast('Password reset email sent');
  } catch (error) {
    showAuthAlert('auth-alert', getAuthErrorMessage(error));
  }
}

function getAuthClient() {
  if (!window.firebase || !window.firebase.auth) {
    return null;
  }

  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(window.FIREBASE_CONFIG);
  }

  return window.firebase.auth();
}

function mapFirebaseUser(user) {
  if (!user) return null;

  return {
    id: user.uid,
    name: user.displayName || getFallbackNameFromEmail(user.email || ''),
    email: user.email || '',
    signedInAt: user.metadata?.lastSignInTime || null
  };
}

function openDashboardForUser(user) {
  state.auth.user = mapFirebaseUser(user);
  resetAppState();
  loadPersistedAppState(user.uid);
  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = state.language;
  applyLanguage();
  updateDashboard();
  updateProfileInputs();
  updateProfileStats();
  renderWaterGlasses();
  updateWater();
  renderStreaks();
  updateIdentityUI();
  $('auth-email').value = user.email || '';
  showApp();
  if (typeof window.navigateTo === 'function') {
    window.navigateTo('dashboard');
  } else {
    state.currentSection = 'dashboard';
  }
}

function getAppStateStorageKey(userId = state.auth.user?.id) {
  return userId ? `${APP_STATE_STORAGE_KEY_PREFIX}:${userId}` : null;
}

function clearPersistedAppState(userId = state.auth.user?.id) {
  const key = getAppStateStorageKey(userId);
  if (!key) return;
  localStorage.removeItem(key);
}

function createDailySnapshot(dateKey = state.currentDate || getTodayKey()) {
  return {
    date: dateKey,
    consumed: {
      calories: Number(state.consumed.calories) || 0,
      protein: Number(state.consumed.protein) || 0,
      carbs: Number(state.consumed.carbs) || 0,
      fat: Number(state.consumed.fat) || 0
    },
    burned: Number(state.burned) || 0,
    water: Number(state.water) || 0,
    hydrationLiters: Number(state.dashboard.hydrationLiters) || 0,
    goals: { ...state.goals },
    savedAt: new Date().toISOString()
  };
}

function hasDailyActivity(snapshot) {
  return Boolean(
    snapshot?.consumed?.calories ||
    snapshot?.consumed?.protein ||
    snapshot?.consumed?.carbs ||
    snapshot?.consumed?.fat ||
    snapshot?.burned ||
    snapshot?.water ||
    snapshot?.hydrationLiters
  );
}

function archiveCurrentDay(dateKey = state.currentDate || getTodayKey()) {
  const snapshot = createDailySnapshot(dateKey);
  if (!hasDailyActivity(snapshot)) return false;

  const history = Array.isArray(state.history) ? state.history : [];
  state.history = [
    snapshot,
    ...history.filter(item => item?.date !== snapshot.date)
  ].slice(0, 60);
  state.dashboard.weeklyCalories = buildWeeklyDataFromHistory();
  return true;
}

function resetDailyTracking() {
  state.consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  state.burned = 0;
  state.water = 0;
  state.dashboard.hydrationLiters = 0;
  state.selectedFood = null;
  state.portionMultiplier = 1;
  state.scanner = {
    ...state.scanner,
    mode: 'idle',
    fileName: '',
    imageData: '',
    imageBlob: null,
    uploadedFile: null,
    isAnalyzing: false,
    detectedFood: null,
    nutrition: null,
    baseResult: null,
    scanWeight: 100,
    errorMessage: ''
  };
}

function applyDailyRollover() {
  const today = getTodayKey();
  if (!state.currentDate) {
    state.currentDate = today;
    return false;
  }

  if (state.currentDate === today) return false;

  const archived = archiveCurrentDay(state.currentDate);
  resetDailyTracking();
  state.currentDate = today;
  return archived;
}

function checkDailyRollover() {
  if (!applyDailyRollover()) return;
  persistAppState();
  updateDashboard();
  updateProfileStats();
  renderWaterGlasses();
  updateWater();
  toast('New day started. Yesterday was saved to your history.');
}

function initDailyRollover() {
  if (!state.currentDate) state.currentDate = getTodayKey();
  setInterval(checkDailyRollover, 60 * 1000);
}

function buildWeeklyDataFromHistory() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = getTodayKey(date);
    const saved = state.history.find(item => item?.date === key);
    const isToday = key === state.currentDate;
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: key,
      consumed: isToday ? state.consumed.calories : Number(saved?.consumed?.calories) || 0,
      burned: isToday ? state.burned : Number(saved?.burned) || 0
    };
  });
}

function getHistoryEntries(limit = 7) {
  const todaySnapshot = createDailySnapshot(getTodayKey());
  const entries = hasDailyActivity(todaySnapshot) ? [todaySnapshot] : [];
  const history = Array.isArray(state.history) ? state.history : [];
  history.forEach(item => {
    if (item?.date && item.date !== todaySnapshot.date) entries.push(item);
  });
  return entries
    .filter(item => item?.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, limit);
}

function resetAppState() {
  state.goals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    water: 8
  };
  state.profile = {
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    dietPreference: '',
    allergies: '',
    goalType: 'maintain',
    targetWeight: '',
    weeklyTarget: '',
    avatarImage: ''
  };
  state.preferences = {
    mealReminders: true,
    waterReminders: true,
    workoutReminders: true,
    weeklySummary: true,
    aiRecommendations: true
  };
  state.dashboard = {
    hydrationLiters: 0,
    weeklyCalories: [],
    weightTrend: []
  };
  state.currentDate = getTodayKey();
  state.history = [];
  state.consumed = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
  state.burned = 0;
  state.water = 0;
  state.groceryChecked = {};
  state.selectedFood = null;
  state.portionMultiplier = 1;
  state.scanner = {
    mode: 'idle',
    fileName: '',
    imageData: '',
    imageBlob: null,
    stream: null,
    uploadedFile: null,
    isAnalyzing: false,
    detectedFood: null,
    nutrition: null,
    baseResult: null,
    scanWeight: 100,
    errorMessage: ''
  };
}

function loadPersistedAppState(userId = state.auth.user?.id) {
  const key = getAppStateStorageKey(userId);
  if (!key) return;

  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (!saved) return;

    if (saved.consumed) {
      state.consumed = {
        calories: Number(saved.consumed.calories) || 0,
        protein: Number(saved.consumed.protein) || 0,
        carbs: Number(saved.consumed.carbs) || 0,
        fat: Number(saved.consumed.fat) || 0
      };
    }

    if (saved.goals) {
      state.goals = {
        calories: Number(saved.goals.calories) || 2000,
        protein: Number(saved.goals.protein) || 150,
        carbs: Number(saved.goals.carbs) || 250,
        fat: Number(saved.goals.fat) || 65,
        water: Number(saved.goals.water) || 8
      };
    }

    if (saved.profile) {
      state.profile = {
        ...state.profile,
        ...saved.profile,
        weight: saved.profile.weight ?? ''
      };
    }

    if (saved.preferences) {
      state.preferences = {
        ...state.preferences,
        ...saved.preferences
      };
    }

    if (saved.dashboard) {
      state.dashboard = {
        ...state.dashboard,
        ...saved.dashboard,
        hydrationLiters: Number(saved.dashboard.hydrationLiters) || 0,
        weeklyCalories: Array.isArray(saved.dashboard.weeklyCalories) ? saved.dashboard.weeklyCalories : [],
        weightTrend: Array.isArray(saved.dashboard.weightTrend) ? saved.dashboard.weightTrend : []
      };
    }

    state.currentDate = saved.currentDate || getTodayKey();
    state.history = Array.isArray(saved.history) ? saved.history : [];
    state.burned = Number(saved.burned) || 0;
    state.water = Number(saved.water) || 0;
    state.groceryChecked = saved.groceryChecked || {};
    state.language = saved.language || state.language || 'en';
    const rolledOver = applyDailyRollover();
    state.dashboard.weeklyCalories = buildWeeklyDataFromHistory();
    if (rolledOver) persistAppState();
  } catch {
    // Ignore malformed saved state.
  }
}

function persistAppState() {
  const key = getAppStateStorageKey();
  if (!key) return;

  localStorage.setItem(key, JSON.stringify({
    goals: state.goals,
    profile: state.profile,
    preferences: state.preferences,
    dashboard: state.dashboard,
    currentDate: state.currentDate || getTodayKey(),
    history: state.history,
    consumed: state.consumed,
    burned: state.burned,
    water: state.water,
    groceryChecked: state.groceryChecked,
    language: state.language
  }));
}

function showAuthAlert(targetId, message = '') {
  const el = $(targetId);
  if (!el) return;
  el.textContent = message;
  el.style.display = message ? 'block' : 'none';
}

function clearAuthAlerts() {
  showAuthAlert('auth-alert', '');
}

function setVerificationActionsVisible(visible) {
  const actions = $('auth-verification-actions');
  if (actions) actions.style.display = visible ? 'grid' : 'none';
  const nameField = $('auth-name-field');
  const passwordField = $('auth-password')?.closest('.auth-field');
  const tabs = document.querySelector('.auth-tabs');
  const resetBtn = $('auth-reset-password-btn');
  const continueBtn = $('auth-continue-btn');
  if (nameField) nameField.style.display = visible ? 'none' : '';
  if (passwordField) passwordField.style.display = visible ? 'none' : '';
  if (tabs) tabs.style.display = visible ? 'none' : '';
  if (resetBtn) resetBtn.style.display = visible ? 'none' : '';
  if (continueBtn) {
    continueBtn.style.display = visible ? 'none' : '';
    continueBtn.textContent = state.auth.mode === 'signup' ? 'Create Account' : 'Sign In';
  }
}

function showVerificationPending(email, message) {
  setAuthMode('signin');
  state.auth.pendingVerificationEmail = email || state.auth.pendingVerificationEmail || '';
  $('auth-email').value = state.auth.pendingVerificationEmail;
  $('auth-password').value = '';
  $('auth-provider-status').textContent = 'Email verification required';
  $('auth-title').textContent = 'Verify your email';
  $('auth-subtitle').textContent = 'Open the verification link we sent, then come back here and continue.';
  $('auth-note').textContent = 'If you verified on your phone, click “I verified my email” on this screen.';
  setVerificationActionsVisible(true);
  showAuthAlert('auth-alert', message || `Verification email sent to ${state.auth.pendingVerificationEmail}.`);
}

function updateIdentityUI() {
  const user = state.auth.user || {};
  const displayName = state.profile.name || user.name || 'User';
  const displayEmail = state.profile.email || user.email || 'Add your email';
  const firstName = (displayName || 'User').split(' ')[0];
  const initials = getInitials(displayName);

  if ($('sidebar-user-name')) $('sidebar-user-name').textContent = displayName;
  if ($('sidebar-user-avatar')) $('sidebar-user-avatar').textContent = initials.slice(0, 1);
  if ($('profile-display-name')) $('profile-display-name').textContent = displayName;
  if ($('profile-email')) $('profile-email').textContent = displayEmail;
  if ($('profile-avatar')) {
    $('profile-avatar').textContent = '';
    if (state.profile.avatarImage) {
      const img = document.createElement('img');
      img.src = state.profile.avatarImage;
      img.alt = `${displayName} profile image`;
      $('profile-avatar').appendChild(img);
    } else {
      $('profile-avatar').textContent = initials;
    }
  }
  if ($('dashboard-greeting')) $('dashboard-greeting').textContent = `Good morning, ${firstName}`;
}

function showAuthStage(stage) {
  $('auth-login-stage').classList.toggle('active', stage === 'login');
}

function showApp() {
  state.auth.isAuthenticated = true;
  $('auth-shell').style.display = 'none';
  $('app-shell').style.display = '';
  clearAuthAlerts();
  updateIdentityUI();
}

function showAuth() {
  state.auth.isAuthenticated = false;
  $('auth-shell').style.display = '';
  $('app-shell').style.display = 'none';
  if (!state.auth.pendingVerificationEmail) clearAuthAlerts();
  if (!state.auth.pendingVerificationEmail) setAuthMode(state.auth.mode || 'signin');
  showAuthStage('login');
}

function setAuthMode(mode) {
  state.auth.mode = mode;
  state.auth.pendingVerificationEmail = '';
  setVerificationActionsVisible(false);
  clearAuthAlerts();
  const tabs = document.querySelector('.auth-tabs');
  const passwordField = $('auth-password')?.closest('.auth-field');
  const resetBtn = $('auth-reset-password-btn');
  if (tabs) tabs.style.display = '';
  if (passwordField) passwordField.style.display = '';
  if (resetBtn) resetBtn.style.display = mode === 'signin' ? '' : 'none';
  if ($('auth-name-field')) $('auth-name-field').style.display = '';
  $('auth-shell').classList.toggle('signup-mode', mode === 'signup');
  document.querySelectorAll('.auth-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.authMode === mode);
  });
  $('auth-title').textContent = mode === 'signup' ? 'Create your account' : 'Welcome back';
  $('auth-subtitle').textContent = mode === 'signup'
    ? 'Create your account, then verify your email before opening the dashboard.'
    : 'Sign in with a verified email to continue to your nutrition dashboard.';
  $('auth-note').textContent = mode === 'signup'
    ? 'We will send a verification link to this email.'
    : 'Use the same email after you click the verification link.';
  $('auth-continue-btn').textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
  $('auth-password').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  if (mode === 'signup') {
    $('auth-name')?.focus();
  }
}

function initAuth() {
  const authTabs = document.querySelector('.auth-tabs');
  const authClient = getAuthClient();
  const authForm = document.querySelector('.auth-form');

  if (authTabs) {
    authTabs.addEventListener('click', (event) => {
      const btn = event.target.closest('.auth-tab');
      if (!btn) return;
      setAuthMode(btn.dataset.authMode || 'signin');
    });
  }

  if (authForm) {
    authForm.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        $('auth-continue-btn').click();
      }
    });
  }

  $('auth-continue-btn').addEventListener('click', async () => {
    clearAuthAlerts();

    if (state.auth.pendingVerificationEmail) {
      await checkVerifiedAndContinue();
      return;
    }

    const name = $('auth-name').value.trim();
    const email = $('auth-email').value.trim();
    const password = $('auth-password').value.trim();

    if (!authClient) {
      showFirebaseConfigMessage();
      return;
    }

    if (state.auth.mode === 'signup' && !name) {
      showAuthAlert('auth-alert', 'Please enter your full name.');
      return;
    }
    if (!email || !password) {
      showAuthAlert('auth-alert', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      showAuthAlert('auth-alert', 'Password should be at least 6 characters.');
      return;
    }

    const continueBtn = $('auth-continue-btn');
    const defaultLabel = continueBtn.textContent;
    continueBtn.disabled = true;
    continueBtn.textContent = state.auth.mode === 'signup' ? 'Creating account...' : 'Signing in...';

    try {
      if (state.auth.mode === 'signup') {
        const credential = await authClient.createUserWithEmailAndPassword(email, password);
        await credential.user.updateProfile({ displayName: name });
        await credential.user.reload();
        await sendVerificationEmail(credential.user);
        showVerificationPending(email, `Verification email sent to ${email}. Open the link, then click “I verified my email.”`);
        toast('Verification email sent');
        return;
      } else {
        const credential = await authClient.signInWithEmailAndPassword(email, password);
        await credential.user.reload();

        if (!credential.user.emailVerified) {
          await sendVerificationEmail(credential.user);
          showVerificationPending(email, `Please verify ${email} first. We sent another verification email.`);
          toast('Verify your email first', 'error');
          return;
        }

        $('auth-password').value = '';
        openDashboardForUser(credential.user);
        toast('Signed in successfully');
      }

    } catch (error) {
      showAuthAlert('auth-alert', getAuthErrorMessage(error));
    } finally {
      continueBtn.disabled = false;
      continueBtn.textContent = state.auth.pendingVerificationEmail ? 'I verified my email' : defaultLabel;
    }
  });

  setAuthMode('signin');
  updateIdentityUI();
  showAuth();

  $('auth-check-verified-btn')?.addEventListener('click', checkVerifiedAndContinue);
  $('auth-resend-verification-btn')?.addEventListener('click', resendVerificationForCurrentUser);
  $('auth-reset-password-btn')?.addEventListener('click', sendPasswordReset);

  if (!authClient) {
    showFirebaseConfigMessage();
    return;
  }

  if ($('auth-provider-status')) $('auth-provider-status').textContent = 'Secure email access';

  authClient.onAuthStateChanged(async (user) => {
    state.auth.isReady = true;

    if (!user) {
      state.auth.user = null;
      state.auth.isAuthenticated = false;
      resetAppState();
      updateDashboard();
      updateProfileStats();
      renderWaterGlasses();
      updateWater();
      renderStreaks();
      updateIdentityUI();
      showAuth();
      return;
    }

    await user.reload();

    if (!user.emailVerified) {
      state.auth.user = null;
      state.auth.isAuthenticated = false;
      $('auth-email').value = user.email || '';
      resetAppState();
      showAuth();
      $('auth-email').value = user.email || '';
      showVerificationPending(user.email || '', `Please verify ${user.email} first, then click “I verified my email.”`);
      return;
    }

    openDashboardForUser(user);
  });
}

function setCameraStatus(message) {
  const el = $('camera-status');
  if (el) el.textContent = message;
}

function showScannerError(message) {
  state.scanner.errorMessage = message;
  setScannerState('error', message);
  toast(message, 'error');
}

function setScannerState(mode, message = '') {
  state.scanner.mode = mode;
  state.scanner.isAnalyzing = mode === 'analyzing';
  if (message) setCameraStatus(message);
  renderPreviewState();
}

function renderPreviewState() {
  const stage = $('camera-stage');
  const openBtn = $('open-camera-btn');
  const captureBtn = $('capture-camera-btn');
  const stopBtn = $('close-camera-btn');
  const scanBtn = $('scan-btn');
  const retakeBtn = $('retake-scan-btn');
  const addBtn = $('add-to-log-btn');
  const hasStream = Boolean(state.scanner.stream);
  const hasImage = Boolean(state.scanner.imageData);
  const hasResult = Boolean(state.scanner.detectedFood);

  if (stage) {
    stage.classList.toggle('live', hasStream && state.scanner.mode === 'camera_ready');
    stage.classList.toggle('has-image', hasImage && state.scanner.mode !== 'camera_ready');
    stage.classList.toggle('analyzing', state.scanner.mode === 'analyzing');
    stage.classList.toggle('scanner-error', state.scanner.mode === 'error');
  }

  if (openBtn) openBtn.disabled = state.scanner.isAnalyzing;
  if (captureBtn) captureBtn.disabled = !hasStream || state.scanner.mode !== 'camera_ready' || state.scanner.isAnalyzing;
  if (stopBtn) stopBtn.disabled = !hasStream || state.scanner.isAnalyzing;
  if (scanBtn) {
    scanBtn.disabled = state.scanner.isAnalyzing || !state.scanner.imageBlob;
    scanBtn.innerHTML = state.scanner.isAnalyzing
      ? `<svg class="scan-anim" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="30" stroke-dashoffset="10"/></svg> Analyzing...`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg> Scan Food`;
  }
  if (retakeBtn) retakeBtn.style.display = hasImage || hasResult || state.scanner.mode === 'error' ? '' : 'none';
  if (addBtn) addBtn.disabled = !hasResult || state.scanner.isAnalyzing;
}

function createScanFormData() {
  if (!state.scanner.imageBlob) {
    throw new Error('No image is ready to scan');
  }

  const formData = new FormData();
  const fileName = state.scanner.fileName || 'food-scan.jpg';
  const imageFile = state.scanner.imageBlob instanceof File
    ? state.scanner.imageBlob
    : new File([state.scanner.imageBlob], fileName, { type: state.scanner.imageBlob.type || 'image/jpeg' });
  formData.append('image', imageFile, fileName);
  formData.append('weight', String(getScannerQuantity()));
  if (state.selectedFood?.name) {
    formData.append('hint', state.selectedFood.name);
  }
  formData.append('dummyIndex', String(getDummyScanIndex()));
  return formData;
}

function getDummyScanIndex() {
  return Number(localStorage.getItem(DUMMY_SCAN_INDEX_KEY)) || 0;
}

function advanceDummyScanIndex() {
  const nextIndex = (getDummyScanIndex() + 1) % 5;
  localStorage.setItem(DUMMY_SCAN_INDEX_KEY, String(nextIndex));
}

function setScannerImage(imageData, fileName = 'camera-capture.jpg', imageBlob = null) {
  const preview = document.getElementById('captured-preview');
  state.scanner.imageData = imageData;
  state.scanner.fileName = fileName;
  state.scanner.imageBlob = imageBlob;
  state.scanner.uploadedFile = fileName;
  state.scanner.detectedFood = null;
  state.scanner.nutrition = null;
  state.scanner.baseResult = null;
  state.scanner.scanWeight = getScannerQuantity();
  state.scanner.errorMessage = '';
  state.selectedFood = null;
  document.querySelectorAll('.food-chip').forEach(c => c.classList.remove('active'));
  if (preview) preview.src = imageData;
  setScannerState('image_selected', `Image ready: ${fileName}. Analyzing food...`);
}

function stopCameraStream() {
  const video = document.getElementById('camera-preview');

  if (state.scanner.stream) {
    state.scanner.stream.getTracks().forEach(track => track.stop());
    state.scanner.stream = null;
  }

  if (video) {
    video.pause();
    video.srcObject = null;
  }

  renderPreviewState();
}

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showScannerError('Camera API is not supported in this browser. Upload an image instead.');
    return;
  }

  const video = $('camera-preview');
  const preview = $('captured-preview');
  if (!video) return;

  setScannerState('opening', 'Opening camera...');
  stopCameraStream();
  state.scanner.imageData = '';
  state.scanner.fileName = '';
  state.scanner.imageBlob = null;
  state.scanner.detectedFood = null;
  state.scanner.nutrition = null;
  state.scanner.baseResult = null;
  state.selectedFood = null;
  if (preview) preview.removeAttribute('src');
  $('scanner-result')?.style.setProperty('display', 'none');
  document.querySelectorAll('.food-chip').forEach(c => c.classList.remove('active'));

  try {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
    } catch (error) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    state.scanner.stream = stream;
    video.srcObject = stream;
    await video.play();
    setScannerState('camera_ready', 'Camera ready. Capture a clear, well-lit food photo.');
  } catch (error) {
    stopCameraStream();
    const message = error?.name === 'NotAllowedError'
      ? 'Unable to access camera. Please allow camera permission or upload an image.'
      : error?.name === 'NotFoundError'
        ? 'No camera was found on this device. Upload an image instead.'
        : 'Unable to access camera. Upload an image or try again.';
    showScannerError(message);
  }
}

async function captureFrame() {
  const video = $('camera-preview');
  if (!state.scanner.stream || !video) {
    showScannerError('Camera is not ready yet. Open the camera first.');
    return;
  }

  setScannerState('capturing', 'Capturing image...');
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);
  const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  if (!imageBlob) {
    showScannerError('Capture failed. Please retake the photo.');
    return;
  }
  const imageData = URL.createObjectURL(imageBlob);
  stopCameraStream();
  setScannerImage(imageData, 'camera-capture.jpg', imageBlob);
  document.querySelector('#upload-zone .upload-text').textContent = 'Camera capture ready';
  await analyzeFoodImage();
}

function isValidFoodImage(file) {
  return file && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
}

function handleImageUpload(file) {
  if (!isValidFoodImage(file)) {
    showScannerError('Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    stopCameraStream();
    setScannerImage(reader.result, file.name, file);
    document.querySelector('#upload-zone .upload-text').textContent = file.name;
    await analyzeFoodImage();
  };
  reader.onerror = () => showScannerError('Could not read this image. Try another file.');
  reader.readAsDataURL(file);
}

function resetScannerFlow() {
  stopCameraStream();
  state.scanner.imageData = '';
  state.scanner.fileName = '';
  state.scanner.imageBlob = null;
  state.scanner.uploadedFile = null;
  state.scanner.detectedFood = null;
  state.scanner.nutrition = null;
  state.scanner.baseResult = null;
  state.scanner.scanWeight = 100;
  state.scanner.errorMessage = '';
  state.selectedFood = null;
  state.portionMultiplier = 1;
  $('captured-preview')?.removeAttribute('src');
  $('scanner-result')?.style.setProperty('display', 'none');
  const quantity = $('scanner-quantity');
  if (quantity) quantity.value = '100';
  document.querySelector('#upload-zone .upload-text').textContent = 'Drop food image here or click to browse';
  document.querySelectorAll('.portion-btn').forEach((btn, index) => btn.classList.toggle('active', index === 1));
  document.querySelectorAll('.food-chip').forEach(c => c.classList.remove('active'));
  setScannerState('idle', 'Use your camera or upload a food image to scan it.');
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function initNav() {
  // Sidebar nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.section);
      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Mobile bottom nav
  document.querySelectorAll('.mob-nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.section));
  });

  // Hamburger toggle
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  window.navigateTo = function(section) {
    // Update sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + section).classList.add('active');

    // Update nav highlights
    document.querySelectorAll('.nav-item, .mob-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    // Update topbar title
    document.getElementById('topbar-title').textContent = getSectionLabel(section);

    if (section !== 'scanner') {
      stopCameraStream();
    }

    state.currentSection = section;
  };
}

function getSectionLabel(section) {
  const labels = TRANSLATIONS[state.language]?.nav || TRANSLATIONS.en.nav;
  return labels[section] || section;
}

function applyLanguage() {
  const labels = TRANSLATIONS[state.language]?.nav || TRANSLATIONS.en.nav;
  const copy = {
    en: {
      dashboard: ['Dashboard', "Here's your nutrition overview for today"],
      scanner: ['AI Food Scanner', 'Use your camera or upload a photo to get estimated nutrition data'],
      meals: ['Smart Meal Planner', 'Personalised meals based on your calorie goals'],
      coach: ['AI Nutrition Coach', 'Ask about meals, calories, hydration, workouts, or use another language'],
      mood: ['Mood-Based Food', "Choose how you're feeling and get tailored food suggestions"],
      water: ['Water Intake', 'Stay hydrated throughout the day'],
      calories: ['Calorie Balance', 'Consumed vs burned visualisation'],
      training: ['Exercise Recommendations', 'Training suggestions based on your nutrition balance and goal'],
      grocery: ['Smart Grocery List', 'Auto-generated based on your meal plan'],
      profile: ['Health Control Center', 'Manage your body data, goals, AI recommendations, and privacy settings'],
      logout: ['Ready to sign out?', 'Your local NutriTracker progress and preferences are saved for this account.']
    },
    hi: {
      dashboard: ['डैशबोर्ड', 'आज का आपका न्यूट्रिशन ओवरव्यू'],
      scanner: ['AI फूड स्कैनर', 'फोटो अपलोड करें या कैमरा इस्तेमाल करें'],
      meals: ['स्मार्ट मील प्लानर', 'आपके कैलोरी लक्ष्य के अनुसार मील सुझाव'],
      coach: ['AI न्यूट्रिशन कोच', 'मील, कैलोरी, पानी या वर्कआउट पूछें'],
      mood: ['मूड-बेस्ड फूड', 'अपने मूड के अनुसार फूड सुझाव पाएं'],
      water: ['वाटर इनटेक', 'दिन भर हाइड्रेटेड रहें'],
      calories: ['कैलोरी बैलेंस', 'खाई और बर्न की गई कैलोरी देखें'],
      training: ['एक्सरसाइज सुझाव', 'आपके न्यूट्रिशन बैलेंस के अनुसार ट्रेनिंग'],
      grocery: ['स्मार्ट ग्रोसरी लिस्ट', 'आपके मील प्लान से बनी लिस्ट'],
      profile: ['हेल्थ कंट्रोल सेंटर', 'अपना हेल्थ डेटा, लक्ष्य और AI सुझाव मैनेज करें'],
      logout: ['लॉग आउट करना है?', 'आपकी प्रगति और सेटिंग्स इस अकाउंट के लिए सेव हैं।']
    },
    es: {
      dashboard: ['Panel', 'Resumen de nutricion de hoy'],
      scanner: ['Escaner IA', 'Usa la camara o sube una foto'],
      meals: ['Planificador de Comidas', 'Comidas segun tus metas de calorias'],
      coach: ['Coach de Nutricion IA', 'Pregunta sobre comidas, calorias, agua o entreno'],
      mood: ['Comida por Estado', 'Elige como te sientes y recibe sugerencias'],
      water: ['Agua', 'Mantente hidratado durante el dia'],
      calories: ['Balance de Calorias', 'Visualiza consumido vs quemado'],
      training: ['Recomendaciones de Ejercicio', 'Entreno segun tu balance nutricional'],
      grocery: ['Lista de Compras', 'Generada desde tu plan de comidas'],
      profile: ['Centro de Salud', 'Gestiona datos, metas, IA y privacidad'],
      logout: ['Quieres salir?', 'Tu progreso y preferencias estan guardados para esta cuenta.']
    }
  }[state.language] || {};

  document.querySelectorAll('.nav-item, .mob-nav-item').forEach(item => {
    const label = item.querySelector('.nav-label, span:last-child');
    if (label && labels[item.dataset.section]) label.textContent = labels[item.dataset.section];
  });
  Object.entries(copy).forEach(([section, values]) => {
    const root = document.getElementById(`section-${section}`);
    if (!root) return;
    const title = root.querySelector('.section-title');
    const sub = root.querySelector('.section-sub');
    if (title && values[0]) title.textContent = section === 'dashboard' ? title.textContent : values[0];
    if (sub && values[1]) sub.textContent = values[1];
  });
  const topbarTitle = document.getElementById('topbar-title');
  if (topbarTitle) topbarTitle.textContent = getSectionLabel(state.currentSection);
  renderCoachWelcome();
  renderCoachInsights();
}

function initLanguage() {
  const select = document.getElementById('language-select');
  if (!select) return;
  select.value = state.language;
  select.addEventListener('change', () => {
    state.language = select.value;
    persistAppState();
    applyLanguage();
    toast(`Language set to ${select.options[select.selectedIndex].text}`);
  });
  applyLanguage();
}

/* ══════════════════════════════════════
   TOPBAR DATE
══════════════════════════════════════ */
function initDate() {
  const el = document.getElementById('topbar-date');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getWeeklyChartData() {
  return buildWeeklyDataFromHistory();
}

/* ══════════════════════════════════════
   DASHBOARD
══════════════════════════════════════ */
function updateDashboard() {
  renderDashboardData();

  // Calorie balance section update
  updateCalorieBalance();
  renderBarChart();
  renderStreaks();
  renderCoachInsights();
  renderAiMealPlan();
  renderTrainingRecommendations();
}

function getDashboardHydrationGoalLiters() {
  return Math.max(0.25, (Number(state.goals.water) || 8) * 0.25);
}

function getDashboardStatus() {
  const caloriePct = pct(state.consumed.calories, state.goals.calories);
  if (!state.consumed.calories) return { label: 'Ready to Track', tone: '', status: 'No meals logged yet' };
  if (caloriePct > 100) return { label: 'Exceeded Target', tone: 'danger', status: 'Exceeded target' };
  if (caloriePct >= 85) return { label: 'Near Your Goal', tone: 'warning', status: 'Near your goal' };
  return { label: 'On Track Today', tone: 'success', status: 'On track today' };
}

function renderDashboardData() {
  const remaining = Math.max(state.goals.calories - state.consumed.calories, 0);
  const caloriePct = pct(state.consumed.calories, state.goals.calories);
  const status = getDashboardStatus();
  const dateLabel = $('dashboard-date-label');
  if (dateLabel) dateLabel.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  animateNum($('dash-consumed'), state.consumed.calories);
  animateNum($('dash-burned'), state.burned);
  animateNum($('dash-goal'), state.goals.calories);
  animateNum($('dash-remaining'), remaining);
  setText('dash-consumed-status', state.consumed.calories ? `${caloriePct}% of daily goal` : 'No meals logged yet');
  setText('dash-remaining-status', remaining ? `${remaining} kcal available` : 'Goal reached');

  const badge = $('dashboard-status-badge');
  if (badge) {
    badge.textContent = status.label;
    badge.className = `profile-pill ${status.tone === 'success' ? 'success' : status.tone === 'warning' ? 'blue' : ''}`;
  }

  updateMacroBars();
  updateCalorieRing();
  renderDashboardInsights();
  renderDashboardCharts();
  renderHistory();
  renderMealSuggestions();
  renderDashboardSummary();
  renderDashboardHydration();
}

function updateMacroBars() {
  const macroRows = [
    ['protein', state.consumed.protein, state.goals.protein, 'pb-protein', 'm-protein', 'macro-protein-pct'],
    ['carbs', state.consumed.carbs, state.goals.carbs, 'pb-carbs', 'm-carbs', 'macro-carbs-pct'],
    ['fat', state.consumed.fat, state.goals.fat, 'pb-fat', 'm-fat', 'macro-fat-pct']
  ];

  macroRows.forEach(([name, current, target, barId, valueId, pctId]) => {
    const percent = pct(current, target);
    const bar = $(barId);
    if (bar) bar.style.width = `${percent}%`;
    setText(valueId, `${Math.round(current)}g / ${target}g`);
    setText(pctId, `${percent}%`);
  });

  const waterGoal = getDashboardHydrationGoalLiters();
  const waterPct = pct(state.dashboard.hydrationLiters, waterGoal);
  const waterBar = $('pb-dashboard-water');
  if (waterBar) waterBar.style.width = `${waterPct}%`;
  setText('m-water', `${state.dashboard.hydrationLiters.toFixed(1)}L / ${waterGoal.toFixed(1)}L`);
  setText('macro-water-pct', `${waterPct}%`);
  setText('protein-hint', state.consumed.protein ? (pct(state.consumed.protein, state.goals.protein) < 70 ? 'Add a high-protein snack today.' : 'Protein is moving well today.') : 'Log food to track protein.');
}

function updateCalorieRing() {
  const ringPct = pct(state.consumed.calories, state.goals.calories);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (ringPct / 100) * circumference;
  const ring = $('ring-fg');
  if (ring) ring.style.strokeDashoffset = offset.toFixed(1);
  setText('ring-pct', `${ringPct}%`);
  setText('ring-values', `${state.consumed.calories} / ${state.goals.calories} kcal`);
  const status = getDashboardStatus();
  setText('ring-status-text', status.status);
  setText('ring-status-pill', status.label);
}

function renderDashboardInsights() {
  const container = $('dashboard-ai-insights');
  if (!container) return;
  const remaining = Math.max(state.goals.calories - state.consumed.calories, 0);
  const waterGoal = getDashboardHydrationGoalLiters();
  const waterGap = Math.max(0, waterGoal - state.dashboard.hydrationLiters);
  const proteinPct = pct(state.consumed.protein, state.goals.protein);
  const fatPct = pct(state.consumed.fat, state.goals.fat);
  const hasData = state.consumed.calories || state.dashboard.hydrationLiters || state.burned;
  const insights = hasData ? [
    {
      tone: proteinPct < 70 ? 'warning' : 'good',
      icon: 'PRO',
      title: proteinPct < 70 ? 'Protein is below target' : 'Protein is on pace',
      body: proteinPct < 70 ? 'Add a protein-rich snack or meal to improve recovery.' : `${proteinPct}% of your protein target is complete.`
    },
    {
      tone: remaining > 350 ? 'good' : remaining ? 'warning' : 'critical',
      icon: 'KCAL',
      title: remaining > 350 ? 'Room for a balanced meal' : remaining ? 'Near your calorie goal' : 'Calorie target reached',
      body: remaining ? `${remaining} kcal remaining today.` : 'Choose lighter options for the rest of the day.'
    },
    {
      tone: waterGap > 0.5 ? 'warning' : 'good',
      icon: 'H2O',
      title: waterGap > 0 ? 'Hydration needs attention' : 'Hydration target complete',
      body: waterGap > 0 ? `${waterGap.toFixed(1)}L left to reach your water target.` : 'Great hydration pace today.'
    },
    {
      tone: fatPct > 100 ? 'critical' : 'good',
      icon: 'FAT',
      title: fatPct > 100 ? 'Fat target exceeded' : 'Fat intake is controlled',
      body: fatPct > 100 ? 'Choose leaner foods for your next meal.' : `${fatPct}% of fat target used.`
    }
  ] : [{
    tone: 'info',
    icon: 'AI',
    title: 'Start logging to unlock insights',
    body: 'Add a meal or water entry and AI guidance will update instantly.'
  }];
  container.innerHTML = insights.map(item => `
    <div class="insight-card ${item.tone === 'good' ? 'good' : item.tone === 'critical' ? 'critical' : 'warning'}">
      <span class="profile-pill ${item.tone === 'good' ? 'success' : 'blue'}">${item.icon}</span>
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </div>
  `).join('');
}

function renderDashboardCharts() {
  const weeklyChart = $('dashboard-weekly-chart');
  if (weeklyChart) {
    const weekly = getWeeklyChartData();
    const max = Math.max(...weekly.map(item => item.consumed), state.goals.calories, 1);
    weeklyChart.innerHTML = weekly.map(item => `
      <div class="bar-item">
        <span class="bar-fill" style="height:${Math.max(8, Math.round((item.consumed / max) * 160))}px"></span>
        <span class="bar-label">${item.day[0]}</span>
      </div>
    `).join('');
  }

  const totalMacros = state.consumed.protein + state.consumed.carbs + state.consumed.fat;
  const donut = $('dashboard-macro-donut');
  const legend = $('dashboard-macro-legend');
  if (donut && legend) {
    if (!totalMacros) {
      donut.style.background = 'conic-gradient(rgba(255,255,255,0.08) 0 100%)';
      legend.innerHTML = '<div class="legend-row"><span>No macros logged</span><strong>0%</strong></div>';
    } else {
      const protein = Math.round((state.consumed.protein / totalMacros) * 100);
      const carbs = Math.round((state.consumed.carbs / totalMacros) * 100);
      const fat = Math.max(0, 100 - protein - carbs);
      donut.style.background = `conic-gradient(var(--green) 0 ${protein}%, var(--blue) ${protein}% ${protein + carbs}%, var(--orange) ${protein + carbs}% 100%)`;
      legend.innerHTML = [
        ['Protein', protein, 'var(--green)'],
        ['Carbs', carbs, 'var(--blue)'],
        ['Fat', fat, 'var(--orange)']
      ].map(([label, value, color]) => `<div class="legend-row"><span><i style="background:${color}"></i>${label}</span><strong>${value}%</strong></div>`).join('');
    }
  }

  const weightChart = $('dashboard-weight-chart');
  if (weightChart) {
    const weight = Number(state.profile.weight) || 0;
    const target = Number(state.profile.targetWeight) || 0;
    if (!weight) {
      weightChart.innerHTML = '<div class="chart-empty">Add weight in Profile</div>';
      return;
    }
    const end = target || weight;
    const values = Array.from({ length: 6 }, (_, i) => Math.round((weight + ((end - weight) * i / 5)) * 10) / 10);
    const min = Math.min(...values);
    const max = Math.max(...values);
    weightChart.innerHTML = values.map((value, i) => {
      const y = 72 - ((value - min) / Math.max(1, max - min)) * 72;
      return `<div class="line-point"><span class="point-dot" style="--y:${y}px"></span><span class="point-label">W${i + 1}</span></div>`;
    }).join('');
  }
}

function renderHistory() {
  const entries = getHistoryEntries(10);
  const targets = ['dashboard-history-list', 'profile-history-list']
    .map(id => $(id))
    .filter(Boolean);
  if (!targets.length) return;

  const empty = `
    <div class="history-empty">
      <strong>No history yet</strong>
      <span>Log meals, water, or workouts today. Tomorrow, today’s summary will appear here automatically.</span>
    </div>
  `;

  const markup = entries.length ? entries.map(item => {
    const consumed = item.consumed || {};
    const goal = Number(item.goals?.calories) || state.goals.calories || 2000;
    const progress = pct(consumed.calories || 0, goal);
    const net = Math.max(0, (Number(consumed.calories) || 0) - (Number(item.burned) || 0));
    return `
      <div class="history-row">
        <div class="history-date">
          <strong>${getReadableDate(item.date)}</strong>
          <span>${item.date === getTodayKey() ? 'Today' : item.date}</span>
        </div>
        <div class="history-metrics">
          <span><b>${Math.round(consumed.calories || 0)}</b> kcal</span>
          <span><b>${Math.round(consumed.protein || 0)}g</b> protein</span>
          <span><b>${Number(item.hydrationLiters || 0).toFixed(1)}L</b> water</span>
          <span><b>${Math.round(net)}</b> net</span>
        </div>
        <div class="history-progress" aria-label="${progress}% of calorie goal">
          <i style="width:${progress}%"></i>
        </div>
      </div>
    `;
  }).join('') : empty;

  targets.forEach(target => {
    target.innerHTML = markup;
  });
}

function renderMealSuggestions() {
  const container = $('meal-suggestion');
  if (!container) return;
  const remaining = Math.max(state.goals.calories - state.consumed.calories, 0);
  const proteinLow = pct(state.consumed.protein, state.goals.protein) < 70;
  const suggestion = !state.consumed.calories
    ? { emoji: '🥣', title: 'Start with a balanced meal', body: 'Log breakfast, lunch, or a snack to personalize the next suggestion.', kcal: '--', protein: '--', type: 'Starter' }
    : proteinLow
      ? { emoji: '🍗', title: 'High-protein meal', body: 'Pick lean protein with vegetables to improve recovery and satiety.', kcal: Math.min(remaining || 400, 520), protein: '35g+', type: 'Protein' }
      : remaining > 550
        ? { emoji: '🍛', title: 'Balanced dinner', body: 'You have room for protein, slow carbs, and vegetables.', kcal: 500, protein: '28g', type: 'Balanced' }
        : { emoji: '🥗', title: 'Low-calorie snack', body: 'Stay light for the rest of the day while keeping nutrients high.', kcal: 220, protein: '12g', type: 'Light' };
  container.innerHTML = `
    <div class="meal-suggestion">
      <span class="meal-icon">${suggestion.emoji}</span>
      <h4>${suggestion.title}</h4>
      <p>${suggestion.body}</p>
      <div class="meal-suggestion-meta">
        <span>${suggestion.kcal} kcal</span>
        <span>${suggestion.protein}</span>
        <span>${suggestion.type}</span>
      </div>
    </div>
  `;
}

function renderDashboardSummary() {
  const container = $('dashboard-summary-list');
  if (!container) return;
  const calorieStatus = getDashboardStatus().label;
  const proteinStatus = pct(state.consumed.protein, state.goals.protein) >= 70 ? 'On pace' : 'Low';
  const hydrationGoal = getDashboardHydrationGoalLiters();
  const hydrationStatus = pct(state.dashboard.hydrationLiters, hydrationGoal) >= 80 ? 'On pace' : 'Needs improvement';
  const nextStep = !state.consumed.calories ? 'Add your first meal' : proteinStatus === 'Low' ? 'Add protein' : hydrationStatus !== 'On pace' ? 'Add water' : 'Keep balance';
  setText('dashboard-best-step', nextStep);
  container.innerHTML = [
    ['Status', calorieStatus],
    ['Protein', proteinStatus],
    ['Hydration', hydrationStatus],
    ['Best next step', nextStep]
  ].map(([label, value]) => `<div class="summary-item"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function renderDashboardHydration() {
  const goal = getDashboardHydrationGoalLiters();
  const current = Math.min(state.dashboard.hydrationLiters, goal);
  const percent = pct(current, goal);
  const fill = $('hydration-fill');
  if (fill) fill.style.height = `${percent}%`;
  setText('hydration-value', `${state.dashboard.hydrationLiters.toFixed(1)}L / ${goal.toFixed(1)}L`);
  const gap = Math.max(0, goal - state.dashboard.hydrationLiters);
  setText('hydration-status', gap ? `Needs ${gap.toFixed(1)}L` : 'Goal complete');
}

function addWater(amountLiters) {
  const goal = getDashboardHydrationGoalLiters();
  state.dashboard.hydrationLiters = Math.min(goal, Math.round((state.dashboard.hydrationLiters + amountLiters) * 100) / 100);
  state.water = Math.round(state.dashboard.hydrationLiters / 0.25);
  persistAppState();
  updateDashboard();
  renderWaterGlasses();
  updateWater();
  toast(`Added ${(amountLiters * 1000).toFixed(0)} ml water`);
}

/** Quick-add food grid on dashboard */
function initQuickAdd() {
  const grid = document.getElementById('quick-food-grid');
  if (!grid) return;
  grid.innerHTML = '';
  FOODS.slice(0, 8).forEach(food => {
    const el = document.createElement('div');
    el.className = 'quick-food-item';
    el.innerHTML = `
      <div class="qf-top">
        <span class="qf-emoji">${food.emoji}</span>
        <span class="qf-category">${food.category}</span>
      </div>
      <span class="qf-name">${food.name}</span>
      <span class="qf-cal">${food.cal} kcal</span>
      <div class="qf-actions">
        <select class="qf-serving" aria-label="${food.name} serving">
          <option value="0.5">0.5x</option>
          <option value="1" selected>1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
        <button class="qf-add" type="button">Add</button>
      </div>
    `;
    el.querySelector('.qf-add').addEventListener('click', event => {
      event.stopPropagation();
      addFood(food, Number(el.querySelector('.qf-serving').value) || 1);
    });
    grid.appendChild(el);
  });

  document.querySelectorAll('[data-water-add]').forEach(btn => {
    btn.addEventListener('click', () => addWater(Number(btn.dataset.waterAdd) || 0));
  });
}

/** Add a food item to daily log */
function addFood(food, multiplier = 1) {
  const cal = Math.round(food.cal * multiplier);
  const prot = Math.round(food.protein * multiplier);
  const carb = Math.round(food.carbs * multiplier);
  const fat = Math.round(food.fat * multiplier);

  state.consumed.calories += cal;
  state.consumed.protein += prot;
  state.consumed.carbs += carb;
  state.consumed.fat += fat;

  persistAppState();
  updateDashboard();
  toast(`✅ Added ${food.name} (${cal} kcal)`);
}

/* ══════════════════════════════════════
   FOOD SCANNER
══════════════════════════════════════ */
function initScanner() {
  const chips = document.getElementById('food-chips');
  const zone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('food-file');
  const quantityInput = document.getElementById('scanner-quantity');

  if (!chips || !zone || !fileInput) return;
  chips.innerHTML = '';
  FOODS.forEach(food => {
    const chip = document.createElement('div');
    chip.className = 'food-chip';
    chip.textContent = `${food.emoji} ${food.name}`;
    chip.dataset.id = food.id;
    chip.addEventListener('click', () => {
      document.querySelectorAll('.food-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedFood = food;
      state.scanner.baseResult = null;
      state.scanner.detectedFood = null;
      state.scanner.nutrition = null;
      document.getElementById('scanner-result').style.display = 'none';
      setScannerState(state.scanner.imageBlob ? 'image_selected' : 'idle', `${food.name} selected. Click Scan Food to view nutrition.`);
    });
    chips.appendChild(chip);
  });

  zone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleImageUpload(e.target.files[0]));

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleImageUpload(e.dataTransfer.files[0]);
  });

  document.getElementById('open-camera-btn')?.addEventListener('click', openCamera);
  document.getElementById('capture-camera-btn')?.addEventListener('click', captureFrame);
  document.getElementById('close-camera-btn')?.addEventListener('click', () => {
    stopCameraStream();
    setScannerState(state.scanner.imageData ? 'image_selected' : 'idle', 'Camera stopped. You can reopen it or upload an image.');
  });
  document.getElementById('retake-scan-btn')?.addEventListener('click', resetScannerFlow);

  document.getElementById('scan-btn').addEventListener('click', async () => {
    if (!state.scanner.imageBlob) {
      showScannerError('Please upload an image or capture a photo first.');
      return;
    }
    await analyzeFoodImage();
  });

  document.querySelectorAll('.portion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.portion-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.portionMultiplier = parseFloat(btn.dataset.mul);
      if (quantityInput) quantityInput.value = String(Math.round(100 * state.portionMultiplier));
      if (state.scanner.baseResult) updateScanResult();
    });
  });

  quantityInput?.addEventListener('input', () => {
    updatePortionSelection();
    if (state.scanner.baseResult) updateScanResult();
  });

  document.getElementById('add-to-log-btn')?.addEventListener('click', addScannedFoodToLog);
  renderPreviewState();
}

function getScannerQuantity() {
  return Math.max(10, Math.min(2000, Number($('scanner-quantity')?.value) || 100));
}

function updatePortionSelection() {
  const quantity = getScannerQuantity();
  state.portionMultiplier = quantity / 100;
  document.querySelectorAll('.portion-btn').forEach(btn => {
    btn.classList.toggle('active', Math.abs(Number(btn.dataset.mul) - state.portionMultiplier) < 0.01);
  });
}

async function analyzeFoodImage() {
  if (state.scanner.isAnalyzing) return;

  if (!state.scanner.imageBlob) {
    showScannerError('Add a food image before scanning.');
    return;
  }

  try {
    setScannerState('analyzing', 'Analyzing food...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(SCAN_API_ENDPOINT, {
      method: 'POST',
      body: createScanFormData(),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(errorPayload?.error || 'Scan request failed');
    }

    const data = await response.json();
    const result = normalizeScanResponse(data);
    if (!result.recognized) {
      throw new Error('Food not recognized clearly');
    }

    state.scanner.scanWeight = getScannerQuantity();
    state.scanner.baseResult = result;
    state.scanner.detectedFood = result;
    if (result.source === 'dummy-scan') advanceDummyScanIndex();
    document.querySelectorAll('.food-chip').forEach(c => {
      c.classList.remove('active');
    });
    updateScanResult();
    document.getElementById('scanner-result').style.display = 'block';
    setScannerState('success', 'Scan complete. Review the estimate and add it to your daily log.');
    toast(`${result.foodName} detected`);
  } catch (error) {
    const message = error?.name === 'AbortError'
      ? 'Scan timed out. Try a clearer image or scan again.'
      : error?.message === 'Food not recognized clearly'
        ? 'Food not recognized clearly. Try a closer, brighter image.'
        : error?.message || 'Scan failed, try again.';
    showScannerError(message);
  }
}

function normalizeScanResponse(data) {
  return {
    foodName: data.foodName || 'Food not recognized',
    emoji: data.emoji || '🍽️',
    calories: Number(data.calories) || 0,
    protein: Number(data.protein) || 0,
    carbs: Number(data.carbs) || 0,
    fat: Number(data.fat) || 0,
    insight: data.insight || 'Nutrition estimate generated from your scan.',
    healthScore: data.healthScore,
    recognized: data.recognized !== false && Boolean(data.foodName),
    source: data.source || 'scan'
  };
}

function showSelectedFoodInfo(food) {
  state.scanner.scanWeight = 100;
  state.scanner.baseResult = {
    foodName: food.name,
    emoji: food.emoji,
    calories: Number(food.cal) || 0,
    protein: Number(food.protein) || 0,
    carbs: Number(food.carbs) || 0,
    fat: Number(food.fat) || 0,
    insight: `${food.name} selected. Adjust the quantity to update calories and macros.`,
    healthScore: null,
    recognized: true,
    source: 'selected-food'
  };
  state.scanner.detectedFood = state.scanner.baseResult;
  updateScanResult();
  document.getElementById('scanner-result').style.display = 'block';
  setScannerState(state.scanner.imageBlob ? 'image_selected' : 'success', `${food.name} nutrition loaded. Adjust quantity or add it to your daily log.`);
}

function updateScanResult() {
  if (!state.scanner.baseResult) return;
  const scaled = scaleNutritionByQuantity(state.scanner.baseResult);
  state.scanner.nutrition = scaled;
  document.getElementById('result-name').textContent = `${scaled.emoji} ${scaled.foodName}`;
  document.getElementById('result-portion').textContent = `${getScannerQuantity()}g serving`;
  document.getElementById('result-note').textContent = scaled.insight;
  document.getElementById('res-cal').textContent  = Math.round(scaled.calories) + ' kcal';
  document.getElementById('res-prot').textContent = Number(scaled.protein).toFixed(1).replace('.0', '') + 'g';
  document.getElementById('res-carb').textContent = Number(scaled.carbs).toFixed(1).replace('.0', '') + 'g';
  document.getElementById('res-fat').textContent  = Number(scaled.fat).toFixed(1).replace('.0', '') + 'g';
  renderPreviewState();
}

function scaleNutritionByQuantity(result) {
  const factor = getScannerQuantity() / Math.max(1, state.scanner.scanWeight || getScannerQuantity());
  return {
    ...result,
    calories: Math.round(Number(result.calories || 0) * factor),
    protein: Math.round(Number(result.protein || 0) * factor * 10) / 10,
    carbs: Math.round(Number(result.carbs || 0) * factor * 10) / 10,
    fat: Math.round(Number(result.fat || 0) * factor * 10) / 10
  };
}

async function addScannedFoodToLog() {
  const food = state.scanner.nutrition;
  if (!food) {
    showScannerError('Scan a valid food before adding it to your daily log.');
    return;
  }

  const addBtn = $('add-to-log-btn');
  if (addBtn) addBtn.disabled = true;

  const payload = {
    foodName: food.foodName,
    calories: Math.round(food.calories),
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    weight: getScannerQuantity(),
    insight: food.insight,
    healthScore: food.healthScore,
    loggedAt: new Date().toISOString()
  };

  try {
    const response = await fetch(LOG_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error('Log request failed');
    }

    addFood({
      name: payload.foodName,
      cal: payload.calories,
      protein: payload.protein,
      carbs: payload.carbs,
      fat: payload.fat
    }, 1);
    document.getElementById('scanner-result').style.display = 'none';
    resetScannerFlow();
    toast(`${payload.foodName} added to daily log`);
  } catch (error) {
    if (addBtn) addBtn.disabled = false;
    showScannerError('Could not save to daily log. Please try again.');
  }
}

/* ══════════════════════════════════════
   MEAL RECOMMENDATIONS
══════════════════════════════════════ */
function initMeals() {
  renderMeals('all');
  renderAiMealPlan();

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMeals(btn.dataset.filter);
    });
  });

  // Generate weekly plan
  document.getElementById('gen-weekly-btn').addEventListener('click', () => {
    renderAiMealPlan(true);
    toast('AI meal plan generated');
  });
}

function buildAiMealPlan() {
  const goal = document.getElementById('meal-plan-goal')?.value || 'balanced';
  const remaining = Math.max(state.goals.calories - state.consumed.calories + Math.round(state.burned * 0.35), 900);
  const targets = {
    breakfast: Math.round(remaining * 0.28),
    lunch: Math.round(remaining * 0.34),
    dinner: Math.round(remaining * 0.3),
    snack: Math.round(remaining * 0.08)
  };

  return ['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
    const options = MEALS
      .filter(meal => meal.type === type)
      .sort((a, b) => {
        const proteinBias = goal === 'high-protein' ? b.protein - a.protein : 0;
        const lightBias = goal === 'light' ? a.cal - b.cal : 0;
        return Math.abs(a.cal - targets[type]) - Math.abs(b.cal - targets[type]) + proteinBias + lightBias;
      });
    return options[0];
  }).filter(Boolean);
}

function renderAiMealPlan(force = false) {
  const container = document.getElementById('ai-meal-plan');
  if (!container) return;

  const plan = buildAiMealPlan();
  const total = plan.reduce((sum, meal) => sum + meal.cal, 0);
  const protein = plan.reduce((sum, meal) => sum + meal.protein, 0);
  const remaining = Math.max(state.goals.calories - state.consumed.calories, 0);

  container.innerHTML = `
    <div class="glass-card ai-plan-summary">
      <div>
        <span class="plan-kicker">AI Meal Plan</span>
        <h3>${total} kcal planned</h3>
        <p>${protein}g protein. Built around ${remaining} kcal remaining today.</p>
      </div>
      <button class="btn-ghost" id="sync-ai-plan-btn" type="button">Sync Grocery</button>
    </div>
    <div class="ai-plan-grid">
      ${plan.map(meal => `
        <div class="ai-plan-card">
          <span class="meal-type-tag ${meal.type}">${meal.type}</span>
          <div class="ai-plan-title">${meal.emoji} ${meal.name}</div>
          <p>${meal.ingredients.join(', ')}</p>
          <div class="meal-macros-row">
            <span class="meal-macro">${meal.cal} kcal</span>
            <span class="meal-macro">P ${meal.protein}g</span>
            <span class="meal-macro">C ${meal.carbs}g</span>
          </div>
        </div>
      `).join('')}
    </div>`;

  document.getElementById('sync-ai-plan-btn')?.addEventListener('click', () => {
    initGroceryFromMeals(plan.map(meal => meal.id));
    navigateTo('grocery');
  });

  if (force) renderCoachInsights();
}

function renderMeals(filter) {
  const grid = document.getElementById('meal-grid');
  grid.innerHTML = '';
  const filtered = filter === 'all' ? MEALS : MEALS.filter(m => m.type === filter);

  filtered.forEach((meal, i) => {
    const bgColors = {
      breakfast: 'linear-gradient(135deg, rgba(255,140,66,0.15), rgba(255,140,66,0.05))',
      lunch:     'linear-gradient(135deg, rgba(16,233,138,0.15), rgba(16,233,138,0.05))',
      dinner:    'linear-gradient(135deg, rgba(76,201,240,0.15), rgba(76,201,240,0.05))',
      snack:     'linear-gradient(135deg, rgba(199,125,255,0.15), rgba(199,125,255,0.05))',
    };
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.style.animationDelay = (i * 0.05) + 's';
    card.innerHTML = `
      <div class="meal-card-img" style="background:${bgColors[meal.type]}">
        <span style="font-size:3rem">${meal.emoji}</span>
      </div>
      <div class="meal-card-body">
        <div class="meal-name">${meal.name}</div>
        <span class="meal-type-tag ${meal.type}">${meal.type}</span>
        <div class="meal-macros-row">
          <span class="meal-macro">P: ${meal.protein}g</span>
          <span class="meal-macro">C: ${meal.carbs}g</span>
          <span class="meal-macro">F: ${meal.fat}g</span>
        </div>
        <div class="meal-footer">
          <span class="meal-cal">${meal.cal} kcal</span>
          <button class="meal-add-btn" title="Add to log" data-meal-id="${meal.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // Bind add buttons
  grid.querySelectorAll('.meal-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const meal = MEALS.find(m => m.id === parseInt(btn.dataset.mealId));
      if (meal) {
        // Add meal as a food log item
        state.consumed.calories += meal.cal;
        state.consumed.protein += meal.protein;
        state.consumed.carbs += meal.carbs;
        state.consumed.fat += meal.fat;
        persistAppState();
        updateDashboard();
        toast(`🍽️ ${meal.name} added (${meal.cal} kcal)`);
        // Animate button
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => btn.style.transform = '', 300);
      }
    });
  });
}

/* ══════════════════════════════════════
   AI COACH
══════════════════════════════════════ */
function initCoach() {
  renderCoachWelcome();
  renderCoachInsights();

  document.getElementById('chat-send-btn')?.addEventListener('click', sendChatMessage);
  document.getElementById('chat-input')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') sendChatMessage();
  });
  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chat-input').value = btn.dataset.chatPrompt;
      sendChatMessage();
    });
  });
}

function renderCoachWelcome() {
  const messages = document.getElementById('chat-messages');
  if (!messages || messages.dataset.ready === 'true') return;
  messages.dataset.ready = 'true';
  addChatBubble(TRANSLATIONS[state.language].coachGreeting, 'bot');
}

function addChatBubble(text, type = 'bot') {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}`;
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function getCoachReply(message) {
  const text = message.toLowerCase();
  const copy = TRANSLATIONS[state.language] || TRANSLATIONS.en;
  const remaining = Math.max(state.goals.calories - state.consumed.calories, 0);

  if (/meal|food|eat|protein|dinner|lunch|breakfast|मील|खाना|comida/.test(text)) {
    return `${copy.mealAdvice} You have about ${remaining} kcal left today.`;
  }
  if (/workout|exercise|training|run|gym|एक्सरसाइज|entreno/.test(text)) {
    return copy.workoutAdvice;
  }
  if (/water|hydration|drink|पानी|agua/.test(text)) {
    return `${copy.hydrationAdvice} Current progress: ${state.water}/${state.goals.water} glasses.`;
  }
  if (/calorie|balance|कैलोरी|caloria/.test(text)) {
    const net = state.consumed.calories - state.burned;
    return `Today: ${state.consumed.calories} kcal consumed, ${state.burned} kcal burned, net ${net} kcal. Keep your goal near ${state.goals.calories} kcal.`;
  }
  return copy.defaultAdvice;
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input?.value.trim();
  if (!message) return;
  addChatBubble(message, 'user');
  input.value = '';
  setTimeout(() => addChatBubble(getCoachReply(message), 'bot'), 250);
}

function renderCoachInsights() {
  const container = document.getElementById('coach-insights');
  if (!container) return;

  const remaining = Math.max(state.goals.calories - state.consumed.calories, 0);
  const waterPct = pct(state.water, state.goals.water);
  const proteinPct = pct(state.consumed.protein, state.goals.protein);
  container.innerHTML = `
    <div class="coach-insight"><span>Calories left</span><strong>${remaining} kcal</strong></div>
    <div class="coach-insight"><span>Protein progress</span><strong>${proteinPct}%</strong></div>
    <div class="coach-insight"><span>Hydration progress</span><strong>${waterPct}%</strong></div>
    <div class="coach-insight muted">Tip: ask the coach for meals, water, workouts, or calorie balance.</div>`;
}

/* ══════════════════════════════════════
   MOOD FOOD
══════════════════════════════════════ */
function initMood() {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentMood = btn.dataset.mood;
      renderMoodFoods(state.currentMood);
    });
  });

  renderMoodFoods('energetic');
}

function renderMoodFoods(mood) {
  const data = MOOD_FOODS[mood];
  const header = document.getElementById('mood-result-header');
  header.innerHTML = `<h3>${data.label}</h3><p>${data.desc}</p>`;

  const grid = document.getElementById('mood-food-grid');
  grid.innerHTML = '';
  data.foods.forEach((food, i) => {
    const card = document.createElement('div');
    card.className = 'mood-food-card';
    card.style.animationDelay = (i * 0.06) + 's';
    card.innerHTML = `
      <span class="mood-food-emoji">${food.emoji}</span>
      <div class="mood-food-name">${food.name}</div>
      <div class="mood-food-desc">${food.desc}</div>`;
    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════
   WATER TRACKER
══════════════════════════════════════ */
function initWater() {
  renderWaterGlasses();

  document.getElementById('water-add').addEventListener('click', () => {
    if (state.water < state.goals.water) {
      state.water++;
      updateWater();
      persistAppState();
      toast(`💧 Water logged! (${state.water}/${state.goals.water} glasses)`);
    } else {
      toast('🎉 Daily water goal reached!');
    }
  });

  document.getElementById('water-remove').addEventListener('click', () => {
    if (state.water > 0) {
      state.water--;
      updateWater();
      persistAppState();
    }
  });

  updateWater();
}

function renderWaterGlasses() {
  const grid = document.getElementById('water-glasses-grid');
  if (!grid) return;

  const goal = Math.max(1, Math.round(Number(state.goals.water) || 8));
  state.goals.water = goal;
  state.water = clamp(Math.round(Number(state.water) || 0), 0, goal);
  grid.innerHTML = '';

  for (let i = 0; i < goal; i++) {
    const glass = document.createElement('div');
    glass.className = 'water-glass ' + (i < state.water ? 'filled' : 'empty');
    glass.id = 'glass-' + i;
    glass.textContent = '💧';
    grid.appendChild(glass);
  }
}

function updateWater() {
  const goal = Math.max(1, Math.round(Number(state.goals.water) || 8));
  const water = clamp(Math.round(Number(state.water) || 0), 0, goal);
  state.goals.water = goal;
  state.water = water;
  state.dashboard.hydrationLiters = Math.round(water * 0.25 * 100) / 100;
  const p = pct(water, goal);

  const grid = document.getElementById('water-glasses-grid');
  if (grid && grid.children.length !== goal) renderWaterGlasses();

  // Update UI elements
  setText('water-consumed', water);
  setText('water-unit', `/ ${goal} ${goal === 1 ? 'glass' : 'glasses'}`);
  setText('water-liters', `${state.dashboard.hydrationLiters.toFixed(1)}L`);
  const progress = document.getElementById('pb-water');
  const fill = document.getElementById('water-fill');
  if (progress) progress.style.width = p + '%';
  if (fill) fill.style.height = p + '%';

  // Update glasses
  for (let i = 0; i < goal; i++) {
    const g = document.getElementById('glass-' + i);
    if (g) g.className = 'water-glass ' + (i < water ? 'filled' : 'empty');
  }

  renderDashboardHydration();
}

/* ══════════════════════════════════════
   CALORIE BALANCE
══════════════════════════════════════ */
function initCalorieBalance() {
  renderBarChart();
  renderExerciseChips();
}

function renderBarChart() {
  const chart = document.getElementById('bar-chart');
  chart.innerHTML = '';
  const weeklyData = getWeeklyChartData();
  const maxCal = Math.max(state.goals.calories, state.consumed.calories, state.burned, 100);

  weeklyData.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'bar-day';

    const cH = Math.round((day.consumed / maxCal) * 140);
    const bH = Math.round((day.burned / maxCal) * 140);

    dayEl.innerHTML = `
      <div class="bar-group">
        <div class="bar-col consumed" style="height:0px" data-h="${cH}"></div>
        <div class="bar-col burned"   style="height:0px" data-h="${bH}"></div>
      </div>
      <span class="bar-day-label">${day.day}</span>`;
    chart.appendChild(dayEl);
  });

  // Animate bars on next tick (for CSS transition)
  setTimeout(() => {
    chart.querySelectorAll('.bar-col').forEach(col => {
      col.style.height = col.dataset.h + 'px';
    });
  }, 100);
}

function updateCalorieBalance() {
  const { consumed, burned, goals } = state;
  const maxVal = Math.max(goals.calories, consumed.calories, 100);
  const net = consumed.calories - burned;

  const cp = pct(consumed.calories, maxVal);
  const bp = pct(burned, maxVal);
  const np = pct(Math.abs(net), maxVal);

  const balCon = document.getElementById('bal-consumed');
  const balBurned = document.getElementById('bal-burned');
  const balNet = document.getElementById('bal-net');
  const conNum = document.getElementById('bal-con-num');
  const burnNum = document.getElementById('bal-burn-num');
  const netNum = document.getElementById('bal-net-num');

  if (balCon) { balCon.style.width = cp + '%'; conNum.textContent = consumed.calories; }
  if (balBurned) { balBurned.style.width = bp + '%'; burnNum.textContent = burned; }
  if (balNet) { balNet.style.width = np + '%'; netNum.textContent = (net >= 0 ? '+' : '') + net; }
}

function renderStreaks() {
  const container = document.getElementById('streak-list');
  if (!container) return;

  const streaks = [
    {
      icon: '💧',
      name: 'Hydration',
      detail: `${state.water} of ${state.goals.water} glasses today`,
      pct: pct(state.water, state.goals.water)
    },
    {
      icon: '🥗',
      name: 'Nutrition Goal',
      detail: `${state.consumed.calories} of ${state.goals.calories} kcal logged`,
      pct: pct(state.consumed.calories, state.goals.calories)
    },
    {
      icon: '🏃',
      name: 'Exercise',
      detail: state.burned > 0 ? `${state.burned} kcal burned today` : 'No exercise logged yet',
      pct: state.burned > 0 ? Math.min(Math.round((state.burned / 500) * 100), 100) : 0
    }
  ];

  container.innerHTML = '';
  streaks.forEach(item => {
    const row = document.createElement('div');
    row.className = 'streak-item';
    row.innerHTML = `
      <span class="streak-icon">${item.icon}</span>
      <div class="streak-info"><span class="streak-name">${item.name}</span><span class="streak-days">${item.detail}</span></div>
      <div class="streak-bar"><div class="streak-fill" style="width:${item.pct}%"></div></div>`;
    container.appendChild(row);
  });
}

function renderExerciseChips() {
  const container = document.getElementById('exercise-chips');
  if (!container) return;
  container.innerHTML = '';
  EXERCISES.forEach(ex => {
    const chip = document.createElement('div');
    chip.className = 'exercise-chip';
    chip.textContent = `${ex.name} (+${ex.cal} kcal)`;
    chip.addEventListener('click', () => {
      state.burned += ex.cal;
      persistAppState();
      animateNum(document.getElementById('dash-burned'), state.burned);
      updateDashboard();
      toast(`🔥 ${ex.name.replace(/.*\s/,'')}: +${ex.cal} kcal burned!`);
    });
    container.appendChild(chip);
  });
}

function initTraining() {
  renderTrainingRecommendations();
  document.getElementById('refresh-training-btn')?.addEventListener('click', renderTrainingRecommendations);
  document.getElementById('training-goal')?.addEventListener('change', renderTrainingRecommendations);
  document.getElementById('training-intensity')?.addEventListener('change', renderTrainingRecommendations);
}

function renderTrainingRecommendations() {
  const grid = document.getElementById('training-grid');
  if (!grid) return;

  const goal = document.getElementById('training-goal')?.value || 'fat-loss';
  const intensity = document.getElementById('training-intensity')?.value || 'moderate';
  const multiplier = intensity === 'low' ? 0.78 : intensity === 'high' ? 1.18 : 1;
  const consumedPct = pct(state.consumed.calories, state.goals.calories);

  grid.innerHTML = TRAINING_LIBRARY[goal].map((item, index) => {
    const cal = Math.round(item.cal * multiplier);
    const minutes = Math.round(item.minutes * (intensity === 'high' ? 0.9 : intensity === 'low' ? 0.85 : 1));
    const note = consumedPct > 85
      ? 'Good fit after a higher-calorie day.'
      : consumedPct < 35
        ? 'Keep intensity controlled until you eat more.'
        : 'Balanced with your current nutrition.';

    return `
      <div class="training-card" style="animation-delay:${index * 0.05}s">
        <div class="training-card-top">
          <span class="plan-kicker">${item.level}</span>
          <strong>${minutes} min</strong>
        </div>
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
        <div class="training-meta">
          <span>${cal} kcal estimate</span>
          <span>${note}</span>
        </div>
        <button class="btn-primary training-log-btn" data-cal="${cal}" data-title="${item.title}" type="button">Log Workout</button>
      </div>`;
  }).join('');

  grid.querySelectorAll('.training-log-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cal = parseInt(btn.dataset.cal);
      state.burned += cal;
      persistAppState();
      updateDashboard();
      updateCalorieBalance();
      renderStreaks();
      renderCoachInsights();
      toast(`${btn.dataset.title} logged: ${cal} kcal burned`);
    });
  });
}

/* ══════════════════════════════════════
   GROCERY LIST
══════════════════════════════════════ */
function initGrocery() {
  renderGroceryMealSelect();

  document.getElementById('gen-grocery-btn').addEventListener('click', generateGroceryList);
  document.getElementById('add-custom-grocery-btn')?.addEventListener('click', addCustomGroceryItem);
  document.getElementById('custom-grocery-item')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCustomGroceryItem();
    }
  });
  document.getElementById('clear-grocery-btn').addEventListener('click', () => {
    document.getElementById('grocery-categories').innerHTML = `
      <div class="grocery-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <p>No items yet. Generate a list from your meals.</p>
      </div>`;
    state.groceryChecked = {};
    persistAppState();
    toast('Grocery list cleared');
  });
}

function addCustomGroceryItem() {
  const input = document.getElementById('custom-grocery-item');
  const raw = input?.value.trim();
  if (!raw) {
    toast('Write a grocery item first', 'error');
    return;
  }

  const amountMatch = raw.match(/(\d+\s?(g|kg|ml|l|pcs?|pieces?|pack|packs|cups?|bottles?))$/i);
  const amount = amountMatch ? amountMatch[1] : '1 portion';
  const name = raw.replace(amountMatch?.[0] || '', '').trim() || raw;
  const existing = document.getElementById('grocery-categories');
  const current = existing?.querySelector('.grocery-category.custom-category');
  const row = document.createElement('div');
  const key = `custom:${name}:${Date.now()}`;
  row.className = 'grocery-item';
  row.innerHTML = `
    <div class="gi-check"></div>
    <span class="gi-name">${name}</span>
    <span class="gi-amount">${amount}</span>`;
  row.addEventListener('click', () => {
    state.groceryChecked[key] = !state.groceryChecked[key];
    row.classList.toggle('checked');
    row.querySelector('.gi-check').textContent = state.groceryChecked[key] ? '✓' : '';
    persistAppState();
  });

  if (existing?.querySelector('.grocery-empty')) existing.innerHTML = '';
  let category = current;
  if (!category) {
    category = document.createElement('div');
    category.className = 'grocery-category custom-category';
    category.innerHTML = '<div class="grocery-category-name">Custom Items</div>';
    existing.appendChild(category);
  }
  category.appendChild(row);
  input.value = '';
  toast(`${name} added to grocery list`);
}

function renderGroceryMealSelect() {
  const container = document.getElementById('grocery-meal-select');
  container.innerHTML = '';
  MEALS.forEach(meal => {
    const item = document.createElement('div');
    item.className = 'grocery-meal-option';
    item.innerHTML = `
      <input type="checkbox" id="gm-${meal.id}" data-meal-id="${meal.id}">
      <label for="gm-${meal.id}">${meal.emoji} ${meal.name}</label>
      <span style="font-size:0.72rem;color:var(--text-3)">${meal.cal} kcal</span>`;
    container.appendChild(item);
  });
}

function initGroceryFromMeals(mealIds = null) {
  document.querySelectorAll('#grocery-meal-select input[type="checkbox"]').forEach(cb => {
    cb.checked = Array.isArray(mealIds) ? mealIds.includes(parseInt(cb.dataset.mealId)) : true;
  });
  generateGroceryList();
}

function generateGroceryList() {
  const checked = document.querySelectorAll('#grocery-meal-select input:checked');
  if (checked.length === 0) { toast('Select at least one meal', 'error'); return; }

  // Collect all ingredients
  const allIngredients = [];
  checked.forEach(cb => {
    const meal = MEALS.find(m => m.id === parseInt(cb.dataset.mealId));
    if (meal) allIngredients.push(...meal.ingredients);
  });

  // Deduplicate
  const unique = [...new Set(allIngredients)];

  // Categorise
  const categories = {};
  unique.forEach(ing => {
    const food = FOODS.find(f => f.name === ing);
    const cat = food ? food.category : 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ name: ing, amount: getAmount(ing) });
  });

  renderGroceryCategories(categories);
  toast(`📝 Generated ${unique.length} grocery items!`);
}

function getAmount(name) {
  const amounts = {
    'Grilled Chicken': '500g', 'Avocado Toast': '2 slices', 'Greek Salad': '1 bowl',
    'Brown Rice': '300g', 'Salmon Fillet': '400g', 'Banana': '3 pieces',
    'Scrambled Eggs': '4 eggs', 'Oatmeal': '200g', 'Mixed Berries': '250g',
    'Quinoa Bowl': '250g', 'Almonds': '100g', 'Sweet Potato': '2 medium',
    'Paneer Tikka': '300g', 'Dal Tadka': '500g', 'Roti': '6 pieces',
    'Curd Bowl': '400g', 'Tofu Stir Fry': '350g', 'Apple': '4 pieces',
    'Whey Shake': '4 scoops', 'Vegetable Poha': '400g'
  };
  return amounts[name] || '1 portion';
}

function renderGroceryCategories(categories) {
  const container = document.getElementById('grocery-categories');
  container.innerHTML = '';

  Object.entries(categories).forEach(([cat, items]) => {
    const catEl = document.createElement('div');
    catEl.className = 'grocery-category';
    catEl.innerHTML = `<div class="grocery-category-name">${cat}</div>`;

    items.forEach(item => {
      const key = item.name;
      const checked = state.groceryChecked[key] || false;
      const row = document.createElement('div');
      row.className = 'grocery-item' + (checked ? ' checked' : '');
      row.innerHTML = `
        <div class="gi-check">${checked ? '✓' : ''}</div>
        <span class="gi-name">${item.name}</span>
        <span class="gi-amount">${item.amount}</span>`;
      row.addEventListener('click', () => {
        state.groceryChecked[key] = !state.groceryChecked[key];
        row.classList.toggle('checked');
        const chk = row.querySelector('.gi-check');
        chk.textContent = state.groceryChecked[key] ? '✓' : '';
        persistAppState();
      });
      catEl.appendChild(row);
    });

    container.appendChild(catEl);
  });
}

/* ══════════════════════════════════════
   PROFILE / SETTINGS
══════════════════════════════════════ */
function updateProfileStats() {
  const calorieEl = $('profile-calorie-goal');
  const weightEl = $('profile-weight');
  const waterEl = $('profile-water-goal');

  if (calorieEl) calorieEl.textContent = state.goals.calories;
  if (weightEl) weightEl.textContent = state.profile.weight ? `${state.profile.weight}kg` : '--';
  if (waterEl) waterEl.textContent = state.goals.water;
  updateHealthProfileDashboard();
}

function getNumberValue(id) {
  const el = $(id);
  return el ? Number(el.value) || 0 : 0;
}

function getFieldValue(id) {
  const el = $(id);
  return el ? el.value.trim() : '';
}

function getActivityMultiplier(level = state.profile.activityLevel) {
  return {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9
  }[level] || 1.35;
}

function calculateHealthMetrics() {
  const age = Number(state.profile.age) || 0;
  const height = Number(state.profile.height) || 0;
  const weight = Number(state.profile.weight) || 0;
  const heightM = height / 100;
  const bmi = heightM && weight ? weight / (heightM * heightM) : 0;
  const bmrBase = height && weight && age ? (10 * weight) + (6.25 * height) - (5 * age) : 0;
  const bmr = bmrBase ? Math.round(bmrBase + (state.profile.gender === 'female' ? -161 : 5)) : 0;
  const maintenance = bmr ? Math.round(bmr * getActivityMultiplier()) : 0;
  const goalType = state.profile.goalType;
  const recommendedCalories = maintenance
    ? Math.max(1200, maintenance + (goalType === 'fat-loss' ? -450 : goalType === 'muscle-gain' ? 300 : 0))
    : Number(state.goals.calories) || 2000;
  const waterGoal = weight ? Math.max(6, Math.round((weight * 35) / 250)) : Number(state.goals.water) || 8;
  const proteinGoal = weight ? Math.round(weight * (goalType === 'muscle-gain' ? 2 : 1.6)) : Number(state.goals.protein) || 150;

  return { bmi, bmr, maintenance, recommendedCalories, waterGoal, proteinGoal };
}

function getBmiStatus(bmi) {
  if (!bmi) return 'Add height and weight';
  if (bmi < 18.5) return 'Below healthy range';
  if (bmi < 25) return 'Healthy range';
  if (bmi < 30) return 'Slightly above range';
  return 'High range';
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function updateProfileInputs() {
  const user = state.auth.user || {};
  if (!state.profile.name && user.name) state.profile.name = user.name;
  if (!state.profile.email && user.email) state.profile.email = user.email;
  const values = {
    'set-full-name': state.profile.name || user.name || '',
    'set-email': state.profile.email || user.email || '',
    'set-age': state.profile.age,
    'set-gender': state.profile.gender,
    'set-height': state.profile.height,
    'set-weight': state.profile.weight,
    'set-activity-level': state.profile.activityLevel,
    'set-diet-preference': state.profile.dietPreference,
    'set-allergies': state.profile.allergies,
    'set-goal-type': state.profile.goalType || 'maintain',
    'set-target-weight': state.profile.targetWeight,
    'set-weekly-target': state.profile.weeklyTarget,
    'set-calorie-goal': state.goals.calories,
    'set-protein-goal': state.goals.protein,
    'set-carbs-goal': state.goals.carbs,
    'set-fat-goal': state.goals.fat,
    'set-water-goal': state.goals.water
  };

  Object.entries(values).forEach(([id, value]) => {
    const el = $(id);
    if (el) el.value = value ?? '';
  });

  document.querySelectorAll('.pref-toggle').forEach(input => {
    input.checked = state.preferences[input.dataset.pref] !== false;
  });
}

function syncProfileFromInputs() {
  state.profile.name = getFieldValue('set-full-name');
  state.profile.email = getFieldValue('set-email');
  state.profile.age = getFieldValue('set-age');
  state.profile.gender = getFieldValue('set-gender');
  state.profile.height = getFieldValue('set-height');
  state.profile.weight = getFieldValue('set-weight');
  state.profile.activityLevel = getFieldValue('set-activity-level');
  state.profile.dietPreference = getFieldValue('set-diet-preference');
  state.profile.allergies = getFieldValue('set-allergies');
  state.profile.goalType = getFieldValue('set-goal-type') || 'maintain';
  state.profile.targetWeight = getFieldValue('set-target-weight');
  state.profile.weeklyTarget = getFieldValue('set-weekly-target');
  state.goals.calories = getNumberValue('set-calorie-goal') || 2000;
  state.goals.protein = getNumberValue('set-protein-goal') || 150;
  state.goals.carbs = getNumberValue('set-carbs-goal') || 250;
  state.goals.fat = getNumberValue('set-fat-goal') || 65;
  state.goals.water = getNumberValue('set-water-goal') || 8;
}

function getProfileCompletion() {
  const required = [
    ['name', 'Add full name'],
    ['email', 'Add email'],
    ['age', 'Add age'],
    ['gender', 'Add gender'],
    ['height', 'Add height'],
    ['weight', 'Add weight'],
    ['activityLevel', 'Add activity level'],
    ['dietPreference', 'Add diet preference'],
    ['allergies', 'Add allergies or health notes'],
    ['targetWeight', 'Set target weight']
  ];
  const missing = required.filter(([key]) => !String(state.profile[key] || '').trim()).map(([, label]) => label);
  const complete = required.length - missing.length;
  return { percent: Math.round((complete / required.length) * 100), missing };
}

function updateCompletion() {
  const { percent, missing } = getProfileCompletion();
  setText('completion-percent', `${percent}%`);
  setText('completion-ring-label', `${percent}%`);
  const ring = $('completion-ring');
  if (ring) ring.style.setProperty('--completion', `${percent}%`);
  const bar = $('completion-bar-fill');
  if (bar) bar.style.width = `${percent}%`;
  const list = $('missing-list');
  if (!list) return;
  list.innerHTML = '';
  const items = missing.length ? missing.slice(0, 5) : ['Profile complete. AI recommendations are fully personalized.'];
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
}

function updateGoalSummary(metrics) {
  const weight = Number(state.profile.weight) || 0;
  const target = Number(state.profile.targetWeight) || 0;
  const weekly = Number(state.profile.weeklyTarget) || 0;
  const delta = Math.abs(weight - target);
  const weeks = delta && weekly ? Math.ceil(delta / weekly) : 0;
  setText('goal-timeline', weeks ? `${weeks} weeks` : '--');
  setText('goal-calorie-target', `${metrics.recommendedCalories} kcal`);
  setText('goal-weekly-summary', weekly ? `${weekly} kg / week` : '--');
  setText('profile-health-status', state.profile.goalType === 'fat-loss' ? 'Fat loss focus' : state.profile.goalType === 'muscle-gain' ? 'Muscle gain focus' : 'Balanced focus');
}

function renderProfileCharts(metrics) {
  const weightChart = $('weight-chart');
  if (weightChart) {
    const weight = Number(state.profile.weight) || 72;
    const target = Number(state.profile.targetWeight) || weight - 2;
    const values = Array.from({ length: 6 }, (_, i) => Math.round((weight + ((target - weight) * i / 5)) * 10) / 10);
    const min = Math.min(...values);
    const max = Math.max(...values);
    weightChart.innerHTML = values.map((value, i) => {
      const range = Math.max(1, max - min);
      const y = 72 - ((value - min) / range) * 72;
      return `<div class="line-point"><span class="point-dot" style="--y:${y}px"></span><span class="point-label">W${i + 1}</span></div>`;
    }).join('');
  }

  const calorieChart = $('calorie-chart');
  if (calorieChart) {
    const base = state.goals.calories || metrics.recommendedCalories || 2000;
    const values = [0.82, 0.95, 0.88, 1.02, 0.91, 0.78, 0.97].map(item => Math.round(base * item));
    const max = Math.max(...values, base);
    calorieChart.innerHTML = values.map((value, i) => `
      <div class="bar-item">
        <span class="bar-fill" style="height:${Math.max(8, Math.round((value / max) * 160))}px"></span>
        <span class="bar-label">${['M','T','W','T','F','S','S'][i]}</span>
      </div>
    `).join('');
  }

  const totalMacros = Math.max(1, state.goals.protein + state.goals.carbs + state.goals.fat);
  const protein = Math.round((state.goals.protein / totalMacros) * 100);
  const carbs = Math.round((state.goals.carbs / totalMacros) * 100);
  const fat = Math.max(0, 100 - protein - carbs);
  const donut = $('macro-donut');
  if (donut) {
    donut.style.background = `conic-gradient(var(--green) 0 ${protein}%, var(--blue) ${protein}% ${protein + carbs}%, var(--orange) ${protein + carbs}% 100%)`;
  }
  const legend = $('macro-legend');
  if (legend) {
    legend.innerHTML = [
      ['Protein', protein, 'var(--green)'],
      ['Carbs', carbs, 'var(--blue)'],
      ['Fat', fat, 'var(--orange)']
    ].map(([label, value, color]) => `<div class="legend-row"><span><i style="background:${color}"></i>${label}</span><strong>${value}%</strong></div>`).join('');
  }
}

function renderProfileInsights(metrics) {
  const container = $('profile-ai-insights');
  if (!container) return;
  const proteinPct = Math.round((state.consumed.protein / Math.max(1, state.goals.protein)) * 100);
  const waterLeft = Math.max(0, state.goals.water - state.water);
  const caloriePct = Math.round((state.consumed.calories / Math.max(1, state.goals.calories)) * 100);
  const insights = [
    {
      tone: proteinPct >= 80 ? 'good' : 'warning',
      icon: proteinPct >= 80 ? '✓' : '!',
      title: proteinPct >= 80 ? 'Protein is close to target' : 'Protein intake is lower than recommended',
      body: proteinPct >= 80 ? `You are at ${proteinPct}% of your protein target.` : `You are at ${proteinPct}% of target. Add lean protein in the next meal.`
    },
    {
      tone: waterLeft ? 'critical' : 'good',
      icon: waterLeft ? 'H2O' : '✓',
      title: waterLeft ? 'Hydration is below target' : 'Hydration target complete',
      body: waterLeft ? `${waterLeft} glasses left today. Set water reminders if you miss this often.` : 'Water intake is on track for today.'
    },
    {
      tone: caloriePct > 105 ? 'warning' : 'good',
      icon: 'AI',
      title: caloriePct > 105 ? 'Calories are above your plan' : 'Calories are close to plan',
      body: `${state.consumed.calories} of ${state.goals.calories} kcal logged today.`
    },
    {
      tone: metrics.bmi && metrics.bmi >= 25 ? 'warning' : 'good',
      icon: 'BMI',
      title: metrics.bmi ? getBmiStatus(metrics.bmi) : 'BMI needs profile data',
      body: metrics.bmi ? `Current BMI estimate is ${metrics.bmi.toFixed(1)}.` : 'Add height and weight for BMI analysis.'
    },
    {
      tone: state.profile.activityLevel ? 'good' : 'warning',
      icon: 'STR',
      title: state.profile.activityLevel ? 'Training context is set' : 'Increase strength training frequency',
      body: state.profile.activityLevel ? `Activity level: ${state.profile.activityLevel}.` : 'Set activity level so workouts and calories adapt to you.'
    }
  ];
  container.innerHTML = insights.map(item => `
    <div class="insight-card ${item.tone}">
      <span class="profile-pill ${item.tone === 'good' ? 'success' : item.tone === 'critical' ? '' : 'blue'}">${item.icon}</span>
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </div>
  `).join('');
}

function updateHealthProfileDashboard() {
  const metrics = calculateHealthMetrics();
  setText('metric-bmi', metrics.bmi ? metrics.bmi.toFixed(1) : '--');
  setText('metric-bmi-status', getBmiStatus(metrics.bmi));
  setText('metric-bmr', metrics.bmr ? `${metrics.bmr} kcal` : '--');
  setText('metric-calorie-need', metrics.maintenance ? `${metrics.maintenance} kcal` : '--');
  setText('metric-water-goal', `${metrics.waterGoal} glasses`);
  setText('metric-protein-goal', `${metrics.proteinGoal}g`);
  updateCompletion();
  updateGoalSummary(metrics);
  renderProfileCharts(metrics);
  renderProfileInsights(metrics);
  renderHistory();
}

function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.profile.avatarImage = reader.result;
    updateIdentityUI();
    persistAppState();
    toast('Profile image updated');
  };
  reader.readAsDataURL(file);
}

function exportProfileData() {
  const payload = JSON.stringify({
    exportedAt: new Date().toISOString(),
    goals: state.goals,
    profile: state.profile,
    preferences: state.preferences,
    consumed: state.consumed,
    burned: state.burned,
    water: state.water
  }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nutritrack-profile-data.json';
  link.click();
  URL.revokeObjectURL(url);
  toast('Data export prepared');
}

function downloadHealthReport() {
  const metrics = calculateHealthMetrics();
  const rows = [
    ['Generated', new Date().toLocaleString()],
    ['Name', state.profile.name || state.auth.user?.name || 'User'],
    ['Email', state.profile.email || state.auth.user?.email || '--'],
    ['Goal', state.profile.goalType || 'maintain'],
    ['Weight', `${state.profile.weight || '--'} kg`],
    ['Target weight', `${state.profile.targetWeight || '--'} kg`],
    ['BMI', metrics.bmi ? metrics.bmi.toFixed(1) : '--'],
    ['BMR', `${metrics.bmr || '--'} kcal`],
    ['Daily calorie need', `${metrics.maintenance || '--'} kcal`],
    ['Recommended calorie target', `${metrics.recommendedCalories} kcal`],
    ['Protein goal', `${metrics.proteinGoal}g`],
    ['Water goal', `${metrics.waterGoal} glasses`],
    ['Today calories', `${state.consumed.calories} kcal`],
    ['Today protein', `${Math.round(state.consumed.protein)}g`],
    ['Hydration', `${state.dashboard.hydrationLiters.toFixed(1)}L`]
  ];
  const report = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>NutriTrack Health Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #102018; }
    h1 { color: #15803d; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d9eadf; padding: 9px 12px; text-align: left; }
    th { background: #ecfdf3; }
  </style>
</head>
<body>
  <h1>NutriTrack Health Report</h1>
  <p>This report is generated from your saved NutriTrack profile and today’s logged values.</p>
  <table>
    <tbody>${rows.map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join('')}</tbody>
  </table>
</body>
</html>`;
  const blob = new Blob([report], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nutritrack-health-report.doc';
  link.click();
  URL.revokeObjectURL(url);
  toast('Word health report downloaded');
}

function performLogout() {
  resetAppState();
  state.auth.verificationCode = '';
  const password = $('auth-password');
  if (password) password.value = '';

  const authClient = getAuthClient();
  if (!authClient) {
    state.auth.user = null;
    updateIdentityUI();
    showAuth();
    toast('Logged out successfully');
    return;
  }

  authClient.signOut()
    .then(() => {
      toast('Logged out successfully');
    })
    .catch((error) => {
      toast(error?.message || 'Logout failed. Please try again.', 'error');
    });
}

function initProfile() {
  updateProfileInputs();
  updateProfileStats();
  updateIdentityUI();

  const liveFieldIds = [
    'set-full-name', 'set-email', 'set-age', 'set-gender', 'set-height', 'set-weight',
    'set-activity-level', 'set-diet-preference', 'set-allergies', 'set-goal-type',
    'set-target-weight', 'set-weekly-target', 'set-calorie-goal', 'set-protein-goal',
    'set-carbs-goal', 'set-fat-goal', 'set-water-goal'
  ];

  liveFieldIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', () => {
      syncProfileFromInputs();
      updateIdentityUI();
      updateHealthProfileDashboard();
    });
    el.addEventListener('change', () => {
      syncProfileFromInputs();
      updateIdentityUI();
      updateHealthProfileDashboard();
    });
  });

  $('profile-avatar-input')?.addEventListener('change', handleAvatarUpload);
  $('edit-profile-btn')?.addEventListener('click', () => $('set-full-name')?.focus());

  document.querySelectorAll('.pref-toggle').forEach(input => {
    input.addEventListener('change', () => {
      state.preferences[input.dataset.pref] = input.checked;
      persistAppState();
      toast(input.checked ? 'Notification enabled' : 'Notification paused');
    });
  });

  $('save-settings-btn')?.addEventListener('click', () => {
    syncProfileFromInputs();
    const metrics = calculateHealthMetrics();
    if (metrics.waterGoal && !getNumberValue('set-water-goal')) state.goals.water = metrics.waterGoal;
    if (metrics.proteinGoal && !getNumberValue('set-protein-goal')) state.goals.protein = metrics.proteinGoal;
    updateDashboard();
    updateProfileStats();
    renderStreaks();
    renderWaterGlasses();
    updateWater();
    updateIdentityUI();
    persistAppState();
    toast('Health profile synced');
  });

  $('change-password-btn')?.addEventListener('click', () => toast('Use Firebase password reset from your sign-in email.'));
  $('export-data-btn')?.addEventListener('click', exportProfileData);
  $('download-report-btn')?.addEventListener('click', downloadHealthReport);
  $('download-report-btn-2')?.addEventListener('click', downloadHealthReport);
  $('delete-account-btn')?.addEventListener('click', () => {
    if (confirm('Delete local NutriTrack profile data for this account?')) {
      clearPersistedAppState();
      resetAppState();
      updateProfileInputs();
      updateDashboard();
      updateProfileStats();
      updateIdentityUI();
      toast('Local profile data deleted');
    }
  });
  $('logout-confirm-btn')?.addEventListener('click', performLogout);
  $('logout-cancel-btn')?.addEventListener('click', () => navigateTo('dashboard'));

  document.querySelectorAll('#section-profile .fade-section, #section-logout .fade-section').forEach((el, index) => {
    setTimeout(() => el.classList.add('visible'), 60 + index * 45);
  });
  }

/* ══════════════════════════════════════
   VOICE FOOD LOGGING
══════════════════════════════════════ */
function initVoice() {
  const voiceBtn    = document.getElementById('voice-btn');
  const modal       = document.getElementById('voice-modal');
  const cancelBtn   = document.getElementById('voice-cancel');
  const transcript  = document.getElementById('voice-transcript');

  voiceBtn.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate voice for browsers without support
      modal.style.display = 'flex';
      transcript.textContent = '(Demo mode) Simulating voice recognition…';
      setTimeout(() => {
        const randomFood = FOODS[Math.floor(Math.random() * FOODS.length)];
        transcript.textContent = `Heard: "Add ${randomFood.name}"`;
        setTimeout(() => {
          modal.style.display = 'none';
          addFood(randomFood);
        }, 1500);
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    modal.style.display = 'flex';
    transcript.textContent = 'Listening… say "Add [food name]"';

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      transcript.textContent = `Heard: "${text}"`;

      if (e.results[0].isFinal) {
        // Try to match a food name
        const matched = FOODS.find(f => text.includes(f.name.toLowerCase()));
        setTimeout(() => {
          modal.style.display = 'none';
          if (matched) {
            addFood(matched);
          } else {
            toast(`Could not identify food from: "${text}"`, 'error');
          }
        }, 800);
      }
    };

    recognition.onerror = () => {
      modal.style.display = 'none';
      toast('Voice recognition failed. Try again.', 'error');
    };

    recognition.onend = () => { modal.style.display = 'none'; };
    recognition.start();
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
}

/* ══════════════════════════════════════
   STAGGER ANIMATIONS ON SECTION SHOW
══════════════════════════════════════ */
function addEnterAnimations() {
  // Re-trigger bar chart animation when switching to calorie section
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.target.classList.contains('active')) {
        const id = m.target.id;
        if (id === 'section-calories') {
          setTimeout(renderBarChart, 50);
        }
      }
    });
  });
  document.querySelectorAll('.section').forEach(s => {
    observer.observe(s, { attributes: true, attributeFilter: ['class'] });
  });
}

function runInitStep(fn) {
  try {
    fn();
  } catch (error) {
    console.error('NutriTrack init step failed:', error);
  }
}

/* ══════════════════════════════════════
   INIT – BOOTSTRAP THE APP
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  runInitStep(initAuth);
  runInitStep(initDailyRollover);
  runInitStep(initNav);
  runInitStep(initLanguage);
  runInitStep(initDate);
  runInitStep(initQuickAdd);
  runInitStep(updateDashboard);
  runInitStep(initScanner);
  runInitStep(initMeals);
  runInitStep(initCoach);
  runInitStep(initMood);
  runInitStep(initWater);
  runInitStep(initCalorieBalance);
  runInitStep(initTraining);
  runInitStep(initGrocery);
  runInitStep(initProfile);
  runInitStep(initVoice);
  runInitStep(addEnterAnimations);
  runInitStep(renderStreaks);
});

window.addEventListener('beforeunload', stopCameraStream);
