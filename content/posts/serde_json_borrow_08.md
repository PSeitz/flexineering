+++
title = "serde_json_borrow 0.8: Faster than SIMD?"
description = "A blog post about the new Serde JSON Borrow 0.8 release, its features, and how it improves performance."
date = 2025-06-15
keywords = [ "perf", "serde", "json", "rust" ]

[taxonomies]
categories = []
tags = [ "perf", "serde", "json", "rust" ]
+++

---

# serde_json_borrow 0.8

`serde_json_borrow` 0.8 is out! This release brings significant performance improvements making it 
the fastest JSON parser in all datasets in the benchmarks, even outperforming `simd_json`.

## What is it
`serde_json_borrow` builds on `serde_json`'s deserializer to produce a `Value<'ctx>` that can borrow directly from the 
input buffer and reference string slices and other data directly from the input buffer.

It's ideal for scenarios where JSON is used as a transient representation to extract some data or apply some transformation. 

## What Changed in 0.8

The main change and performance improvement comes from [PR #32](https://github.com/PSeitz/serde_json_borrow/pull/32) (thanks @jszwec). 
Previously, serde’s default behavior would always create `Cow::Owned` for object keys even when borrowing was possible 
(see [serde-rs/serde#1852](https://github.com/serde-rs/serde/issues/1852)). To address this, 
`serde_json_borrow` introduces a custom wrapper around `Cow` to allow borrowed keys. 

## Value vs OwnedValue

`serde_json_borrow` provides two main ways to work with parsed JSON:

* **`Value<'ctx>`**: This variant borrows string slices and other data directly from the input buffer.
It requires that the input `&'ctx str` outlives the parsed `Value<'ctx>`. 

* **`OwnedValue`**: This variant clones the serialized JSON `&str` and therefore does not depend on the input buffer’s lifetime.

## `cowkeys` Feature Flag

The feature flag `cowkeys` uses `Cow<str>` instead of `&str` as keys in objects. This enables support for escaped strings.
The feature is enabled by default, but can be disabled if you know your JSON data does not contain escaped strings.

## Benchmark

The benchmark results show that `serde_json_borrow` is now the fastest choice, even outperforming `simd_json` in all cases.

### Benchmark Setup

The benchmarks were run on a machine with the following specifications:

* **CPU**: AMD Ryzen 9 9800X3D
* **RAM**: 32 GB
* **OS**: 6.14.6-2-MANJARO 
* **Disk**: Samsung SSD 990 PRO
* **Rust Version**: 1.87.0
* **Benchmarking Tool**: [binggan](https://github.com/PSeitz/binggan)

The benchmarks were configured to trash the CPU cache and branch predictor (or at least try to :) to ensure that the performance measurements are not influenced by caching effects. This uses the `CacheTrasher` and `BPUTrasher` plugins from the `binggan` crate:

```rust
let mut runner: BenchRunner = BenchRunner::new();
runner
    .add_plugin(CacheTrasher::default())
    .add_plugin(BPUTrasher::default());
```

You can run the benchmarks yourself with `cargo bench` on the 
[`https://github.com/serde_json_borrow/tree/blog_post_benchmark`](https://github.com/serde_json_borrow/tree/blog_post_benchmark) 
branch in the `serde_json_borrow` github repo.

The benchmarks below are the worst case configuration for `serde_json_borrow`:
* Only `OwnedValue` is tested (But the data is already `String`).
* The `cowkeys` feature is enabled, which allows for escaped keys in JSON objects.

### Accessing the Parsed JSON
One of the main differences between `serde_json_borrow` and `simd_json` is that `serde_json_borrow` uses a `Vec` for objects. 
This improves deserializion performance, but reduces read access performance for large objects.
The benchmarks reads several keys 10 times from the parsed JSON object. Read access is 
dwarfed by the parsing performance in this benchmark.

### Results
The benchmarks were conducted using five different datasets.

#### Dataset: simple_json

| Method                                   | Avg MB/s | Median MB/s | Range Low MB/s | Range High MB/s |
| :--------------------------------------- | -------: | ----------: | -------------: | --------------: |
| serde_json                             |   309.41 |      309.42 |         297.48 |          312.87 |
| serde_json + access                    |   302.63 |      303.51 |         292.17 |          306.87 |
| serde_json_borrow::OwnedValue          |   551.28 |      550.57 |         537.65 |          561.81 |
| serde_json_borrow::OwnedValue + access |   528.08 |      528.61 |         510.66 |          542.12 |
| serde_json_borrow v0.7::OwnedValue     |   440.91 |      440.59 |         429.04 |          449.27 |
| simd_json_borrow                       |   291.32 |      291.51 |         285.61 |          292.38 |

#### Dataset: hdfs

| Method                                   | Avg MB/s | Median MB/s | Range Low MB/s | Range High MB/s |
| :--------------------------------------- | -------: | ----------: | -------------: | --------------: |
| serde_json                             |   684.07 |      685.38 |         672.70 |          689.32 |
| serde_json + access                    |   690.25 |      687.36 |         664.73 |          700.37 |
| serde_json_borrow::OwnedValue          |  1138.48 |     1143.40 |        1047.45 |         1156.10 |
| serde_json_borrow::OwnedValue + access |  1128.96 |     1121.38 |        1085.85 |         1163.26 |
| serde_json_borrow v0.7::OwnedValue     |   893.49 |      895.36 |         827.68 |          911.69 |
| simd_json_borrow                       |   688.15 |      690.37 |         659.29 |          692.93 |

#### Dataset: hdfs_with_array

| Method                                   | Avg MB/s | Median MB/s | Range Low MB/s | Range High MB/s |
| :--------------------------------------- | -------: | ----------: | -------------: | --------------: |
| serde_json                             |   460.97 |      461.01 |         453.62 |          474.36 |
| serde_json + access                    |   475.77 |      476.88 |         464.11 |          485.78 |
| serde_json_borrow::OwnedValue          |   817.97 |      819.37 |         795.93 |          834.68 |
| serde_json_borrow::OwnedValue + access |   817.90 |      818.61 |         788.71 |          833.57 |
| serde_json_borrow v0.7::OwnedValue     |   731.79 |      731.43 |         717.81 |          741.30 |
| simd_json_borrow                       |   539.51 |      540.13 |         533.17 |          541.27 |

#### Dataset: wiki

| Method                                   | Avg MB/s | Median MB/s | Range Low MB/s | Range High MB/s |
| :--------------------------------------- | -------: | ----------: | -------------: | --------------: |
| serde_json                             |  1354.50 |     1354.40 |        1337.20 |         1367.90 |
| serde_json + access                    |  1397.20 |     1397.60 |        1385.00 |         1414.60 |
| serde_json_borrow::OwnedValue          |  1510.70 |     1514.30 |        1480.30 |         1537.00 |
| serde_json_borrow::OwnedValue + access |  1558.60 |     1558.40 |        1536.70 |         1583.30 |
| serde_json_borrow v0.7::OwnedValue     |  1463.10 |     1463.60 |        1447.10 |         1481.30 |
| simd_json_borrow                       |  1473.60 |     1473.70 |        1459.00 |         1483.20 |

#### Dataset: gh-archive

| Method                                   | Avg MB/s | Median MB/s | Range Low MB/s | Range High MB/s |
| :--------------------------------------- | -------: | ----------: | -------------: | --------------: |
| serde_json                             |   450.44 |      450.08 |         439.20 |          456.40 |
| serde_json + access                    |   447.61 |      446.50 |         442.51 |          455.33 |
| serde_json_borrow::OwnedValue          |  1147.90 |     1143.91 |        1124.97 |         1170.94 |
| serde_json_borrow::OwnedValue + access |  1154.05 |     1154.36 |        1129.16 |         1185.28 |
| serde_json_borrow v0.7::OwnedValue     |   690.87 |      689.07 |         682.23 |          700.78 |
| simd_json_borrow                       |   995.81 |      996.01 |         991.79 |          999.33 |

## Conclusion

Noice isn't it? 


