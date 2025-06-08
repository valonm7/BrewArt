// Fallback for using MaterialIcons on Android and web.

import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Define allowed icon names
type IconSymbolName = 
  | 'house.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'list.bullet'
  | 'clock.fill'
  | 'star.fill'
  | 'ellipsis.circle.fill'
  | 'gift-outline'
  | 'cafe-outline'
  | 'qr-code-outline';

// Mapping from SF Symbols to Material Icons
const MAPPING: Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'list.bullet': 'list',
  'clock.fill': 'access-time',
  'star.fill': 'star',
  'ellipsis.circle.fill': 'more-horiz',
  'gift-outline': 'card-giftcard',
  'cafe-outline': 'local-cafe',
  'qr-code-outline': 'qr-code',
};

// Mapping for Ionicons (as a backup)
const IONICONS_MAPPING: Record<IconSymbolName, any> = {
  'house.fill': 'home',
  'paperplane.fill': 'paper-plane',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-forward',
  'list.bullet': 'list',
  'clock.fill': 'time',
  'star.fill': 'star',
  'ellipsis.circle.fill': 'ellipsis-horizontal-circle',
  'gift-outline': 'gift-outline',
  'cafe-outline': 'cafe-outline',
  'qr-code-outline': 'qr-code-outline',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // For now, let's just use Material icons everywhere
  // Since there's an issue with SFSymbol implementation
  try {
    // Try to use normal Material Icons
    return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
  } catch (e) {
    // Fallback to Ionicons which has better coverage for the outline variants
    return <Ionicons color={color} size={size} name={IONICONS_MAPPING[name]} style={style} />;
  }
}
