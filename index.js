//@ts-check
/**
 * @fileoverview This is a postinstall script that adds a ruby script to the React Native project's podfile,
 * to fix certain pod linkages, without needing to use `use_frameworks!` in the podfile.
 */
(() => {
  const fs = require("fs");
  const path = require("path");

  // ran via yarn react-native-podfix <args[]>
  // get args
  const args = process.argv.slice(2);
  if (args.length > 0) {
    log(`Adding frameworks to pod-fix.rb: ${args.join(", ")}`);
    // add the args to pod-fix.rb after the "# static_frameworks start" line
    const podFixPath = path.resolve(
      // where this script is
      __dirname,
      "pod-fix.rb"
    );

    // read the pod-fix.rb
    const podFixFile = fs.readFileSync(podFixPath, "utf8").toString();

    // find the line
    const line = podFixFile.indexOf("  # static_frameworks start");

    // add the args after that line, prepended with two spaces
    const newPodFixFile =
      podFixFile.slice(0, line) +
      args.map((arg) => `  ${arg}`).join("\n") +
      podFixFile.slice(line);

    // write the pod-fix.rb
    fs.writeFileSync(podFixPath, newPodFixFile, "utf8");

    return;
  }

  // find the podfile
  const podfilePath = path.resolve(process.cwd(), "ios", "Podfile");

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
