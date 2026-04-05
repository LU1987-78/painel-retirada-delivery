import { useEffect, useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { useVoiceAlert } from '@/hooks/useVoiceAlert';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Volume2, VolumeX, Speaker } from 'lucide-react';

/**
 * Painel de Retirada Delivery - Novo Design
 * 
 * Layout: Lista vertical com cards
 * Header: Vermelho (Em Preparo) / Verde (Pronto)
 * Borda: Piscante amarela para pedidos prontos
 * Fundo: Azul escuro (#1e3a8a)
 * Alerta: Visual com ícone de som na base
 */

export default function Home() {
  const { preparingOrders, readyOrders, addOrder, markAsReady, removeOrder } =
    useOrders();
  const { speak, stop, isPlaying } = useVoiceAlert();

  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastReadyOrderId, setLastReadyOrderId] = useState<string | null>(null);
  const [lastVoiceAlert, setLastVoiceAlert] = useState<{
    number: string;
    visible: boolean;
  } | null>(null);
  const [autoRemoveTimer, setAutoRemoveTimer] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});

  // Efeito para reproduzir alerta de voz quando um pedido fica pronto
  useEffect(() => {
    if (readyOrders.length > 0 && soundEnabled) {
      const lastOrder = readyOrders[0];
      if (lastOrder.id !== lastReadyOrderId) {
        setLastReadyOrderId(lastOrder.id);
        const message = `Atenção! Pedido número ${lastOrder.number} está pronto paa retirada`;
        speak(message, 2); // Repetir 2 vezes

        // Mostrar alerta visual
        setLastVoiceAlert({ number: lastOrder.number, visible: true });
        setTimeout(() => {
          setLastVoiceAlert((prev) =>
            prev ? { ...prev, visible: false } : null
          );
        }, 5000); // Desaparecer após 5 segundos
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

  const allOrders = [...preparingOrders, ...readyOrders];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">
              PAINEL DE RETIRADA DELIVERY
            </h1>
            <p className="font-body text-muted-foreground">
              Gerenciamento de pedidos em tempo real
            </p>
          </div>

          {/* Botão de Som */}
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

        {/* Input de Novo Pedido */}
        <div className="flex gap-3 items-end">
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
              className="font-display text-lg"
              autoFocus
            />
          </div>
          <Button
            onClick={handleAddOrder}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-accent h-10 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {allOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground text-lg">
                Nenhum pedido no momento
              </p>
            </div>
          ) : (
            allOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                onMarkReady={markAsReady}
                onRemove={removeOrder}
                isBlinking={order.status === 'ready' && index === preparingOrders.length}
              />
            ))
          )}
        </div>
      </main>

      {/* Alerta de Voz Visual */}
      {lastVoiceAlert?.visible && (
        <div className="voice-alert mx-6 mb-6">
          <Speaker className="w-5 h-5" />
          <div>
            <span className="font-accent">Atenção! Pedido número</span>
            <span className="font-display ml-2 text-lg">{lastVoiceAlert.number}</span>
            <span className="font-accent ml-2">está pronto paa retirada</span>
          </div>
        </div>
      )}
    </div>
  );
}
