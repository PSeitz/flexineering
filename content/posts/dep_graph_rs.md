+++
title = "dep_graph_rs: A tool to visualize crate-internal dependencies"
description = "A blog post about the dep_graph_rs tool. It explains how to use it to generate dependency graphs for Rust crates."
date = 2025-07-16
keywords = [ "rust", "graph", "dependencies", "visualization" ]
[taxonomies]
categories = [ ]
tags = [ "rust", "tools" ]
+++

I've created a new tool called [`dep_graph_rs`](https://github.com/PSeitz/dep_graph_rs). It's a small utility to generate a dependency graph for the internal modules of a Rust crate.

It uses the [`syn`](https://github.com/dtolnay/syn) crate to parse Rust source code and analyzes `use crate::...` statements to build a directed graph of dependencies between modules or files. The graph is then output in the [DOT](https://graphviz.org/doc/info/lang.html) language.

It's important to note that this tool visualizes dependencies *within* a single crate. It does not show dependencies on external crates from `Cargo.toml`.

## Example

One of the main motivations for this tool was to help with refactoring and understanding dependencies in larger crates. My personal use case is to analyze the dependencies of a module before extracting it into a separate crate. For example, I wanted to analyze the dependencies of the `directory` module in `tantivy` before extracting it into a `tantivy-directory` crate.

With `dep_graph_rs`, you can see which other modules the `directory` module depends on:

```bash
dep_graph_rs tantivy_folder --source "directory.*" > tantivy_directory_deps.dot
```

This generates a `.dot` file, which you can then render into a beautiful graph:

![Fantastically beautiful graph for the tantivy 'directory' module](/example_dep_graph.png)

## Features

*   Generates dependency graphs from Rust source code.
*   Outputs in DOT format for use with Graphviz.
*   Group dependencies by file or by module.
*   Filter the graph by source, destination, or item (e.g., function name).
*   Clusters nodes by their root module for better readability.

## Usage

You can install the tool using `cargo`:

```bash
cargo install dep_graph_rs
```

To generate a dependency graph, run the tool with the path to your crate's root (`src/lib.rs` or `src/main.rs`):

```bash
dep_graph_rs > graph.dot
```

This will output the graph in DOT format to `graph.dot`.

### Rendering the Graph

You can render the generated `graph.dot` file in a few ways:

1.  **Online Viewer:** Paste the content of `graph.dot` into an online viewer like [GraphvizOnline](https://dreampuf.github.io/GraphvizOnline/).
2.  **Local Installation:** If you have [Graphviz](https://graphviz.org/) installed locally, you can use the `dot` command to render the graph to an image:

```bash
dot -Tpng graph.dot -o graph.png
```

### Options

*   `--mode <MODE>`: Group the graph by file or by module (default: `module`).
*   `--source <SOURCE>`: Filter by source module/file.
*   `--destination <DESTINATION>`: Filter by destination module/file.
*   `--item <ITEM>`: Filter by the name of the imported item (e.g., a function or struct).

For example, to only show dependencies originating from the `graphics` module:

```bash
dep_graph_rs ./test_proj1 --source "graphics" > graph.dot
```
