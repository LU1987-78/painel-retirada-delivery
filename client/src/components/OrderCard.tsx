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
    const timer = setTimeout(() => {
      setAnimationClass('');
    }, 400);
    return () => clearTimeout(timer);
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

  const blinkClass = isBlinking && order.status === 'ready' ? 'blinking' : '';
  const fullAnimationClass = `${animationClass} ${blinkClass}`.trim();

  return (
    <div className={`order-card-column ${fullAnimationClass}`}>
      {/* Número do Pedido - Grande e Bem Contido */}
      <div className="order-number text-white font-bold">{order.number}</div>

      {/* Status em Texto */}
      <div className="font-accent text-white text-center text-sm font-bold tracking-wide">
        {order.status === 'preparing' ? 'PREPARANDO' : 'PRONTO'}
      </div>

      {/* Botão de Ação */}
      <div className="order-card-button w-full">
        {order.status === 'preparing' ? (
          <Button
            onClick={handleMarkReady}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-lg py-3 transition-all"
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar como pronto
          </Button>
        ) : (
          <Button
            onClick={handleRemove}
            variant="outline"
            className="w-full border-2 border-white text-white hover:bg-white/20 font-bold text-sm rounded-lg py-3 transition-all"
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
