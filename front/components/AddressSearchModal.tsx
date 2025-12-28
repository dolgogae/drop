import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useI18n } from '../contexts/i18n';

export interface AddressData {
  postalCode: string;
  addressLine1: string;
  jibunAddress?: string;
  buildingName?: string;
  addressSource: 'DAUM_POSTCODE' | 'MANUAL';
}

interface AddressSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: AddressData) => void;
}

const POSTCODE_URL = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

const createPostcodeHtml = () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #wrap { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="wrap"></div>
  <script src="${POSTCODE_URL}"><\/script>
  <script>
    (function() {
      function sendMessage(payload) {
        var msg = JSON.stringify(payload);
        try {
          window.ReactNativeWebView.postMessage(msg);
        } catch (e) {
          console.error('postMessage failed:', e);
        }
      }

      function initPostcode() {
        if (typeof daum === 'undefined' || typeof daum.Postcode === 'undefined') {
          setTimeout(initPostcode, 100);
          return;
        }

        new daum.Postcode({
          oncomplete: function(data) {
            var roadAddress = data.roadAddress || '';
            var jibunAddress = data.jibunAddress || data.autoJibunAddress || '';
            var addressLine1 = roadAddress || jibunAddress;

            sendMessage({
              type: 'SELECT',
              postalCode: data.zonecode,
              addressLine1: addressLine1,
              jibunAddress: jibunAddress,
              buildingName: data.buildingName || ''
            });
          },
          onclose: function(state) {
            if (state === 'FORCE_CLOSE') {
              sendMessage({ type: 'CLOSE' });
            }
          },
          width: '100%',
          height: '100%'
        }).embed(document.getElementById('wrap'));
      }

      if (document.readyState === 'complete') {
        initPostcode();
      } else {
        window.addEventListener('load', initPostcode);
      }
    })();
  <\/script>
</body>
</html>
`;

export default function AddressSearchModal({
  visible,
  onClose,
  onSelect,
}: AddressSearchModalProps) {
  const { t } = useI18n();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const raw = event.nativeEvent.data;
      console.log('[AddressSearchModal] WebView message:', raw);

      const msg: unknown = JSON.parse(raw);

      if (typeof msg !== 'object' || msg === null) {
        return;
      }

      const data = msg as Record<string, unknown>;
      const type = typeof data.type === 'string' ? data.type : '';

      if (type === 'CLOSE') {
        handleClose();
        return;
      }

      if (type === 'SELECT') {
        const postalCode = typeof data.postalCode === 'string' ? data.postalCode : '';
        const addressLine1 = typeof data.addressLine1 === 'string' ? data.addressLine1 : '';

        if (!postalCode || !addressLine1) {
          console.error('[AddressSearchModal] Invalid address data');
          setError(true);
          return;
        }

        const addressData: AddressData = {
          postalCode,
          addressLine1,
          jibunAddress: typeof data.jibunAddress === 'string' ? data.jibunAddress : undefined,
          buildingName: typeof data.buildingName === 'string' ? data.buildingName : undefined,
          addressSource: 'DAUM_POSTCODE',
        };

        onSelect(addressData);
        handleClose();
      }
    } catch (e) {
      console.error('[AddressSearchModal] Failed to parse message:', e);
    }
  };


  const handleClose = () => {
    setLoading(true);
    setError(false);
    onClose();
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('address.searchTitle')}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#344E41" />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={48} color="#e63946" />
            <Text style={styles.errorText}>{t('address.loadError')}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>{t('address.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#588157" />
                <Text style={styles.loadingText}>{t('common.loading')}</Text>
              </View>
            )}
            <WebView
              ref={webViewRef}
              source={{
                html: createPostcodeHtml(),
                baseUrl: 'https://postcode.map.daum.net',
              }}
              onMessage={handleMessage}
              onLoadEnd={() => setLoading(false)}
              onError={() => setError(true)}
              style={[styles.webview, loading && styles.hidden]}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              scalesPageToFit
            />
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#588157',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
