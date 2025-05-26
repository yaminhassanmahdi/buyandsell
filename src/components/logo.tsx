
import Link from 'next/link';
import { Handshake } from 'lucide-react'; // Example icon
import { APP_NAME } from '@/lib/constants';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors">
      <Handshake className="h-7 w-7" />
      <span>{APP_NAME}</span>
    </Link>
  );
}
