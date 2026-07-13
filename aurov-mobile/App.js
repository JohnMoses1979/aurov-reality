import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const WEBSITE_URL = 'http://52.220.243.146:8080';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }

        return false;
      }
    );

    return () => subscription.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});
