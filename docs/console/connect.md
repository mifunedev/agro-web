---
title: "Connect to a node"
sidebar_position: 4
---

# Connect to a node

You can open a node in four ways. Each way starts from the **Connect** control on the node page.

| Menu item | What it opens | SSH key |
|---|---|---|
| **Browser editor (code-server)** | An editor in your browser | Not necessary |
| **Browser terminal (Ghostty)** | A terminal in your browser | Not necessary |
| **SSH** | A shell from the terminal on your computer | Necessary |
| **Remote desktop (RDP)** | A desktop over Tailscale. This item is experimental. | Not necessary |

The [introduction](intro.md) tells you what the Console is.

## Open the Connect menu

1. Open the node page.
2. Make sure that the node is running. The browser editor and the browser terminal open only on a running node.
3. To open the default way, click **Connect**.
4. To select a different way, click the arrow next to **Connect**. The menu shows the four items.

![The node page of web-app shows the open Connect menu with four items.](/img/console/connect-1.png)
Callouts: 1 is the arrow next to **Connect**. 2 is the Connect menu.

The default is **Browser editor (code-server)**. If the browser editor is not available, **Connect** opens the browser terminal.

If **Connect** is not available, the Console shows the cause below the button.

## Browser editor

The browser editor opens code-server in a new browser tab. You do not need an SSH key.

If code-server does not run on the node, the menu item is not available. To turn on code-server, use the runtime settings of the node. You can also install code-server from a shell on the node:

```bash
agro tool install code-server --host
```

## Browser terminal

The browser terminal opens a Ghostty terminal in a new browser tab. You do not need an SSH key.

## Remote desktop

The remote desktop is experimental. It runs over Tailscale. Port 3389 opens only over Tailscale. The public address of the node does not expose port 3389.

You need a Tailscale tailnet and an RDP client.

1. Open a shell on the node. Use the terminal in the browser editor, or use SSH.
2. Install the desktop and Tailscale on the host:

   ```bash
   cd ~/.agro/workspaces/harness && agro tool install desktop --host
   ```

3. Add the node to your tailnet:

   ```bash
   sudo tailscale up
   ```

4. Set a password for the `sandbox` user:

   ```bash
   sudo passwd sandbox
   ```

5. In your RDP client, connect to the Tailscale IP of the node on port 3389. Sign in as `sandbox`.

   ```text
   <tailscale-ip>:3389
   ```

## SSH

The SSH key is optional. You can always use the browser editor and the browser terminal without a key.

A node with no SSH key accepts no SSH connection. The node does not accept a password for SSH.

The Console adds your SSH keys to a node only when you create the node. A key that you add later does not change an existing node. To use SSH on a node, add the key before you create the node.

### Get a key

Open **Keys** in the Console, then click **Add SSH key**. The dialog has two tabs.

![The Add SSH key dialog shows the Use your own key tab.](/img/console/connect-3.png)
Callouts: 1 is the **Use your own key** tab. 2 is the **Generate one for me** tab. 3 is the **Add key** button.

To use your own key, select **Use your own key**:

1. On your computer, create a key. Press Enter at each prompt:

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/YOUR_KEY_NAME -C you@host
   ```

2. Print the public key:

   ```bash
   cat ~/.ssh/YOUR_KEY_NAME.pub
   ```

3. Copy the full line. The line starts with `ssh-ed25519` or `ssh-rsa`.
4. In **Name**, type a name for the key.
5. In **Public key**, paste the line.
6. Click **Add key**.

To let the Console create a key, select **Generate one for me**:

1. In **Name**, type a name for the key.
2. Click **Generate key**. Your browser creates an Ed25519 key. The Console receives only the public key.
3. Click **Download private key**. The Console keeps no copy of the private key. The Console does not show the key again.
4. Move the file into your SSH folder:

   ```bash
   mv ~/Downloads/agro-<key-name>.key ~/.ssh/
   ```

5. Set the permissions of the file:

   ```bash
   chmod 600 ~/.ssh/agro-<key-name>.key
   ```

6. Click **Done**.

On Windows, keep the key file in a private folder and skip the `chmod` command. Use the same `ssh` command in PowerShell.

### Add the key to a node

When you create a node, open **Advanced: direct SSH access (optional)** and select your key. The node page shows the keys of a node in **Keys on this node**.

### Connect with SSH

1. Open the node page.
2. Click the arrow next to **Connect**.
3. Click **SSH**.
4. Copy the SSH command from the dialog. The command has this shape:

   ```bash
   ssh -i ~/.ssh/<your-key-file> <user>@<node-ip>
   ```

   ![The SSH dialog shows the SSH command and the host fingerprint for web-app.](/img/console/connect-2.png)
   Callouts: 1 is the SSH command. 2 is the host fingerprint.

5. Replace `<your-key-file>` with your private key file. Make sure that the file has the permissions `600`.
6. Run the command in the terminal on your computer.
7. Compare the host fingerprint with the fingerprint in the dialog. If the two fingerprints are different, stop and do not connect.

If the node has no IP address yet, the dialog shows no command. When the node gets an address, the dialog shows the command.

To use a short host name, open **Add to ~/.ssh/config** in the dialog. Copy the entry into your `~/.ssh/config` file.
