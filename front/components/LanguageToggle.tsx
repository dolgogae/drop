import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useI18n } from '../contexts/i18n';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useI18n();

  return (
    <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
      <Text style={styles.text}>{language === 'ko' ? 'EN' : '한'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
