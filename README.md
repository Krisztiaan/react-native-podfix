# react-native-podfix

[![npm version](https://badge.fury.io/js/react-native-podfix.svg)](https://badge.fury.io/js/react-native-podfix)

A simple package that uses `postinstall` to put a small script in your
`Podfile` to help with a framework linking issue in React Native.

## Installation

```bash
npm install --save-dev react-native-podfix
```

or

```bash
yarn add --dev react-native-podfix
```

## Usage

This package will automatically run a small script to add a
`post_install` hook to your `Podfile` that will fix an issue
with linking frameworks in React Native.

If for any reason you need to run the script manually,
you can do so by running:

```bash
yarn react-native-podfix
```

If you have other pods that need to be set as `static_framework`s,
you can add them to the `Podfix.rb` created by this script,
next to your `Podfile`.

## Library authors

If you want your native library to have it's pods fixed,
add this package as a dependency, and add a postinstall to it,
like so:

```json
{
  "scripts": {
    "postinstall": "react-native-podfix <pod1_name> <pod2_name> ..."
  }
}
```

This will add your pods to the `Podfix.rb` created by this script,
next to the app project's `Podfile`.
