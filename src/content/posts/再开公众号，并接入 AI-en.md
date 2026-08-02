---
title: "Reviving a WeChat Official Account with AI Integration"
published: 2024-12-22
description: "A complete walkthrough of setting up a WeChat Official Account with AI assistant integration, including agent configuration, knowledge base setup, and multi-platform content distribution."
updated: 2024-12-23
tags:
  - Tech
  - AI
  - Content-Creation
draft: false
pin: 0
toc: true
lang: en
abbrlink: setup-wechat-channel-again
---

![Cover](./_images/再开公众号，并接入%20AI-1754591833063.webp)

## Foreword

I first started a WeChat Official Account for public writing back in 2014. Unfortunately, I couldn't keep it up due to studying abroad — honestly, I just hadn't grasped the long-tail value of consistent writing at the time. I was just killing time after work. After building this website this year, I opened a new account with a slightly different name: "CG Art Lab." The content is essentially the same, though posts arrive a bit later than the blog (within 24 hours).

## Why Start Again

Isn't a WeChat Official Account essentially the same as a blog? Why start one when I already have my own independent blog? It's like a street vendor who dislikes the rules and noise of the commercial district, so they build their own little shop — only to still envy the crowds at the flagship stores.

My blog is publicly accessible on the internet. Even though I use Cloudflare as a proxy (a shield of sorts), I still need to think about data security to keep it running long-term. The Official Account addresses these needs:

- A portfolio showcase — another channel to display my work
- Content backup — another basket for my eggs
- Protection against server attacks
- Compare reader feedback across different platforms
- An additional monetization channel

The answer is simple: I want it all. 🙂

## Integrating AI into the Official Account

This was a serendipitous discovery, using [Zhipu Qingyan (智谱清言)](https://chatglm.cn/).

Here's how it happened: I enjoy using various AI tools to accelerate my creative work. A couple of days ago, I registered with Zhipu Qingyan and wanted to create an assistant to help me learn frontend development. To my surprise, it supports integration with WeChat Official Accounts via API.

**Important note: After integration, your article content will be extracted. There's no guarantee they won't use it for model training (I don't trust the terms of service). If you're concerned about this, don't use it.**

I thought it was an interesting experiment, so I followed the setup process and built a custom assistant for the account, which I named "Butler."

### Creating the Agent

I won't go through the registration process. From the main chat page, click "Create Agent" in the bottom-left corner.

![Zhipu Qingyan create agent interface](./_images/再开公众号，并接入%20AI-1754591858393.webp)

Below are the basic configuration settings I used. The system auto-fills most of it, but it's usually not very smart. Adjust the details to your needs. The key areas are the capability configuration and knowledge base configuration.

![Agent basic configuration](./_images/再开公众号，并接入%20AI-1754591873456.webp)

### Capability Configuration

In the capabilities section, click on the plugin marketplace. Scroll to the bottom and you'll find the WeChat Official Account integration plugin.

![Zhipu Qingyan plugin marketplace with WeChat integration](./_images/再开公众号，并接入%20AI-1754591886496.webp)

Add it, scan the QR code, and follow the prompts to authorize and install.

### Knowledge Base Configuration

At this point, the AI only has permission to access the account — it doesn't have any content yet. Next, in the knowledge base configuration section, click "Authorized Content" and scan the QR code again. After authorization, you can set the content scope and update method.

![Knowledge base configuration](./_images/再开公众号，并接入%20AI-1754591897821.webp)

After confirming, wait a bit and you'll see the retrieved articles. Content you don't want the AI to read can be individually deleted, and you can change the authorization scope.

![Knowledge base content management](./_images/再开公众号，并接入%20AI-1754591909903.webp)

In the response settings, click "Knowledge Base Name" on the right. I recommend enabling "Show relevant knowledge base paragraphs" so the AI's responses indicate which article it's referencing. Leave other settings at default. You can test the results in the dialog panel on the right — it works quite well.

![Agent response settings](./_images/再开公众号，并接入%20AI-1754591922638.webp)

Once testing is satisfactory, click "Publish" in the top-right corner. In the dialog, select "Private" or "Share" for publishing permissions. Under "Publish to Other Platforms," click Configure, select WeChat Official Account as the channel, authorize one last time, and confirm the publish.

After all this, you should be able to send a private message to the Official Account from WeChat mobile and get automatic replies from the "Butler" AI assistant.

![WeChat Official Account AI assistant conversation](./_images/再开公众号，并接入%20AI-1754591936919.webp)

One minor issue: sometimes the response cuts off mid-way. You need to reply "continue" to get the full message. I'm not sure what causes this, but overall the functionality works.

## Summary

In the digital age, multi-channel content distribution and backup are increasingly important for creators. Times change fast, and no one can predict who will take over tomorrow.

The design thinking behind integrating AI into a WeChat Official Account has several interesting angles:

- **Enhanced interactivity**: AI can transform an Official Account from a one-way broadcast platform into something more interactive. WeChat might even get into this space officially.
- **Improved operational efficiency**: Automate handling of common questions and requests. In the future, keyword-based replies might become obsolete.
- **Multi-channel integration**: You may have noticed in the screenshots that I also integrated Weibo authorization. Consolidated content will naturally lead to more accurate responses.

There's still much I haven't figured out — for example, what's the business model behind this? How do you balance data privacy? Feel free to share your thoughts in the comments.

Originally published on [CGArtLab](https://cgartlab.com)