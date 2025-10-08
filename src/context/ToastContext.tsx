import React, { createContext, useCallback, useContext, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type ToastItem = { id: string; message: string; kind?: 'success' | 'error' | 'info' };

interface ToastCtx {
  show: (message: string, kind?: ToastItem['kind']) => void;
}

const ToastContext = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastItem['kind']='info') => {
    const id = Math.random().toString(36).slice(2,9);
    setItems(prev => [...prev, { id, message, kind }]);
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View pointerEvents="none" style={styles.host}>
        {items.map(item => <Toast key={item.id} message={item.message} kind={item.kind} />)}
      </View>
    </ToastContext.Provider>
  );
};

const KIND_COLORS: Record<string, string> = {
  success: '#1ED760',
  error: '#FF4D61',
  info: '#4ECDC4'
};

const Toast: React.FC<{ message: string; kind?: ToastItem['kind'] }> = ({ message, kind='info' }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start();
  }, [opacity]);
  return (
    <Animated.View style={[styles.toast, { backgroundColor: KIND_COLORS[kind] || KIND_COLORS.info, opacity }]}> 
      <Text style={styles.toastText} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  host: { position: 'absolute', bottom: 90, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 16 },
  toast: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, marginTop: 8, maxWidth: '90%', shadowColor: '#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.35, shadowRadius:6, elevation:4 },
  toastText: { color: '#000', fontWeight: '700' }
});
