require 'cocoapods'

$default_static_frameworks = %w[
  PubNubSwift
  IDnowSDK
  Masonry
  SocketRocket
  libPhoneNumber-iOS
  FLAnimatedImage
  AFNetworking
]

def pod_fix(pre_install, user_static_frameworks = [], ignore_known_linkages = false)
  pre_install do |installer|
    $static_frameworks = $default_static_frameworks
    if ignore_known_linkages
      $static_frameworks = []
    end
    $static_frameworks += user_static_frameworks
    Pod::Installer::Xcode::TargetValidator.send(:define_method, :verify_no_static_framework_transitive_dependencies) {}
    installer.pod_targets.each do |pod|
      bt = pod.send(:build_type)
      if $static_frameworks.include?(pod.name)
        puts "[react-native-podfix] #{pod.name}: Overriding the build_type to static_framework"
        def pod.build_type
          Pod::BuildType.static_framework
        end
      end
    end
  end
end