+++
title = "Binggan: A new benchmark lib for rust"
description = "A blog post about the release of binggan, a benchmarking library in rust."
date = 2024-10-21
keywords = [ "perf", "benchmark", "lib", "rust" ]
draft = true

[taxonomies]
categories = [ ]
tags = [ "perf", "benchmark", "lib", "rust" ]
+++

---

# Binggan: A New Benchmark Library for Rust

Today I'm excited to announce the release of `binggan`. 
Binggan is designed to be the next generation of benchmarking library for rust.
The pinnacle of benchmarking technology so to speak. 

A testament to the intricacies of performance measurement!
A beacon of hope in the dark sea of why is my software slow?
So advanced, it even has colored output! 
_Rejoice the release of Binggan!_

It has integration for the perf profiling tool, so you can get detailed information about cache misses, branch mispredictions.

It even has colored output! We really live in the future.


## Why Binggan?

There are already several benchmarking libraries available for rust, so why create another one?
When executing benchmarks, I typically run into the same requirements and so far any benchmark lib lacked
one or more of these features. 


## Key Features


* 📊 Peak Memory Usage
* 💎 Stack Offset Randomization
* 💖 Perf Integration (Linux)
* 🔄 Delta Comparison
* ⚡ Fast Execution
* 🔀 Interleaving Test Runs (More accurate results)
* 🏷️ Named Benchmark Inputs
* 🧙 No Macros, No Magic (Just a regular API)
* 🎨 NOW with colored output!
* 🦀 Runs on Stable Rust

## Why is My Software Slow? Insight with Perf Counters

A major use case for Binggan is integrating with `perf` to understand performance bottlenecks in your code. 
For instance, when comparing different implementations of `lz4_flex`, 
Binggan can help highlight differences in L1 access counters, giving you deeper insights into what's slowing your software down.

## Quick Feedback Cycle

When optimizing software, it's crucial to know the impact of your changes quickly. 
Binggan is designed to be fast, allowing you to experiment and measure results without long waiting times.

### Compile Times

Here's a comparison of incremental compile times with `criterion`:

```bash
cargo bench --no-run
   Compiling turbo_buckets v0.1.0 (/home/user/Development/turbo_buckets)
    Finished `bench` profile [optimized + debuginfo] target(s) in 20.58s
```

And with Binggan:

```bash
cargo bench --no-run
   Compiling turbo_buckets v0.1.0 (/home/user/Development/turbo_buckets)
    Finished `bench` profile [optimized + debuginfo] target(s) in 5.31s
```

While I don't mean to bash `criterion` (it's a fantastic library!), this demonstrates Binggan's lighter, faster approach.

### Execution Time

Execution speed also matters. During performance optimizations for Tantivy, I noticed that benchmarks converted to Binggan executed noticeably faster:

```rust
     Running benches/bench.rs (/home/user/Development/tantivy/target/release/deps/bench-1df16d5da81eb1c0)
alice               Avg: 387.71 MiB/s (-0.09%)    Median: 388.73 MiB/s (-0.11%)    [371.23 MiB/s .. 391.59 MiB/s]
alice_expull        Avg: 206.22 MiB/s (-1.84%)    Median: 212.18 MiB/s (-0.34%)    [153.36 MiB/s .. 214.32 MiB/s]    
```

#### lz4_flex

Criterion: 
```
Executed in  714.00 secs    fish           external
```

Binggan:
```
Executed in   88.46 secs    fish           external
```

## Stable Testing and More Dimensions

Benchmarking is more than measuring time—Binggan allows you to report additional dimensions like memory usage, peak allocation, or other relevant metrics. This can be crucial when optimizing or comparing algorithms.

### Interleaving Test Runs and Stack Offset Randomization

These features help reduce noise in benchmark results, ensuring more accurate measurements. For example, interleaving test runs can help mitigate the effects of system load variations.

### Warmup or No Warmup?

Binggan’s design doesn’t include a traditional warmup phase unless you manually specify the number of iterations. This approach avoids misleading results caused by learned behaviors, like branch prediction optimization, during warmup runs. For accurate benchmarking, it’s best to simulate real-world conditions as closely as possible.

## Memory Consumption Tracking

Using the peak memory allocator, Binggan tracks memory usage during your benchmarks. This is invaluable for understanding the impact of changes on your program's memory footprint.

## Convenient API for Multiple Inputs

Binggan’s API allows you to easily benchmark multiple functions over different inputs, making it straightforward to test various scenarios and configurations.

## A Quick Example

Here's a basic example using Binggan’s `InputGroup` to run benchmarks with memory tracking and perf integration:

```rust
use binggan::{black_box, InputGroup, PeakMemAlloc, INSTRUMENTED_SYSTEM};

#[global_allocator]
pub static GLOBAL: &PeakMemAlloc<std::alloc::System> = &INSTRUMENTED_SYSTEM;

fn main() {
    let data = vec![
        ("max id 100; 100 el all the same", std::iter::repeat(100).take(100).collect()),
        ("max id 100; 100 el all different", (0..100).collect()),
    ];
    bench_group(InputGroup::new_with_inputs(data));
}

fn bench_group(mut runner: InputGroup<Vec<usize>, u64>) {
    runner.set_alloc(GLOBAL); // Enables peak memory reporting.
    runner.config().enable_perf(); // Enables perf integration (Linux only).
    runner.register("vec", move |data| {
        let vec = test_vec(data);
        Some(vec.len() as u64)
    });
    runner.register("hashmap", move |data| {
        let map = test_hashmap(data);
        Some(map.len() as u64)
    });
    runner.run();
}
```

## Conclusion

Binggan is more than just another benchmarking library—it's a powerful tool that combines speed, detailed insights, and ease of use into one package. Whether you’re optimizing performance, comparing different implementations, or simply exploring new approaches, Binggan is here to help. Try it out and see how it can streamline your benchmarking process!

For more examples and detailed documentation, check out the [Binggan GitHub repository](https://github.com/PSeitz/binggan).

---










* 📊 Peak Memory Usage
* 💎 Stack Offset Randomization
* 💖 Perf Integration (Linux)
* 🔄 Delta Comparison
* ⚡ Fast Execution
* 🧩 Interleaving Test Runs (More accurate results)
* 🏷️ Named Benchmark Inputs
* 🧙 No Macros, No Magic (Just a regular API)
* 🎨 NOW with colored output!
* 🦀 Runs on Stable Rust


# Binggan: A new benchmark lib for rust

Today I'm excited to announce the release of binggan, a new benchmarking library for rust. 
Binggan is designed to be fast, easy to use, and provide useful insights into the performance of your code. 
It has integration for the perf profiling tool, so you can get detailed information about cache misses, branch mispredictions.

It even has colored output! We really live in the future.

## Why binggan?

There are already several benchmarking libraries available for rust, so why create another one?
When executing benchmarks, I typically run into the same requirements and so far any benchmark lib lacked
one or more of these features. Binggan is designed to be a one-stop solution for all your benchmarking needs.
Today all your benchmarking needs, tomorrow the world!

## Why is my Software Slow - Insight with perf counters

Perf use case. See the difference in lz4_flex L1 Access counters

## Feedback Cycle Times

When doing software optimizations, often the exact outcome of a change is unclear. So I tend to do a lot of experiments, and measure the impact.
Fast feedback cycles are imho essential. Binggan is designed to be fast, so you can iterate quickly.

### Compile Times
So here is the incremental compilation time of `criterion` with. 

```rust
cargo bench --no-run
    7    Compiling turbo_buckets v0.1.0 (/home/pascal/Development/turbo_buckets)
    6     Finished `bench` profile [optimized + debuginfo] target(s) in 20.58s
```

➜  turbo_buckets git:(main) ✗ cargo bench --no-run
   Compiling turbo_buckets v0.1.0 (/home/pascal/Development/turbo_buckets)
    Finished `bench` profile [optimized + debuginfo] target(s) in 5.31s
```


BTW, I don't mean to bash criterion, it's a great benchmarking library and I'm sure there will be cases
where it's the better choice. And this may change in the future, as I inevitably add every feature imaginable to binggan ;).


### Execution Time

Another aspect is how long it takes to execute.
While working on some performance optimizations for tantivy, I converted some of the benchmarks to binggan.

```rust
     Running benches/bench.rs (/home/pascal/Development/tantivy/even_faster_hashmap/target/release/deps/bench-1df16d5da81eb1c0)
alice               Avg: 387.71 MiB/s (-0.09%)    Median: 388.73 MiB/s (-0.11%)    [371.23 MiB/s .. 391.59 MiB/s]
alice_expull        Avg: 206.22 MiB/s (-1.84%)    Median: 212.18 MiB/s (-0.34%)    [153.36 MiB/s .. 214.32 MiB/s]    
     Running benches/crit_bench.rs (/home/pascal/Development/tantivy/even_faster_hashmap/target/release/deps/crit_bench-b9208024e2fa49c3)
Gnuplot not found, using plotters backend
CreateHashMap/alice/174693
                        time:   [400.31 µs 400.66 µs 401.05 µs]
                        thrpt:  [415.41 MiB/s 415.82 MiB/s 416.18 MiB/s]
                 change:
                        time:   [-3.4689% -2.6694% -1.8514%] (p = 0.00 < 0.05)
                        thrpt:  [+1.8863% +2.7426% +3.5935%]
                        Performance has improved.
CreateHashMap/alice_expull/174693
                        time:   [672.30 µs 673.13 µs 674.08 µs]
                        thrpt:  [247.15 MiB/s 247.50 MiB/s 247.81 MiB/s]
                 change:
                        time:   [-1.2773% -0.4102% +0.4414%] (p = 0.41 > 0.05)
                        thrpt:  [-0.4394% +0.4119% +1.2938%]
                        No change in performance detected.
```

## More Dimensions

Often I need to report on additional information in a benchmark to get more information.

## Stable Test

Use case: Compare with criterion

* 🧩 Interleaving Test Runs (More accurate results)
* 💎 Stack Offset Randomization

Pro Tip: If you are using an AMP CPU on Linux, disable amd-pstate-epp. It's garbage.

## Warmup 

There is no warmup, but in order to know how many iterations the benchmark should be executed, binggan will run the benchmark to sample execution time. 
E.g. if you set the number of iterations manually, there will be no warmup at all.
Generally having a warmup is questionable, as a branch predictor may even learn random number distribution https://lemire.me/blog/2019/10/16/benchmarking-is-hard-processors-learn-to-predict-branches/.

Ideally you want to measure how the code behaves in context of your application. This is pretty much impossible to simulate exactly though, but you should strive to get as close as possible.

## Memory Consumption

## Convenient API

More often than not I want to profile several functions over a list of inputs.

## A Riddle

Btw, number of iteration doesn't change anything.

# BPU Trasher

Marvel at my most prized possession, the crown jewel of stable benchmarking: The *mighty* BPU Trasher.  

(write briefly about how a BPU works)


