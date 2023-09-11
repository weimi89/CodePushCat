import React, { useState, useEffect } from 'react'
import { SafeAreaView, ScrollView, StatusBar, Text, useColorScheme, View } from 'react-native'
import codePush from 'react-native-code-push'
import { Colors, Header } from 'react-native/Libraries/NewAppScreen'

function App() {

  const [message, setMessage] = useState('正在檢查更新...')
  const [showProgress, setShowProgress] = useState('0%')

  useEffect(() => {
    codePush.checkForUpdate()
      .then((remotePackage) => {
        if (remotePackage) {
          setMessage(`有新的更新！Version ${remotePackage.appVersion} (${(remotePackage.packageSize / 1024 / 1024).toFixed(2)}mb) is available for download`)
          syncInNonSilent(remotePackage)
        } else {
          setMessage('已是最新，不需要更新！')
        }
      })
      .catch((error) => console.log(error))
  }, []);

  const syncInNonSilent = (remotePackage) => {
    console.info('安裝更新並立刻重啟應用')
    codePush.disallowRestart() // 禁止重啟
    remotePackage
      .download(({receivedBytes, totalBytes}) => {
        setMessage('開始下載')
        let downloadProgress = (receivedBytes / totalBytes) * 100;
        setShowProgress(downloadProgress.toFixed(2) + "%")
      })
      .then((localPackage) => {
        // 下載完成了，呼叫這個方法
        setMessage('開始安裝')
        localPackage.install(codePush.InstallMode.IMMEDIATE).then(() => {
          setMessage('安裝完成')
          codePush.notifyAppReady()
          codePush.allowRestart() // 強制更新
          codePush.restartApp(true)
        }).catch((error) => {
          console.log(error)
          setMessage('更新出錯，請聯繫管理員！')
        })
      }).catch((error) => {
        console.log(error)
        setMessage('更新出錯，請聯繫管理員！')
      })
  }

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
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: 10 }}>
          <Text style={{ fontSize: 20, textAlign: 'center' }}>版本號 1.0.0</Text>
          <Text style={{ fontSize: 20, textAlign: 'center' }}>{message}</Text>
          <Text style={{ fontSize: 20, textAlign: 'center' }}>{showProgress}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default codePush(App)