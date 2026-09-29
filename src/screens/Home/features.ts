import {
  BookOpen,
  Headphones,
  Zap,
  Radio,
  Settings,
  LucideIcon,
} from 'lucide-react-native';
import { RootStackParamList } from '../../types';

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  bgColor: string;
  screen: keyof RootStackParamList;
} 

export const features: Feature[] = [
  {
    id: '1',
    icon: Radio,
    title: 'Gõ Morse',
    desc: 'Mô phỏng thao tác gõ điện báo',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    screen: 'MorseTapScreen',
  },
  {
    id: '2',
    icon: Headphones,
    title: 'Tíc Tà Sound',
    desc: 'Nghe và nhận dạng tín hiệu',
    color: '#22C55E',
    bgColor: '#DCFCE7',
    screen: 'DnDScreen',
  },
  {
    id: '3',
    icon: Zap,
    title: 'Playground',
    desc: 'Thử tốc độ và chế độ',
    color: '#EAB308',
    bgColor: '#FEF9C3',
    screen: 'PlaygroundScreen',
  },
  {
    id: '4',
    icon: Radio,
    title: 'Bảng điện',
    desc: 'Luyện truyền và nhận điện',
    color: '#15803D',
    bgColor: '#DCFCE7',
    screen: 'ElectroTableScreen',
  },
  {
    id: '5',
    icon: Radio,
    title: 'Bảng điện đã lưu',
    desc: 'Xem lại các bảng điện đã lưu',
    color: '#15803D',
    bgColor: '#DCFCE7',
    screen: 'SavedBoardsScreen',
  },
] as const;