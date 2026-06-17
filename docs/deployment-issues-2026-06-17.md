# EbbinghausApp 问题记录与解决方案

**日期：** 2026-06-17

---

## 1. 删除按钮无响应

**问题：** 添加内容后，点击 EntryCard 的删除按钮，Alert 确认弹窗无法弹出。

**原因：** `EntryCard.tsx` 中使用了嵌套的 `TouchableOpacity` 组件。外层 `TouchableOpacity` 设置了 `onLongPress` 但未设置 `onPress`，触发了 React Native 的触摸响应器冲突，导致子组件（删除按钮）的点击事件被外层消费。

**解决：** 将外层 `TouchableOpacity` 替换为 `Pressable` 组件，`Pressable` 能正确处理嵌套可点击元素的触摸事件分发。

---

## 2. Render 部署配置

**问题：** `render.yaml` 中 PostgreSQL 数据库定义语法错误，使用了不存在的 `pserv` 类型。

**原因：** Render Blueprint 中，数据库应使用 `databases` 字段定义，而非 `services` 下的 `pserv`。

**解决：** 修正 `render.yaml`：
```yaml
databases:
  - name: ebbinghaus-db
    plan: free
```
Web 服务通过 `fromDatabase` 引用连接字符串。

---

## 3. tsx 命令在生产环境未找到（exit code 127）

**问题：** Render 部署后启动失败，报 `tsx: command not found`，退出码 127。

**原因：** `tsx` 放在 `devDependencies` 中，生产环境下 `npm install` 默认跳过 `devDependencies`（`NODE_ENV=production`），导致启动命令找不到 `tsx`。

**解决：** 将 `tsx` 从 `devDependencies` 移至 `dependencies`。

---

## 4. Alert.alert 在 react-native-web 中按钮回调不触发

**问题：** Web 端点击删除按钮，`confirmDelete` 函数被调用，但 `Alert.alert` 的按钮 `onPress` 回调不会执行，导致删除操作无法完成。

**原因：** react-native-web 的 `Alert.alert` 实现使用 `window.confirm()`，按钮回调机制与原生不同，导致 `style: 'destructive'` 按钮的 `onPress` 回调在某些情况下不会被调用。

**解决：** 创建自定义 `ConfirmModal` 组件，使用 React Native 的 `Modal` 组件实现跨平台统一的确认弹窗，不依赖平台原生 Alert API。

---

## 5. 过往学习记录导入问题

**问题：** 添加过往日期的学习内容后，所有错过的艾宾浩斯复习间隔都堆积到今天，显示为逾期待复习。

**尝试方案 1：** "标记为已全部复习"——将过往所有间隔标记为已完成。❌ 不符合实际，用户过去是按每天复习前一天内容的方式，并非按艾宾浩斯间隔。

**最终方案：** "重置复习时钟"——添加内容时（非今日日期），提供一个开关，开启后将第 1 个复习间隔标记为今日已完成。效果：
- 明天的复习从间隔 2 开始
- 艾宾浩斯节奏从今天开始生效
- 更贴合用户"每日复习前一天内容"的实际习惯

**实现：** 在 `appReducer.ts` 的 `ADD_ENTRY` action 中增加 `resetReview` 参数：
```typescript
if (resetReview && date < state.today) {
  completions = {
    ...state.completions,
    [date]: [...existingCompletions, { interval: 1, completedDate: state.today }],
  };
}
```

---

## 6. APK 崩溃闪退

**问题：** 安装 APK 后启动立即闪退，Debug 版也崩溃。

**诊断过程：**
- 用 `adb logcat` 连接手机查看崩溃日志
- 发现 `FATAL EXCEPTION: java.lang.NoClassDefFoundError: Failed resolution of: Lexpo/modules/kotlin/types/LazyKType`
- 崩溃发生于 `expo-av` 的 `VideoViewModule`

**原因：** `expo-av@16.0.8` 依赖 `expo-modules-core` 中的 `LazyKType` 类，但 Expo SDK 56 的 `expo-modules-core` 版本不包含该类。`expo-av` 版本与 SDK 56 不兼容。

**尝试的失败方案：**
- 降级 `expo-av` 到 15.0.2 → 仍有 Kotlin 编译错误（`resolveView` 方法不存在）
- 降级到 14.0.2 → 同样问题

**根因：** `expo-av` 各版本均与 SDK 56 的 `expo-modules-core` 存在 API 断裂。

---

## 7. 国产手机语音识别

**问题：** 华为手机无 Google 服务，`expo-speech-recognition` 调用 `android.speech.SpeechRecognizer` 无法产生识别结果，始终卡在"正在聆听中"。

**尝试方案：**
| 方案 | 结果 |
|------|------|
| expo-speech-recognition (Google SpeechRecognizer) | ❌ 华为无 Google 服务 |
| expo-av 录音 + 百度短语音识别 | ❌ expo-av SDK 版本不兼容 |
| expo-audio 录音 + 百度短语音识别 | ✅ 成功 |

**最终方案：**
1. 使用 `expo-audio@56.0.12`（SDK 56 原生模块，无兼容问题）录制 AMR 格式音频
2. 使用百度短语音识别 API 进行语音转文字
3. 录音配置：
   ```typescript
   extension: '.amr', sampleRate: 16000, numberOfChannels: 1
   android: { outputFormat: 'amrwb', audioEncoder: 'amr_wb' }
   ```

**遇到的子问题：** `expo-file-system` 在 SDK 56 中 API 已变更，`readAsStringAsync` 从主路径导入会报错。改为 `expo-file-system/legacy` 导入解决。

---

## 关键技能总结

### ADB 调试安卓崩溃
```bash
# 连接设备
~/Library/Android/sdk/platform-tools/adb devices

# 查看崩溃日志
~/Library/Android/sdk/platform-tools/adb logcat -d | grep -A30 "FATAL EXCEPTION"

# 直接安装 APK
~/Library/Android/sdk/platform-tools/adb install -r app-release.apk
```

### Expo SDK 版本兼容性
- 安装新包时优先检查 SDK 兼容版本号
- `expo-{name}@{sdkVersion}` 格式通常最安全（如 `expo-audio@~56.0.0`）
- 避免直接 `npm install` 最新版，可能跨 SDK 版本

### 国产 Android 设备注意事项
- 无 Google Mobile Services (GMS) 的手机无法使用 `SpeechRecognizer` API
- 录音类功能需要确保原生模块与 Expo SDK 版本匹配
- 使用国产云服务 API（百度、讯飞等）替代 Google 生态

---

## 最终技术栈

| 组件 | 技术选型 |
|------|---------|
| 前端框架 | Expo SDK 56 + React Native 0.85 |
| 后端 | Express 5 + PostgreSQL |
| 部署 | Render (Web Service + PostgreSQL) |
| 语音识别 | 百度短语音识别 API + expo-audio |
| 文件操作 | expo-file-system/legacy |
| 确认弹窗 | 自定义 ConfirmModal (React Native Modal) |
