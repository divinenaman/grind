{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, flake-utils, nixpkgs, ... }:  
    flake-utils.lib.eachDefaultSystem(system: 
    let pkgs = nixpkgs.legacyPackages.${system};
        rust = with pkgs; [ ructc cargo ];
        c = with pkgs; [ gcc ]; 
    in
      {
        devShells.rust = with pkgs; mkShell {
            buildInputs = rust;
        };
        devShells.c = with pkgs; mkShell {
            buildInputs = c;
        }; 
      }
    );
}
