import { useEffect, useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { useVoiceAlert } from '@/hooks/useVoiceAlert';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Volume2, VolumeX, Speaker } from 'lucide-react';

/**
 * Painel de Retirada Delivery - Design Profissional McDonald's
 * 
 * Esquerda: Vermelho (#DA291C) - EM PREPARO
 * Direita: Verde (#27AE60) - PRONTO PARA RETIRADA
 * Fundo: Branco limpo
 * Borda piscante: Amarelo ouro (#FFC72C)
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

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col">
      {/* Header Profissional */}
      <header className="bg-white border-b-4 border-gray-200 p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-1">
              🍔 PAINEL DE RETIRADA
            </h1>
            <p className="font-body text-gray-600 text-lg">
              Gerenciamento de pedidos em tempo real
            </p>
          </div>

          {/* Botão de Som */}
          <Button
            onClick={toggleSound}
            className={`font-accent font-bold text-lg px-6 py-3 rounded-lg transition-all ${
              soundEnabled
                ? 'bg-primary text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
                Som Ativo
              </>
            ) : (
              <>
                <VolumeX className="w-5 h-5 mr-2" />
                Som Desativo
              </>
            )}
          </Button>
        </div>

        {/* Input de Novo Pedido */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="font-accent text-sm font-bold block mb-2 text-gray-700">
              Número do Pedido
            </label>
            <Input
              type="text"
              placeholder="Digite o número do pedido..."
              value={newOrderNumber}
              onChange={(e) => setNewOrderNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="font-display text-2xl font-bold border-2 border-gray-300 rounded-lg p-4 focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
          <Button
            onClick={handleAddOrder}
            className="bg-primary text-white hover:bg-red-700 font-bold text-lg px-6 py-3 rounded-lg h-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            + Novo Pedido
          </Button>
        </div>
      </header>

      {/* Conteúdo Principal - 2 Colunas Divididas */}
      <main className="flex-1 overflow-hidden flex">
        {/* Coluna Esquerda - EM PREPARO (Vermelho) */}
        <div className="w-1/2 bg-primary text-white border-r-8 border-gray-300 p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="font-display text-4xl font-bold text-center">
              🔴 EM PREPARO
            </h2>
          </div>

          <div className="space-y-6">
            {preparingOrders.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-body text-white/90 text-2xl font-semibold">
                  Nenhum pedido em preparo
                </p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onMarkReady={markAsReady}
                  onRemove={removeOrder}
                  isBlinking={false}
                />
              ))
            )}
          </div>
        </div>

        {/* Coluna Direita - PRONTO PARA RETIRADA (Verde) */}
        <div className="w-1/2 bg-secondary text-white p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="font-display text-4xl font-bold text-center">
              🟢 PRONTO PARA RETIRADA
            </h2>
          </div>

          <div className="space-y-6">
            {readyOrders.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-body text-white/90 text-2xl font-semibold">
                  Nenhum pedido pronto
                </p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onMarkReady={markAsReady}
                  onRemove={removeOrder}
                  isBlinking={true}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Alerta de Voz Visual - Fixo na Base */}
      {lastVoiceAlert?.visible && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-accent text-gray-900 px-6 py-4 rounded-xl shadow-2xl font-bold text-lg">
          <Speaker className="w-6 h-6 animate-pulse" />
          <div>
            <span>Atenção! Pedido número</span>
            <span className="font-display ml-2 text-2xl">{lastVoiceAlert.number}</span>
            <span className="ml-2">está pronto paa retirada</span>
          </div>
        </div>
      )}
    </div>
  );
}
