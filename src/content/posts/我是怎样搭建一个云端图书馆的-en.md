---
title: How I Built a Cloud Library
description: How I Built a Cloud Library
published: 2024-06-11
updated: 2024-11-24
draft: false
tags:
- Tech Sharing
pin: 0
lang: en
abbrlink: how-to-build-library
---

![Cover](./_images/我是怎样搭建一个云端图书馆的-1754580900976.webp)

This article documents how to build your own cloud library using an idle computer.

The software operations mainly involve installing and running Calibre on a Debian 12 virtual machine within Proxmox VE, including configuring X11 forwarding and resolving Qt platform plugin errors.

## 1. Create and Configure Debian 12 Virtual Machine

1. **Log in to Proxmox VE Web Interface**.
2. **Create Virtual Machine**:

- Click "Create VM".
- Enter basic VM information, such as name.
- In "OS" tab, select "Linux" and choose Debian 12 ISO file (can be downloaded from Debian official website).
- Configure hardware settings including CPU, memory, hard disk, and network.
- Complete wizard and create VM.

**Start VM** and follow prompts to install Debian 12.

### 2. Update System and Install Necessary Software

Log in to Debian 12 VM and update system packages, install necessary software packages.

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y xorg openbox xauth x11-apps libxcb-xinerama0
```

### 3. Install Calibre

Use official recommended script to install latest version of Calibre.

```bash
sudo -v && wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sudo sh /dev/stdin
```

### 4. Configure X11 Forwarding

### On Local Computer

- **Windows**:

- **Install Xming or VcXsrv**:

- [Download and install Xming](https://sourceforge.net/projects/xming/) or [Download and install VcXsrv](https://sourceforge.net/projects/vcxsrv/).
- Start Xming or VcXsrv.

- **Configure PuTTY**:

- Open PuTTY.
- Enter your VM IP address in "Session" page.
- In left menu, navigate to "Connection -> SSH -> X11".
- Check "Enable X11 forwarding".
- Return to "Session" page and connect to VM.

- **macOS/Linux**:

- **Install and start XQuartz (macOS)**:

- [Download and install XQuartz](https://www.xquartz.org/).
- Start XQuartz.

- **Use SSH connection with X11 forwarding enabled**:

```bash
ssh -X user@your-debian-vm-ip
```

### On Debian VM

1. **Verify DISPLAY variable**:

```bash
echo $DISPLAY
```

Confirm output resembles `localhost:10.0` or `:0`.

2. **Run X11 application test**:

```bash
xeyes
```

Confirm X11 application window displays normally.

### 5. Run Calibre and Resolve Qt Plugin Errors

If encountering Qt plugin errors when running Calibre, ensure necessary dependencies are installed.

1. **Run Calibre**:

```bash
calibre
```

If still encountering errors, install following libraries:

```bash
sudo apt install -y libxcb-xinerama0
```

2. **Re-run Calibre**:

```bash
calibre
```

### 6. Use VNC for GUI Access (Optional)

If X11 forwarding still has issues, can use VNC for GUI access.

1. **Install VNC server**:

```bash
sudo apt install -y tightvncserver
```

2. **Start VNC server**:

```bash
vncserver :1
```

3. **Configure VNC client**:

- Install VNC client on local computer (such as [TightVNC Viewer](https://www.tightvnc.com/download.php)).
- Connect to VM's VNC server, address format `your-debian-vm-ip:5901`.

4. **Run Calibre in VNC session**:

```bash
calibre
```

Through these specific steps, you should be able to successfully install and run Calibre on Debian 12 VM within Proxmox VE. If still having problems, carefully check each step's configuration, ensure all dependencies are correctly installed.

When using PuTTY to set up X11 forwarding, can follow these steps for configuration, to ensure successfully running GUI programs on remote Linux server and displaying these programs' GUI on local Windows system.

### Step One: Server-side Configuration

1. **Install necessary software packages**:

- On Linux server, ensure `xterm` (or other GUI programs) and `xauth` program are installed. These programs usually can be installed through package manager (like `yum` or `apt-get`).
- For example, on CentOS, can use following command to install:

```bash
sudo yum install xterm xauth
```

- On Ubuntu, can use following command to install:

```bash
sudo apt-get install xterm xauth
```

2. **Configure SSH service**:

- Edit SSH service configuration file `/etc/ssh/sshd_config`, ensure X11 forwarding is enabled. Find `X11Forwarding` line, set its value to `yes`.
- Restart SSH service to apply changes. Usually can be done by executing command like `sudo systemctl restart sshd` (specific command depends on your Linux distribution).

### Step Two: Desktop-side Configuration

1. **Download and install Xming**:

- Xming is an X server running on Windows, allowing you to run GUI programs on remote Linux server through SSH connection and display these programs' GUI on local Windows system.
- You can download Xming installer from Xming official website (like [http://www.straightrunning.com/XmingNotes/](http://www.straightrunning.com/XmingNotes/)) or SourceForge page (like [http://sourceforge.net/projects/xming/](http://sourceforge.net/projects/xming/)).
- After downloading, follow installer instructions for installation.

2. **Configure PuTTY for X11 forwarding**:

- Open PuTTY program.
- Enter remote Linux server's IP address or hostname in "Host Name (or IP address)" field.
- In left navigation bar, expand "Connection"->"SSH"->"X11".
- In right panel, check "Enable X11 forwarding" checkbox.
- (Optional) In "X display location" field, enter `localhost:0.0` or `localhost:10.0` (depending on your configuration and needs). Usually `localhost:0.0` is default setting, but in some cases, you might need to use other values.
- Click "Open" button to establish SSH connection.

### Step Three: Test X11 Forwarding

1. **Log in to remote server**:

- Use credentials set in PuTTY (username and password or private key) to log in to remote Linux server.

2. **Run GUI program**:

- Once logged in to remote server, can try running a GUI program like `xterm` to test if X11 forwarding is successful.
- Enter `xterm` command in terminal and press enter. If everything works correctly, you should see a new `xterm` window pop up on local Windows system.

If successfully see `xterm` window or other GUI programs, congratulations, you have successfully configured PuTTY for X11 forwarding! Now you can run any GUI programs on remote Linux server through SSH connection and display their GUI on local Windows system.
