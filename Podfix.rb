require 'cocoapods'

# do not remove the marker, it's used by the script to add pods
static_frameworks = %w[
  # static_frameworks_below
]


def pod_fix(pre_install, static_frameworks = [])
  pre_install do |installer|
    Pod::Installer::Xcode::TargetValidator.send(:define_method, :verify_no_static_framework_transitive_dependencies) {}
    installer.pod_targets.each do |pod|
      bt = pod.send(:build_type)
      if static_frameworks.include?(pod.name)
        puts "[react-native-podfix] #{pod.name}: Overriding the build_type to static_framework"
        def pod.build_type
          Pod::BuildType.static_framework
        end
      end
    end
  end
end