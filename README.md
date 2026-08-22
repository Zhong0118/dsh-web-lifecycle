<h1 align="center">DSH Web Lifecycle</h1>
<p align="center">
  <strong>在 DeepSeek Harness Web 里直接查看状态、重启和关闭 DSH。</strong>
</p>
<p align="center">
  不用回终端，不用找 PID，也不用 <code>kill</code>。
</p>

<p align="center">
  🟢 Status &nbsp;&nbsp; 🔄 Restart &nbsp;&nbsp; ⏹ Shutdown
</p>

<p align="center">
  <img src="page.png" alt="DSH Web Lifecycle" width="920" />
</p>

## 安装

```bash
dsh plugin --profile web add github:Zhong0118/dsh-web-lifecycle
```

安装后重启 DSH Web，然后打开：

**设置 → 重启关闭**

## 功能

插件只做三件事：

* 🟢 **状态** — 查看当前地址、DSH 版本和运行时间
* 🔄 **重启** — 保持当前端口重启，恢复后页面自动刷新
* ⏹ **关闭** — 通过 DSH 自身生命周期优雅退出

另外：

* 自动识别当前实际监听端口，不写死 `3080`
* 运行时间实时更新
* 重启、关闭操作都会进行确认
* 不会根据端口 `kill` 其他进程

## 端口处理

| 启动方式                  | 重启后         |
| --------------------- | ----------- |
| `dsh web`             | 保持当前端口      |
| `dsh web --port 8080` | 继续使用 `8080` |
| `dsh web --port 0`    | 保持本次实际分配的端口 |

使用动态端口时，重启后浏览器也不需要重新寻找地址。

## 更新

```bash
dsh plugin --profile web update
```

更新后重启 DSH Web。

## 本地开发

```bash
npm install
npm run build
dsh plugin --profile web add link:/absolute/path/to/dsh-web-lifecycle
```

## License

MIT

