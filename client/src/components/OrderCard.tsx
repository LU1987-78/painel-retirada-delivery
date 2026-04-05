import { Order } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OrderCardProps {
  order: Order;
  onMarkReady?: (id: string) => void;
  onRemove?: (id: string) => void;
  isBlinking?: boolean;
}

export function OrderCard({
  order,
  onMarkReady,
  onRemove,
  isBlinking = false,
}: OrderCardProps) {
  const [animationClass, setAnimationClass] = useState('entering');

  useEffect(() => {
    setAnimationClass('');
  }, []);

  const handleMarkReady = () => {
    if (onMarkReady) {
      setAnimationClass('moving-out');
      setTimeout(() => {
        onMarkReady(order.id);
      }, 300);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      setAnimationClass('moving-out');
      setTimeout(() => {
        onRemove(order.id);
      }, 300);
    }
  };

  const statusClass = order.status === 'preparing' ? 'preparing' : 'ready';
  const blinkClass = isBlinking ? 'blinking' : '';
  const fullAnimationClass = `${animationClass} ${blinkClass}`.trim();

  return (
    <div
      className={`order-card ${statusClass} ${fullAnimationClass} relative group`}
    >
      {/* Número do Pedido */}
      <div className="order-number mb-4">{order.number}</div>

      {/* Status */}
      <div className="font-accent text-sm mb-6">
        {order.status === 'preparing' ? 'EM PREPARO' : 'PRONTO'}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 w-full justify-center">
        {order.status === 'preparing' ? (
          <Button
            onClick={handleMarkReady}
            className="bg-white text-black hover:bg-gray-200 font-accent"
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar Pronto
          </Button>
        ) : (
          <Button
            onClick={handleRemove}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black font-accent"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Retirado
          </Button>
        )}
      </div>
    </div>
  );
}
