# GRE3000 CLI

就是给中国GRE考生背单词用的，就不写英文了。用命令行形式，比较适合摸鱼时候用比较隐蔽😄页面也比较简单，不容易走神

字颜色适合深色背景终端，后续考虑可配置

GRE3000 单词来源 : https://github.com/liurui39660/3000/blob/master/3000.xlsx

tts服务支持：有道https://dict.youdao.com/dictvoice?audio=${word}&type=${type}

## 安装

```shell
git clone https://github.com/Dramalf/GRE3000-cli.git
cd GRE3000-cli
npm i
sudo npm link
```

## 启动

🤓默认模式启动（静音，不朗读单词）

```shell
gre 
```

📢朗读模式启动，后接参数1英式发音，2美式发音（默认美式发音）

```shell
gre -s 1
```

🩺查看帮助

```shell
gre -h
```

## 控制

每次出单词后，有以下几个可选的按键操作（标点符号不区分中英文）

* 按 英文首字母+回车，接下来都会是这个首字母的随机出词
* 按 .or。（句号）+回车，接下来是全词典随机出词
* 按 / or、（分号）重新播放单词读音
* 按,or，（逗号）清空命令行输出（页面更清爽）
* 按 回车键 切换到下一个单词

## example

![example](https://github.com/Dramalf/GRE3000-cli/assets/43701793/eedafe5d-eadb-4b6a-9355-067c2c197efa)
