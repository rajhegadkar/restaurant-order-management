export function formatCurrency(amount: number, symbol = '₹'): string {
  const num = Number(amount || 0);
  if (symbol === '₹') {
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${symbol}${num.toFixed(2)}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const now = new Date().getTime();
    const past = new Date(dateString).getTime();
    const diffMins = Math.floor((now - past) / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Recently';
  }
}

export function generateToken(prefix = 'tok'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
}

export function generateOrderNumber(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${randomNum}`;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

export function getStatusColor(status: string): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case 'received':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Order Received' };
    case 'confirmed':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Confirmed' };
    case 'preparing':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Preparing in Kitchen' };
    case 'ready':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Ready for Pickup / Out' };
    case 'delivered':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Delivered / Served' };
    case 'cancelled':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelled' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: status };
  }
}

export function getTableStatusColor(status: string): { bg: string; text: string; badge: string; label: string; dot: string } {
  switch (status) {
    case 'available':
      return {
        bg: 'bg-emerald-50/80 hover:bg-emerald-50',
        text: 'text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        label: 'Available',
        dot: 'bg-emerald-500',
      };
    case 'occupied':
      return {
        bg: 'bg-rose-50/80 hover:bg-rose-50',
        text: 'text-rose-800',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        label: 'Occupied',
        dot: 'bg-rose-500',
      };
    case 'reserved':
      return {
        bg: 'bg-amber-50/80 hover:bg-amber-50',
        text: 'text-amber-800',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        label: 'Reserved',
        dot: 'bg-amber-500',
      };
    case 'needs_cleaning':
      return {
        bg: 'bg-stone-100/90 hover:bg-stone-200/70',
        text: 'text-stone-700',
        badge: 'bg-stone-200 text-stone-800 border-stone-300',
        label: 'Needs Cleaning',
        dot: 'bg-stone-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-700 border-gray-200',
        label: status,
        dot: 'bg-gray-400',
      };
  }
}
