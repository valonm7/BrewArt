/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primary = '#ff8243';
const background = '#f3f3f5';
const text = '#0d0d25';

export const neumorphic = {
  light: {
    boxShadow: {
      small: {
        shadowOffset: { width: 6, height: 6 },
        shadowRadius: 8,
        shadowColor: '#dadada',
        shadowOpacity: 1,
        backgroundColor: background,
      },
      medium: {
        shadowOffset: { width: 8, height: 8 },
        shadowRadius: 12,
        shadowColor: '#dadada',
        shadowOpacity: 1,
        backgroundColor: background,
      },
      pressed: {
        shadowOffset: { width: -6, height: -6 },
        shadowRadius: 8,
        shadowColor: '#dadada',
        shadowOpacity: 1,
        backgroundColor: background,
      }
    },
    insetShadow: {
      shadowColor: '#dadada',
      shadowOffset: { width: 6, height: 6 },
      shadowRadius: 8,
      shadowOpacity: 1,
      backgroundColor: '#f8f8f8',
    }
  },
  dark: {
    boxShadow: {
      small: {
        shadowOffset: { width: 6, height: 6 },
        shadowRadius: 8,
        shadowColor: '#0a0a0a',
        shadowOpacity: 1,
        backgroundColor: '#151718',
      },
      medium: {
        shadowOffset: { width: 8, height: 8 },
        shadowRadius: 12,
        shadowColor: '#0a0a0a',
        shadowOpacity: 1,
        backgroundColor: '#151718',
      },
      pressed: {
        shadowOffset: { width: -6, height: -6 },
        shadowRadius: 8,
        shadowColor: '#0a0a0a',
        shadowOpacity: 1,
        backgroundColor: '#151718',
      }
    },
    insetShadow: {
      shadowColor: '#0a0a0a',
      shadowOffset: { width: 6, height: 6 },
      shadowRadius: 8,
      shadowOpacity: 1,
      backgroundColor: '#1a1a1a',
    }
  }
};

export const Colors = {
  light: {
    text: text,
    background: background,
    tint: primary,
    icon: '#464547',
    tabIconDefault: '#464547',
    tabIconSelected: primary,
    shadow: {
      light: '#ffffff',
      dark: '#dadada',
    },
    input: {
      background: '#f8f8f8',
      shadow: {
        light: '#ffffff',
        dark: '#dadada',
      }
    }
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primary,
    shadow: {
      light: '#2a2a2a',
      dark: '#0a0a0a',
    },
    input: {
      background: '#1a1a1a',
      shadow: {
        light: '#2a2a2a',
        dark: '#0a0a0a',
      }
    }
  },
};
