import React, { useState, useEffect } from 'react'
import { SafeAreaView, ScrollView, StatusBar, Text, useColorScheme, View } from 'react-native'
import codePush from 'react-native-code-push'
import { Colors, Header } from 'react-native/Libraries/NewAppScreen'

const CodePushOptions = {
  // 檢查更新（ON_APP_START:啟動APP / ON_APP_RESUME:程序從後台控制  / MANUAL:手動控制）
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  // 何時安裝（ON_NEXT_RESTART:下次程序啟動 / ON_NEXT_RESUME:下次程序從後台進入前台 / ON_NEXT_SUSPEND:在後台更新 / IMMEDIATE:立即更新，並重新啟動）
  installMode: codePush.InstallMode.IMMEDIATE,
  // 重啟之前，在後台待的最短時間
  minimumBackgroundDuration: 0,
  // 强制更新並啟動
  mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
  // 更新時的提示更新窗，iOS不支援
  rollbackRetryOptions: {
    delayInHours: 1, // rollback 重試，1小時/次
    maxRetryAttempts: 24 // rollback 重試，最多嘗試24次
  }
}

export default codePush(CodePushOptions)(() => {

  const [message, setMessage] = useState('正在檢查更新...')
  const [updateDesc, setUpdateDesc] = useState()
  const [packageSize, setPackageSize] = useState()
  const [showProgress, setShowProgress] = useState()

  useEffect(() => {
    codePush.checkForUpdate()
      .then((remotePackage) => {
        if (!remotePackage) {
          setMessage('已是最新，不需要更新！')
        } else {
          setPackageSize(`${(remotePackage.packageSize / 1024 / 1024).toFixed(2)}mb`)
          setUpdateDesc(remotePackage.description)
          syncInNonSilent(remotePackage)
        }
      })
      .catch((error) => {
        console.log(error)
        setMessage('檢查更新失敗')
      })
  }, [])

  const syncInNonSilent = (remotePackage) => {
    console.log('安裝更新並立刻重啟應用')
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
        localPackage
          .install(codePush.InstallMode.IMMEDIATE)
          .then(() => {
            setMessage('安裝完成')
            codePush.notifyAppReady()
            codePush.allowRestart() // 強制更新
            codePush.restartApp(true)
          }).catch((error) => {
            console.log(error)
            setMessage('安裝出錯，請聯繫管理員！')
          })
      })
      .catch((error) => {
        console.log(error)
        setMessage('下載出錯，請聯繫管理員！')
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
          <Text style={{ fontSize: 20, textAlign: 'center' }}>版本號 1.0.23</Text>
          <Text style={{ fontSize: 20, textAlign: 'center' }}>{message}</Text>
          {showProgress && <Text style={{ fontSize: 20, textAlign: 'center' }}>{showProgress}</Text>}
          {updateDesc && <Text style={{ fontSize: 20, textAlign: 'center' }}>{updateDesc}</Text>}
          {packageSize && <Text style={{ fontSize: 20, textAlign: 'center' }}>{packageSize}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})