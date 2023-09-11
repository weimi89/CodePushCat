/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react'
import { SafeAreaView, ScrollView, StatusBar, Text, useColorScheme, View } from 'react-native'
import codePush from 'react-native-code-push'
import { Colors, Header } from 'react-native/Libraries/NewAppScreen'

function App() {

  const [message, setMessage] = useState('正在检查更新...')

  const checkUpdate = () => {
    codePush.checkForUpdate(codePush.CheckFrequency.ON_APP_START)
      .then((update) => {
        if (update) {
          setMessage('有新的更新！')
        } else {
          setMessage('已是最新，不需要更新！')
        }
      }).catch((error) => {
        console.log({ error })
      });
  }

  useEffect(() => {
    checkUpdate()
    console.log('App.js')
  }, []);

  const isDarkMode = useColorScheme() === 'dark'

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text style={{ fontSize: 20, textAlign: 'center' }}>版本号 1.0</Text>
          <Text style={{ fontSize: 20, textAlign: 'center' }}>{message}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default codePush(App)