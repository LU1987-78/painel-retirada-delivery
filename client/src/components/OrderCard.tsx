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

  const statusClass = order.status === 'preparing' ? 'preparing' : 'ready';
  const blinkClass = isBlinking && order.status === 'ready' ? 'blinking' : '';
  const fullAnimationClass = `${animationClass} ${blinkClass}`.trim();

  return (
    <div className={`order-card ${statusClass} ${fullAnimationClass}`}>
      {/* Header com Status */}
      <div className="order-card-header">
        {order.status === 'preparing' ? 'EM PREPARO' : 'PRONTO'}
      </div>

      {/* Conteúdo do Card */}
      <div className="order-card-content">
        {/* Número do Pedido */}
        <div className="order-number">{order.number}</div>

        {/* Status em Texto */}
        <div className="font-accent text-sm">
          {order.status === 'preparing' ? 'PREPARANDO' : 'PRONTO'}
        </div>

        {/* Botão de Ação */}
        <div className="order-card-button w-full">
          {order.status === 'preparing' ? (
            <Button
              onClick={handleMarkReady}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-accent"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar como pronto
            </Button>
          ) : (
            <Button
              onClick={handleRemove}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-700 font-accent"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Retirado
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
