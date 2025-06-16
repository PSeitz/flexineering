+++
title = "Phrase Queries"
description = "A blog post about the regex phrase queries feature in rust."
date = 2024-10-04
keywords = [ "perf", "benchmark", "lib", "rust" ]
draft = true

[taxonomies]
categories = [ ]
tags = [ "perf", "benchmark", "lib", "rust" ]
+++


---

# How Tantivy handles Phrase Queries with Hundred Thousand terms

In this blog post, we will discuss how Tantivy handles phrase queries with a hundred thousand terms.

Tantivy is a full-text search engine library in Rust. It is designed to be fast and efficient, and it is used in many production systems.

One of the key features of Tantivy is its ability to handle phrase queries efficiently.
A phrase query is a query that requires all the terms in the query to appear in the document in the same order as they appear in the query.

Tantivy supports slop as well. For example `"big wolf"~1` will return documents containing the phrase `"big bad wolf"`.

But in some cases you may want to match wildcard queries. For example, you may want to match the phrase `"big b* wolf"`.
In this case, Tantivy will expand the query to `"big bad wolf" OR "big black wolf" OR "big blue wolf" ...` and so on. 
It depens on how many terms the wildcard query expands to. It could be a lot of terms. Like a hundred thousand terms.

This is a new feature in tantivy I was working on and I wanted to explore the challenges and optimizations that were required to make this feature efficient.

## Challenges



