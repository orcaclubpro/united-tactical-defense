{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript
    pkgs.yarn
    pkgs.replitPackages.jest
    pkgs.git
  ];
  env = {
    LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [
      pkgs.libuuid
    ]}";
  };
} 