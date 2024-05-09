{
  description = "A basic flake with a shell";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          packages = [ pkgs.bashInteractive ];

          buildInputs = with pkgs; [ nodejs_20 corepack ];

          shellHook = with pkgs;
            "  export PRISMA_SCHEMA_ENGINE_BINARY=\"${prisma-engines}/bin/schema-engine\"\n  export PRISMA_QUERY_ENGINE_BINARY=\"${prisma-engines}/bin/query-engine\"\n  export PRISMA_QUERY_ENGINE_LIBRARY=\"${prisma-engines}/lib/libquery_engine.node\"\n  export PRISMA_INTROSPECTION_ENGINE_BINARY=\"${prisma-engines}/bin/introspection-engine\"\n  export PRISMA_FMT_BINARY=\"${prisma-engines}/bin/prisma-fmt\"\n";
        };
      });
}
