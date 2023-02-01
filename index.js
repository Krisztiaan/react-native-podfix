//@ts-check
/**
 * @fileoverview This is a postinstall script that adds a ruby script to the React Native project's podfile,
 * to fix certain pod linkages, without needing to use `use_frameworks!` in the podfile.
 */
(() => {
  const fs = require("fs");
  const path = require("path");

  // find the podfile
  const podfilePath = path.resolve(__dirname, "..", "ios", "Podfile");

  function bold(text) {
    return `\x1b[1m${text}\x1b[0m`;
  }

  function log(text) {
    console.log(`[react-native-podfix] ${text}`);
  }

  function warn(text) {
    console.warn(`[react-native-podfix] ${text}`);
  }

  // does it exist?
  if (!fs.existsSync(podfilePath)) {
    warn(`No Podfile found, skipping ${bold("pod-fix")} postinstall script`);
    return;
  }

  // read the podfile
  const podfile = fs.readFileSync(podfilePath, "utf8").toString();
  let newPodfile = podfile;
  // does it already have the fix's import?
  if (
    !podfile.includes(
      "require_relative '../node_modules/react-native-podfix/pod-fix'"
    )
  ) {
    log("Adding require for pod-fix into Podfile...");

    // no, add it as last require_relative with a comment after, saying it's added by react-native-podfix
    newPodfile = newPodfile.replace(
      /require_relative\s+['"](.+)['"]/g,
      (match, p1) =>
        `${match}\nrequire_relative '../node_modules/react-native-podfix/pod-fix' # added by react-native-podfix`
    );
  }

  // does it already have the fix called?
  if (!podfile.includes("pod_fix(pre_install")) {
    log("Adding call to pod_fix into Podfile...");

    // add it before `post_install` or the last `end`
    newPodfile = newPodfile.replace(
      /post_install\s+do\s+|end\s*$/,
      (match) => `pod_fix(pre_install)\n${match}`
    );
  }

  if (newPodfile !== podfile) {
    log("Writing to Podfile...");
    // write the podfile
    fs.writeFileSync(podfilePath, newPodfile, "utf8");
  }

  log("Installed!");
})();
