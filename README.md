# react-native-podfix

[![npm version](https://badge.fury.io/js/react-native-podfix.svg)](https://badge.fury.io/js/react-native-podfix)

A simple package that uses `postinstall` to put a small script in your `Podfile` to help with a framework linking issue in React Native.

## Installation

```bash
npm install --save-dev react-native-podfix
```

or

```bash
yarn add --dev react-native-podfix
```

## Usage

This package will automatically run a small script to add a `post_install` hook to your `Podfile` that will fix an issue with linking frameworks in React Native.

If for any reason you need to run the script manually, you can do so by running:

```bash
yarn react-native-podfix
```

If you have other pods that need to be set as `static_framework`s, you can add them as the `pod_fix` call's second, optional argument.

```ruby
$static_frameworks = %w[
  SomeFramework
  SomeOtherPod
]

pod_fix(pre_install, static_frameworks)
```

There is a list of frameworks we fix by default:

```ruby
$default_static_frameworks = %w[
  PubNubSwift
  IDnowSDK
  Masonry
  SocketRocket
  libPhoneNumber-iOS
  FLAnimatedImage
  AFNetworking
]
```

If you need to ignore this list for some reason, you can pass `false` as the third argument.

```ruby
pod_fix(pre_install, static_frameworks, false)
```
