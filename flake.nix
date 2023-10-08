{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, flake-utils, nixpkgs, ... }:  
    flake-utils.lib.eachDefaultSystem(system: 
    let pkgs = nixpkgs.legacyPackages.${system};
    in
      {
        devShell.wc = with pkgs; mkShell {
            buildInputs = [ rustc cargo ];
        };
      }
    );
}
