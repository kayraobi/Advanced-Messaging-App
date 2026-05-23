import { useState, useCallback, useRef } from 'react';
import type { FlatList } from 'react-native';
import { sendGeminiMessage, type GeminiMessage } from '../services/groqService';

export function useAiAssistant() {
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState<GeminiMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiListRef = useRef<FlatList>(null);

  const sendAiMessage = useCallback(async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    setAiInput('');
    const userMsg: GeminiMessage = { role: 'user', text };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiLoading(true);
    try {
      const reply = await sendGeminiMessage(aiMessages, text);
      setAiMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, aiLoading, aiMessages]);

  return {
    showAI,
    setShowAI,
    aiMessages,
    aiInput,
    setAiInput,
    aiLoading,
    aiListRef,
    sendAiMessage,
  };
}
