# JAGUAR FIGHT CLUB - Animated UI Components

Современные анимированные компоненты для премиум фитнес-приложения с фокусом на мобильные устройства и микроинтеракции.

## 🎯 Основные компоненты

### Анимированные кнопки

#### JaguarShimmerButton
Кнопка с shimmer эффектом - идеальна для call-to-action элементов.

```jsx
import { JaguarShimmerButton } from '@/components/ui';

<JaguarShimmerButton 
  variant="primary" 
  size="md"
  onClick={handleClick}
>
  <Play className="w-4 h-4" />
  Start Training
</JaguarShimmerButton>
```

**Варианты:**
- `primary` - Оранжевый градиент (#FF6B35 → #FF8C42)
- `secondary` - Бирюзовый градиент (#4ECDC4 → #44A08D)  
- `accent` - Желтый градиент (#FFD93D → #FFC107)
- `success` - Зеленый градиент (#6BCF7F → #4CAF50)

**Размеры:** `sm`, `md`, `lg`

#### JaguarRippleButton
Кнопка с ripple эффектом для мгновенной обратной связи.

```jsx
import { JaguarRippleButton } from '@/components/ui';

<JaguarRippleButton 
  variant="secondary" 
  size="md"
  rippleColor="#FFFFFF"
  duration="600ms"
>
  <Heart className="w-4 h-4" />
  Like
</JaguarRippleButton>
```

#### JaguarPulseButton  
Пульсирующая кнопка для привлечения внимания к важным действиям.

```jsx
import { JaguarPulseButton } from '@/components/ui';

<JaguarPulseButton 
  variant="primary"
  intensity="medium"
  duration="2s"
>
  <Trophy className="w-4 h-4" />
  Championship Mode
</JaguarPulseButton>
```

**Интенсивность:** `subtle`, `medium`, `strong`

### Прогресс и визуализация данных

#### JaguarProgressRing
Анимированное кольцо прогресса с настраиваемыми параметрами.

```jsx
import { JaguarProgressRing } from '@/components/ui';

<JaguarProgressRing
  progress={75}
  variant="primary"
  size={120}
  animated={true}
  showText={true}
>
  <div className="text-center">
    <div className="text-lg font-bold">75%</div>
    <div className="text-xs">Complete</div>
  </div>
</JaguarProgressRing>
```

#### JaguarAnimatedCounter
Анимированный счетчик с плавным изменением значений.

```jsx
import { JaguarAnimatedCounter } from '@/components/ui';

<JaguarAnimatedCounter
  value={150}
  duration={1000}
  prefix="+"
  suffix=" workouts"
  variant="primary"
  size="lg"
  animate={true}
/>
```

### Микроинтеракции

#### JaguarFloatingButton
Плавающая кнопка действия с tooltip и анимациями.

```jsx
import { JaguarFloatingButton } from '@/components/ui';

<JaguarFloatingButton
  icon={<Plus className="w-6 h-6" />}
  label="Add New Workout"
  variant="primary"
  size="lg"
  position="bottom-right"
  onClick={handleAdd}
/>
```

**Позиции:** `bottom-right`, `bottom-left`, `top-right`, `top-left`

#### JaguarInteractiveCard
Интерактивная карточка с hover эффектами.

```jsx
import { JaguarInteractiveCard } from '@/components/ui';

<JaguarInteractiveCard 
  hoverScale={1.02}
  clickScale={0.98}
  shadowColor="rgba(255, 107, 53, 0.2)"
  className="p-6"
>
  <div className="flex items-center space-x-3">
    <Trophy className="w-8 h-8 text-primary" />
    <div>
      <h3 className="font-semibold">Achievements</h3>
      <p className="text-sm text-muted-foreground">View your wins</p>
    </div>
  </div>
</JaguarInteractiveCard>
```

#### JaguarNotificationDot
Dot для уведомлений с анимацией.

```jsx
import { JaguarNotificationDot } from '@/components/ui';

<div className="relative">
  <Bell className="w-6 h-6" />
  <JaguarNotificationDot 
    count={5} 
    variant="primary" 
    size="sm"
    animate={true}
    className="absolute -top-1 -right-1"
  />
</div>
```

#### JaguarLoadingDots
Анимированные точки загрузки.

```jsx
import { JaguarLoadingDots } from '@/components/ui';

<div className="flex items-center space-x-2">
  <JaguarLoadingDots variant="primary" size="md" />
  <span>Loading...</span>
</div>
```

## 🎨 Цветовая схема JAGUAR

```css
:root {
  --jaguar-primary: #FF6B35;    /* Оранжевый */
  --jaguar-secondary: #4ECDC4;  /* Бирюзовый */
  --jaguar-accent: #FFD93D;     /* Желтый */
  --jaguar-success: #6BCF7F;    /* Зеленый */
}
```

## 📱 Мобильная оптимизация

Все компоненты оптимизированы для мобильных устройств:

- **Touch targets**: Минимум 44px для удобного взаимодействия
- **Responsive**: Адаптивные размеры для разных экранов
- **Performance**: GPU-ускоренные анимации
- **Accessibility**: Поддержка клавиатуры и screen readers
- **Haptic feedback**: Интеграция с тактильными откликами

## 🚀 Демонстрация

Для просмотра всех компонентов в действии:

```jsx
import { JaguarComponentsDemo } from '@/components/ui';

<JaguarComponentsDemo />
```

## 🛠 Технические особенности

### CSS Animations
- Оптимизированы для 60fps
- GPU-ускоренные трансформации
- Поддержка `prefers-reduced-motion`
- Легкие и производительные

### TypeScript Support
Все компоненты имеют полную типизацию TypeScript для лучшего DX.

### Интеграция с Tailwind CSS
Компоненты используют Tailwind CSS v4 и CSS Variables для гибкой кастомизации.

### Совместимость
- React 19+
- Tailwind CSS v4
- Motion/Framer Motion (для продвинутых анимаций)
- Radix UI (для accessibility)

## 📈 Производительность

- **Bundle size**: ~15kb gzipped
- **Tree shaking**: Полная поддержка
- **SSR**: Совместимость с Next.js
- **Mobile performance**: Оптимизировано для мобильных устройств

## 🎯 Лучшие практики

1. **Использование вариантов**: Придерживайтесь единой цветовой схемы
2. **Размеры**: Выбирайте подходящие размеры для контекста
3. **Анимации**: Не злоупотребляйте анимациями на одной странице
4. **Accessibility**: Всегда добавляйте aria-labels для интерактивных элементов
5. **Performance**: Используйте `animate={false}` для статических состояний

## 🔧 Кастомизация

Компоненты легко кастомизируются через CSS Variables:

```css
.my-custom-button {
  --shimmer-color: #your-color;
  --duration: 2s;
  --intensity: 1.1;
}
```

---

**Создано для JAGUAR FIGHT CLUB** 🥊  
*Premium Muay Thai Experience*