#!/usr/bin/env node
//@ts-check
/**
 * @fileoverview This is a postinstall script that adds a ruby script to the React Native project's podfile,
 * to fix certain pod linkages, without needing to use `use_frameworks!` in the podfile.
 */
const fs = require("fs");
const path = require("path");

const bold = (text) => `\x1b[1m${text}\x1b[0m`;
const log = (text) =>
  console.log(`\x1b[34m[react-native-podfix]\x1b[0m ${text}`);
const warn = (text) =>
  console.warn(`\x1b[33m[react-native-podfix]\x1b[0m ${text}`);
const error = (text) => {
  console.error(`\x1b[31m[react-native-podfix]\x1b[0m ${text}`);
  process.exit(1);
};

const firstNodeModulesPath = __dirname.indexOf("node_modules");
if (firstNodeModulesPath === -1)
  error("No `node_modules` found, skipping postinstall script");

const projectRootPath = __dirname.slice(0, firstNodeModulesPath);
const podfilePath = path.resolve(projectRootPath, "ios", "Podfile");
const podfixPath = path.resolve(projectRootPath, "ios", "Podfix.rb");

function copyPodfixIfNeeded() {
  if (fs.existsSync(podfixPath)) {
    log("Podfix.rb already exists, skipping");
    return;
  }
  if (!fs.existsSync(path.resolve(__dirname, "Podfix.rb"))) {
    error(
      `Podfix.rb not found in package, running from:\n  ${bold(__dirname)}`
    );
  }
  log("Copying Podfix.rb to ios folder");
  fs.copyFileSync(path.resolve(__dirname, "Podfix.rb"), podfixPath);
  log("Copied Podfix.rb to ios folder");
}

copyPodfixIfNeeded();

function installPodfixIfNeeded() {
  if (!fs.existsSync(podfilePath)) {
    error(
      `Podfile not found in ios folder, running from:\n  ${bold(__dirname)}`
    );
  }
  const podfile = fs.readFileSync(podfilePath, "utf8").toString();
  let newPodfile = podfile;
  if (!podfile.includes("require_relative './Podfix'")) {
    log("Installing Podfix.rb to Podfile");
    const lastRequireRelative = newPodfile.lastIndexOf(
      "require_relative",
      newPodfile.lastIndexOf("end")
    );
    if (lastRequireRelative !== -1) {
      newPodfile =
        newPodfile.slice(0, lastRequireRelative) +
        `require_relative './Podfix' # react-native-podfix\n` +
        newPodfile.slice(lastRequireRelative);
    } else {
      // otherwise, add it at the top
      newPodfile = `require_relative './Podfix' # react-native-podfix\n${newPodfile}`;
    }
  }

  if (!podfile.includes("pod_fix(pre_install")) {
    log("Adding call to pod_fix into Podfile...");
    newPodfile = newPodfile.replace(
      /( *?)post_install\s+do\s+|end\s*$/,
      (match, p1) => `${p1}pod_fix(pre_install) # react-native-podfix\n${match}`
    );
  }

  fs.writeFileSync(podfilePath, newPodfile, "utf8");

  log("Installed Podfix.rb to Podfile");
}

installPodfixIfNeeded();

function addNewPods(newPods) {
  log(`Adding pods to Podfix.rb:\n  - ${bold(newPods.join("\n  - "))}`);
  const podFixFile = fs.readFileSync(podfixPath, "utf8").toString();
  const podsToAdd = newPods.filter((arg) => !podFixFile.includes(arg));

  if (podsToAdd.length === 0) {
    log("No new pods to add");
    return;
  }
  const newPodFixFile = podFixFile.replace(
    /(  # pods_start\s*)(.*?)(  # pods_end\s*)/s,
    (match, p1, p2, p3) =>
      `${p1}${p2}${podsToAdd.map((pod) => `  ${pod}`).join("\n")}\n${p3}`
  );

  fs.writeFileSync(podfixPath, newPodFixFile, "utf8");

  log(`Added new pods to Podfix.rb:\n  - ${bold(podsToAdd.join("\n  - "))}`);
}

const newPods = process.argv.slice(2);
if (newPods.length > 0) {
  addNewPods(newPods);
}
