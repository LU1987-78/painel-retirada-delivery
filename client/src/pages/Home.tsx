import { useEffect, useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { useVoiceAlert } from '@/hooks/useVoiceAlert';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Volume2, VolumeX } from 'lucide-react';

/**
 * Painel de Retirada Delivery - Design Industrial Minimalist
 * 
 * Layout: 2 colunas fixas (Em Preparo | Pronto para Retirada)
 * Tipografia: JetBrains Mono (números) + IBM Plex Sans (labels)
 * Paleta: Preto + Branco + Laranja (#FF6B35) + Verde (#00D084)
 * Animações: Transições suaves, pulsos ao marcar pronto, slides entre colunas
 */

export default function Home() {
  const { preparingOrders, readyOrders, addOrder, markAsReady, removeOrder } =
    useOrders();
  const { speak, stop, isPlaying } = useVoiceAlert();

  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastReadyOrderId, setLastReadyOrderId] = useState<string | null>(null);
  const [autoRemoveTimer, setAutoRemoveTimer] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});

  // Efeito para reproduzir alerta de voz quando um pedido fica pronto
  useEffect(() => {
    if (readyOrders.length > 0 && soundEnabled) {
      const lastOrder = readyOrders[0];
      if (lastOrder.id !== lastReadyOrderId) {
        setLastReadyOrderId(lastOrder.id);
        const message = `Atenção! Pedido número ${lastOrder.number} está pronto para retirada`;
        speak(message, 2); // Repetir 2 vezes
      }
    }
  }, [readyOrders, soundEnabled, lastReadyOrderId, speak]);

  // Efeito para remover automaticamente pedidos após 10 minutos
  useEffect(() => {
    readyOrders.forEach((order) => {
      if (!autoRemoveTimer[order.id]) {
        const timer = setTimeout(() => {
          removeOrder(order.id);
          setAutoRemoveTimer((prev) => {
            const newTimers = { ...prev };
            delete newTimers[order.id];
            return newTimers;
          });
        }, 10 * 60 * 1000); // 10 minutos

        setAutoRemoveTimer((prev) => ({
          ...prev,
          [order.id]: timer,
        }));
      }
    });

    return () => {
      Object.values(autoRemoveTimer).forEach((timer) => clearTimeout(timer));
    };
  }, [readyOrders, removeOrder, autoRemoveTimer]);

  const handleAddOrder = () => {
    if (newOrderNumber.trim()) {
      addOrder(newOrderNumber.trim());
      setNewOrderNumber('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddOrder();
    }
  };

  const toggleSound = () => {
    if (isPlaying()) {
      stop();
    }
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl mb-2">
              PAINEL DE RETIRADA DELIVERY
            </h1>
            <p className="font-body text-muted-foreground">
              Gerenciamento de pedidos em tempo real
            </p>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleSound}
              variant={soundEnabled ? 'default' : 'outline'}
              className="font-accent"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Som Ativo
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Som Desativo
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Seção de Novo Pedido */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="font-accent text-sm block mb-2">
              Número do Pedido
            </label>
            <Input
              type="text"
              placeholder="Digite o número do pedido..."
              value={newOrderNumber}
              onChange={(e) => setNewOrderNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="font-display text-xl"
              autoFocus
            />
          </div>
          <Button
            onClick={handleAddOrder}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-accent h-10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* Painel Principal - 2 Colunas */}
      <div className="flex flex-1 min-h-[calc(100vh-280px)]">
        {/* Coluna Esquerda - Em Preparo */}
        <div className="flex-1 border-r border-border bg-black p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="font-display text-2xl text-primary mb-6 flex items-center gap-3">
              <span className="w-4 h-4 bg-primary rounded-full"></span>
              EM PREPARO
            </h2>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {preparingOrders.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="font-body text-muted-foreground text-lg">
                    Nenhum pedido em preparo
                  </p>
                </div>
              ) : (
                preparingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onMarkReady={markAsReady}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita - Pronto para Retirada */}
        <div className="flex-1 bg-black p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="font-display text-2xl text-secondary mb-6 flex items-center gap-3">
              <span className="w-4 h-4 bg-secondary rounded-full"></span>
              PRONTO PARA RETIRADA
            </h2>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {readyOrders.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="font-body text-muted-foreground text-lg">
                    Nenhum pedido pronto
                  </p>
                </div>
              ) : (
                readyOrders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onRemove={removeOrder}
                    isBlinking={index === 0} // Piscar apenas o primeiro (mais recente)
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
