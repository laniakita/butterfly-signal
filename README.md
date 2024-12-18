# Butterfly Signal

This is a browser extension that illuminates a butterfly when you visit a webpage that has it's domain registered on Bluesky. The main libraries are written in Rust then compiled into Web Assembly for speed and cross-compatibility.

## Motivation

![A post by @bradgessler.com stating: "Ok who is building the browser extension for Safari that lights up a 🦋 icon if the website I’m visiting has an _aproto DNS text record? When it lights up, I can click the icon and follow the account."](./assets/figure-01-motivation.png)

I liked [@bradgessler's](https://bsky.app/profile/bradgessler.com) idea so much, I wanted to bring it to life.

## Usage

Until this is made available on the chrome webstore (or whereever you get browser extensions), you'll have to download the latest release, and load it into your browser.

## Roadmap

### Browser Support

- [ ] Chromium Compatibility
- [ ] Firefox Compatibility
- [ ] Safari Compatibility

## Contributing


### Quickstart: Nix/NixOS Users

>#### Prerequisites:
>
>0. Install the Nix package manager (if you're not already using NixOS or NixOS-WSL). 
>   - [MacOS (Darwin)](https://nixos.org/download/#nix-install-macos)
>   - [Linux](https://nixos.org/download/#nix-install-linux)
>   - [Windows (WSL)](https://nixos.org/download/#nix-install-windows)

1. Fork this repo
2. Run `nix develop` to immediately have access to all the same libraries/versions.
3. After you've made some changes, create a pull request to merge your changes into master. In the description, be sure to detail what you've changed or added, as well as your motivation for doing so.

### The Hardway

>#### Prerequisites:
>
>0. Install required libraries into your environment: 
>   - **Rust:** rustc, rustup, and cargo
>   - **JS:** nodejs, bun.sh

1. Fork this repo
2. After you've made some changes, create a pull request to merge your changes into master. In the description, be sure to detail what you've changed or added, as well as your motivation for doing so.

