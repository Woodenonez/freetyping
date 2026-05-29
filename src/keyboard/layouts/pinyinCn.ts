import type { KeyboardLayout } from '../types';
import { qwertyLayout } from './qwerty';

export const pinyinCnLayout: KeyboardLayout = {
  ...qwertyLayout,
  id: 'pinyin-cn',
  label: 'Pinyin (CN)',
};
