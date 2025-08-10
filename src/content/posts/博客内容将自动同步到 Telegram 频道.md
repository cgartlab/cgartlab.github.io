---
title: "博客内容将自动同步到 Telegram 频道"
published: 2024-09-06
description: "博客内容将自动同步到 Telegram 频道的实现方案和配置步骤。"
updated: 2024-11-25
tags: 
- 技术分享
draft: false
pin: 0
toc: true
lang: zh
abbrlink: blog-to-telegram-channel
---

![封面](./_images/博客内容将自动同步到%20Telegram%20频道-1754591621567.webp)

# 写在前面

如果你已经订阅了本站的 [电报（Telegram）频道](https://t.me/cg_artlab)，会收到几篇测试信息。

现在，本站的电报频道正式上线。

为什么会选择 Telegram？很简单，评估下来这个平台~~啥都能发~~限制最少。

# 电报频道与博客内容的异同

首先，会第一时间同步博客文章和顶级页面内容更新。

其次，之后会同步更新包括但不限于，微博，Twitter，Ins，YouTube，B 站等社交平台发布的内容，近期会陆续上线。

最后，我也会不定期分享每周看到的有价值的工具，网站，文章，等内容。

电报频道最终将会汇聚本人赛博分身公开发布的所有内容。

欢迎订阅，我会尽可能长期运营维护下去。

# 文章同步实现方案

主要使用 WP Telegram 插件，配合另外一台 Shellclash 旁路由虚拟机做代理来实现，插件的免费功能已经足够用了。

这是官方的功能介绍：

> Integrate your WordPress website perfectly with Telegram. Send posts automatically to Telegram when published or updated, whether to a Telegram Channel, Group or private chat, with full control. Get your email notifications on Telegram.

> 模块介绍：
>
> 1.发到 Telegram
> 📝发布或更新时自动将帖子发送到 Telegram
>
> 📢您可以发送到电报频道、群组、超级群组或私人聊天
>
> 👥支持多个频道/聊天
>
> 🙂有带有表情符号的消息模板编辑器
>
> ⏳支持消息模板中的条件逻辑
>
> 🖼支持将特色图像与文本一起发送
>
> 🏞您可以选择只发送特色图像
>
> ⏱支持预定的（未来）帖子
>
> 🕰消息可以按特定时间间隔延迟
>
> ⬜️您可以为帖子 URL 添加一个内联按钮
>
> 🛒支持 WooCommerce 产品和其他自定义帖子类型
>
> ✒️直接支持发送自定义字段
>
> 🗃您可以发送自定义分类条款
>
> 📋您可以选择要发送的帖子类型
>
> ⏲您可以选择何时发送（新帖子和/或现有帖子）
>
> 🎛使用自定义规则按作者、类别、标签、帖子格式或自定义分类术语过滤帖子
>
> 🎚您可以在编辑后页面上覆盖默认设置
>
> WP Telegram Pro 支持基于类别/标签/作者/帖子类型等的多个频道，还支持无限反应按钮。
>
> 2.私人通知
>
> 📧在 Telegram 上获取您的电子邮件通知
>
> 🔔支持 WooCommerce 订单通知、联系表格 7 和其他插件通知
>
> 🔕允许用户在 Telegram 上接收电子邮件通知
>
> 🔐与 WP Telegram 登录集成，允许用户连接他们的 Telegram。
>
> 🖊用户还可以在页面上手动输入他们的电报聊天 ID
>
> 3.代理人
>
> 🚫如果您的主机阻止了 Telegram，您可以使用此模块
>
> ✅通过使用代理绕过 Telegram 的禁令
>
> 🚀支持 Cloudflare worker 作为代理，支持文件上传
>
> 😍使用自定义谷歌脚本作为代理的选项
>
> ❇️支持 PHP 支持的所有代理
>
> 🔛您可以选择代理类型——HTTP、SOCKS4、SOCKS4A、SOCKS5、SOCKS5_HOSTNAME

使用前需要具有：

- 一台能够科学上网的主机
- 一个 Telegram 机器人，在 Telegram 中可以通过 [@BotFather](https://t.me/BotFather) 来创建
- 你的 WordPress 站点

插件下载链接：https://wordpress.org/plugins/wptelegram/

操作步骤：

1. 通过向@BotFather 发送“/newbot”命令来创建一个机器人。
2. 完成步骤后，@BotFather 将为你提供机器人令牌。
3. 复制该令牌并粘贴到下面的“机器人令牌”字段中。
4. 为了方便起见，可以使用 Telegram 桌面版。
5. 在下面测试你的机器人令牌。激活你想要使用的模块。
6. 配置已激活的模块。点击下面的“保存更改”。

完成以上操作之后，一旦发布新文章或旧的文章/页面有内容更新（可选），都会同步到对应的 Telegram 频道。

# 写在后面

社交平台其他内容的同步方案打算通过配合 IFTTT 实现，各个平台近期会陆续更新。全部完成之后会分享一篇如何使用 IFTTT 的介绍，敬请关注。