# UI Screenshots & Visual Guide

## Login/Signup Tab Interface

### Layout
```
┌────────────────────────────────────────────────┐
│                                                │
│  PLANNR Logo                                   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ [✓ Log in]    [Sign up]                 │ │  ← Tab selector
│  ├──────────────────────────────────────────┤ │
│  │                                          │ │
│  │  Welcome back                           │ │
│  │  Sign in to continue to PLANNR          │ │
│  │                                          │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  [Google Logo] Continue Google   │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │                                          │ │
│  │          ─── or email ───               │ │
│  │                                          │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │ [envelope] Email address         │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │ [lock] Password              [👁️]│  │ │
│  │  └──────────────────────────────────┘  │ │
│  │                                          │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │      Log in  →                   │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │                                          │ │
│  │  [Forgot password?]                    │ │
│  │                                          │ │
│  │          ─── or ───                     │ │
│  │                                          │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Explore without account  →      │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### Color Scheme
- **Tab Active:** Primary color (glowing)
- **Tab Inactive:** Muted foreground
- **Buttons:** Primary color with gradient
- **Inputs:** Surface color with border
- **Text:** Foreground color
- **Placeholder:** Muted foreground
- **Error:** Red background with red text
- **Success:** Green background with green text

## Sign Up Tab

Same layout, but:
- Title: "Create account"
- Subtitle: "Join thousands using PLANNR to build faster"
- Extra field: Full name input
- Button: "Sign up" instead of "Log in"
- No "Forgot password?" link
- Bottom text: "By signing up, you agree to our Terms & Privacy Policy"

## States & Interactions

### Default State
```
[Google button] - Clickable, shows icon + text
[Email input] - Empty, placeholder visible
[Password input] - Empty, eye icon visible
[Submit button] - Enabled, shows "Log in" or "Sign up"
```

### Loading State
```
[Google button] - Disabled, shows spinner + "Signing in..."
[Email input] - Disabled, faded
[Password input] - Disabled, faded
[Submit button] - Disabled, shows spinner + "Signing in..."
```

### Error State
```
┌─────────────────────────────────────┐
│ ⚠️ Invalid email or password        │
└─────────────────────────────────────┘
[Google button] - Re-enabled
[Email input] - Re-enabled
[Password input] - Re-enabled
[Submit button] - Re-enabled
```

### Success State (Sign Up Only)
```
┌─────────────────────────────────────┐
│ ✓ Account created! Check your email │
│   to verify your account.           │
└─────────────────────────────────────┘
[Auto-redirect to home in 2 seconds]
```

## Mobile View (< 768px)

```
┌──────────────────────────┐
│                          │
│  PLANNR Logo (smaller)   │
│                          │
│  [✓ Log in] [Sign up]   │ ← Tabs
│  ├──────────────────────┤
│  │ Welcome back        │
│  │ Sign in to continue │
│  │                     │
│  │ [Google button]     │
│  │                     │
│  │  ─── or email ───   │
│  │                     │
│  │ [Email input]       │
│  │ [Password input]    │
│  │                     │
│  │ [Log in button]     │
│  │                     │
│  │ [Forgot pass?]      │
│  │                     │
│  │ ─── or ───          │
│  │ [Explore button]    │
│  │                     │
│  └──────────────────────┘
└──────────────────────────┘
```

## Button Styles

### Primary Button (Log in / Sign up)
```
┌─────────────────────────────────┐
│   Log in  →                     │
└─────────────────────────────────┘
Width: Full
Height: 48px
Border radius: 9999px (pill shape)
Background: Primary color with gradient
Text: "Log in" or "Sign up"
Icon: Arrow right
Font weight: Medium (500)
Hover: Slightly brighter
Active: Gradient effect (3D)
Disabled: Opacity 50%
```

### Secondary Button (Google)
```
┌─────────────────────────────────┐
│  [Google] Continue with Google  │
└─────────────────────────────────┘
Width: Full
Height: 48px
Border radius: 9999px (pill shape)
Background: Surface color
Border: 1px solid border color
Text: "Continue with Google"
Icon: Google logo (SVG)
Hover: Slightly darker surface
Disabled: Opacity 50%
```

### Outline Button (Explore)
```
┌─────────────────────────────────┐
│  Explore without account  →     │
└─────────────────────────────────┘
Width: Full
Height: 48px
Border radius: 9999px (pill shape)
Background: Transparent with border
Border: 1px solid border color
Text: "Explore without account"
Icon: Arrow right
Hover: Slightly visible background
Active: Outline visible
```

## Input Field Styles

### Email / Text Input
```
┌─────────────────────────────────┐
│ [envelope] Email address        │
└─────────────────────────────────┘
Width: Full
Height: 48px
Border radius: 9999px (pill shape)
Padding: 11px left (icon), 16px right
Background: Surface color
Border: 1px solid border color
Icon: On left side (16x16)
Placeholder: Muted color
Focus: Border color → primary, ring shadow
Transition: Smooth (all 200ms)
```

### Password Input
```
┌─────────────────────────────────┐
│ [lock] Password              [👁️]│
└─────────────────────────────────┘
Same as email input, plus:
Eye icon: On right side
Click eye: Toggle password visibility
- Hidden: Shows "••••••••"
- Visible: Shows actual password
```

## Divider Styles

### With Text
```
     ─────── or email ─────
     
Pattern:
Line (flex-1) | Text | Line (flex-1)
Height: 1px
Color: Border color
Text: Muted foreground, uppercase, smaller
Spacing: 12px on each side
```

## Tab Selector Styles

```
┌─────────────────────────────────┐
│ [✓ Log in]    [Sign up]         │
└─────────────────────────────────┘

Active Tab:
- Background: Primary color
- Text: White
- Border radius: 9999px (pill)
- Shadow: lg
- Padding: 8px 16px

Inactive Tab:
- Background: Transparent
- Text: Muted foreground
- Hover: Text → foreground
- Padding: 8px 16px

Container:
- Padding: 4px (gap)
- Background: Surface/50
- Border: 1px solid border
- Border radius: 9999px
- Margin bottom: 32px
```

## Error/Success Messages

### Error Message
```
┌─────────────────────────────────┐
│ Invalid email or password       │
└─────────────────────────────────┘
Background: Red 50 (or red-900/20 dark)
Border: Red 200 (or red-800 dark)
Text: Red 600 (or red-400 dark)
Padding: 12px
Border radius: 8px
Margin bottom: 16px
Font size: Small (14px)
```

### Success Message
```
┌─────────────────────────────────┐
│ ✓ Account created! Check email  │
└─────────────────────────────────┘
Background: Green 50 (or green-900/20)
Border: Green 200 (or green-800)
Text: Green 600 (or green-400)
Padding: 12px
Border radius: 8px
Margin bottom: 16px
Font size: Small (14px)
```

## Dark Mode

All colors automatically switch:
- Background: Darker shade
- Border: Lighter shade
- Text: Lighter shade
- Surfaces: Dark with subtle borders

## Accessibility

- ✅ Proper label associations (implicit)
- ✅ Password toggle has proper button semantics
- ✅ Color contrast meets WCAG AA
- ✅ Form validation messages
- ✅ Loading states with aria attributes (future)
- ✅ Keyboard navigation support
- ✅ Tab order logical (left to right, top to bottom)

## Animation

### Tab Switch
- Instant state change
- Fade effect on content (opacity)
- Duration: 200ms

### Button Hover
- Smooth background change
- Duration: 150ms

### Button Click
- Press effect (slight scale down)
- Duration: 100ms

### Loading Spinner
- 360° rotation
- Duration: 1s infinite
- Smooth easing

### Page Enter
- Fade up animation
- Duration: 400ms
- From: opacity 0, translateY(20px)
- To: opacity 1, translateY(0)

---

## Before vs After

### Before (Original)
```
[Log in] / [Create account] (toggle)
[Email field]
[Password field]
[Submit button]
[Divider]
[Google button] ← Broken (error)
[Divider]
[Explore button]
```

### After (New)
```
┌──────────────────────────────────┐
│ [✓ Log in]  [Sign up]           │ ← Tabs!
├──────────────────────────────────┤
│ Welcome back                     │
│ Sign in to continue              │
│                                  │
│ [Google button] ← Fixed!         │
│                                  │
│ ─── or email ───                 │
│                                  │
│ [Email field]                    │
│ [Password field] [👁️ toggle]    │
│                                  │
│ [Log in button]                  │
│ [Forgot password?]               │
│                                  │
│ ─── or ───                       │
│ [Explore button]                 │
│                                  │
└──────────────────────────────────┘
```

**Much better!** 🎨✨
