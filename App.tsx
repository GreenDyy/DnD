import {StatusBar, useColorScheme} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{flex: 1}}
        edges={['top', 'bottom']}>
        <StatusBar
          barStyle={
            isDarkMode
              ? 'light-content'
              : 'dark-content'
          }
        />

        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;