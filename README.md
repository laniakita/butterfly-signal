# Butterfly Signal [WIP]

This is a work in progress browser extension that illuminates a butterfly when you visit a webpage that has it's domain registered on Bluesky. The main libraries are written in Rust then compiled into Web Assembly ~~for speed~~ because, why not?

## Motivation

![A post by @bradgessler.com stating: "Ok who is building the browser extension for Safari that lights up a 🦋 icon if the website I’m visiting has an _aproto DNS text record? When it lights up, I can click the icon and follow the account."](./assets/figure-01-motivation.png)

I liked [@bradgessler's](https://bsky.app/profile/bradgessler.com) idea so much, I wanted to bring it to life.

## Usage

### WIP: 12/20/2024

This project is currently at the *early, experimental prototype* stage. As such, you'll have to compile the extension yourself, and load the unpacked './extension/dist' into a chromium browser with "Developer Mode" enabled. Pre-compiled binaries will be made available for distribution once the core features are implemented and semi-polished.

To compile the project, see the [contributing](#contributing) prequisites down below for the necessary libraries, and run `bun run build` from within the extension directory, to generate a unpacked *./dist* you can load into a Chromium browser.

## Roadmap

### Browser Support

- [ ] Chromium Compatibility (WIP)
- [ ] Firefox Compatibility
- [ ] Safari Compatibility

## Contributing


### Quickstart: Nix/NixOS Users

>#### Prerequisites:
>
>0. Install the Nix package manager (if you're not already using NixOS or NixOS-WSL). 
>    - [MacOS (Darwin)](https://nixos.org/download/#nix-install-macos)
>    - [Linux](https://nixos.org/download/#nix-install-linux)
>    - [Windows (WSL)](https://nixos.org/download/#nix-install-windows)

1. Fork this repo
2. Run `nix develop` to immediately have access to all the same libraries/versions.
3. After you've made some changes, create a pull request to merge your changes into master. In the description, be sure to detail what you've changed or added, as well as your motivation for doing so.

### The Hardway

>#### Prerequisites:
>
>0. Install required libraries into your environment: 
>    - **Rust:** rustc, rustup, and cargo
>    - **JS:** nodejs, bun.sh

1. Fork this repo
2. After you've made some changes, create a pull request to merge your changes into master. In the description, be sure to detail what you've changed or added, as well as your motivation for doing so.

