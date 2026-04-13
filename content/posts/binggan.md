+++
title = "Binggan: A new benchmark lib for rust"
description = "A blog post about the release of Binggan, a benchmarking library in rust."
date = 2026-04-12
keywords = [ "perf", "benchmark", "lib", "rust" ]
draft = false

[taxonomies]
categories = [ ]
tags = [ "perf", "benchmark", "lib", "rust" ]
+++


Out of fear to delay the release of Binggan any further, I decided to publish a blog post about it which may not cover all of its features.
It's already very useful for me. So there you go:

Today I’m excited to announce the release of [Binggan](https://github.com/PSeitz/binggan), which has been released since more than a year, but I haven’t written about it yet.

Binggan is a Rust benchmarking library, think of it as the new (and cool) kid hanging out with Criterion and Divan.
It shows up, looks at your perfectly warmed-up benchmark, and says:

“Cool numbers. Now let’s see if they hold when the branch predictor can’t memorize the pattern.”

Binggan fights the kinds of accidental determinism that make benchmarks lie: cache carry-over, predictor training, and layout roulette.
Still not perfect, but results you can trust a bit more.

On top it provides insigths via plugins like perf integration and peak memory usage, and custom metrics returned by the benchmark code.

If that sounds useful, read on. If not, then also read on, because
anyone who reads is entitled to retrieve one cookie in person from me with the secret pass phrase "give me cookie".
With the inevitable AI takeover, I'll try to pivot to cookie dealer.

BTW binggan (饼干) means cookie in Chinese.

# Key Features
Here comes the obligatory list with emoji icons and something with BLAZINGLY:

* 🔀 Interleaved test runs
* 💎 Stack offset randomization
* 📊 Peak memory usage
* 💖 Perf integration
* 🔄 Delta comparison
* ⚡ BLAZINGLY Fast Execution
* 🏷️ Named benchmark inputs
* 🧙 No macros - just a regular API
* 🎨 Colored output! (marvelous achievement)
* 🦀 Runs on Stable Rust
* 🔍 Advanced Filtering (AND/OR/NOT and fields like `bench_name:my_bench`)

# Motivation

Binggan comes with bunch of novel features and is designed around three main pillars. There are many benchmarking libraries out there,
but I felt that none of them quite hit the mark for my use cases.

1. Reliable and consistent results reflecting real-world performance
2. Useful information to assess performance characteristics
3. Fast iteration cycle

## Stable Results

A lot of work went into making sure the benchmark results are stable and reliable.
Binggan employs several techniques to minimize noise and variability in benchmark results:

* Interleaving Test Runs
* Stack Offset Randomization
* BPU Trasher
* Cache Trasher

Stable and reliable results are slightly opposite, since benchmark results converge, when
the branch predictor learns the pattern. This is not necessarily what you want, since in real-world scenarios,
the payload may vary and the branch predictor may not be able to learn the pattern.
Generally this can be mitigated by having a large enough test to circumvent the branch predictor learning the pattern.

### Interleaving Test Runs
Instead of running all iterations of one benchmark before moving to the next,
Binggan optionally interleaves the execution of different benchmarks within a group.
This helps mitigate the caching effects and other temporal factors that can skew results.

This is a more accurate representation of real-world performance, where different code paths are executed in a mixed manner,

### Stack Offset Randomization
The current position of your stack impacts performance, for example due to cache alignment effects.
The stack position your program starts with is usually out of your control, since it depens on env. It is for example impacted by
the user name starting the program (or maybe it's const `root`). If a tight loop falls on two cache lines,
instead of one, performance may be impacted by a lot.

Binggan start the benchmark at incrementing stack positions for each run, to average out these effects.

### Cache Trasher
To minimize the impact of CPU cache state on benchmark results, Binggan includes a cache trasher.
It walks through a memory buffer to evict data from the CPU caches before each benchmark run.

### BPU Trasher
Marvel at my most prized possession, the crown jewel, cutting-edge technology of benchmarking:
The **mighty** BPU Trasher (and also lame if you check out the code).

Branch Prediction Units (BPU) are a critical component of modern CPUs that predict 
the outcome of branch instructions to improve performance.
BPUs are complex and their functionalities are trade secrets of CPU manufacturers.
There is some research on this topic, but for the most part, we don't really know how they work internally.

The BPU Trasher tries to disrupt the BPU, so it cannot learn patterns from your benchmark code.
By executing a series of unpredictable branches, we are trying to trash the branch predictor's state.
It's a delicate balance, as we want to introduce enough noise to disrupt the BPU,
but not in a way that would not reflect real-world settings. E.g. we don't want to trash static branches that are always taken.
In its current form, the BPU Trasher is more like a sledgehammer, but it shows promising results.

For more information, check out the BPU Trasher repository:
https://github.com/pseitz/bpu_trasher

Stay tuned for a future blog post diving deeper into the BPU Trasher and its impact on benchmarking.

### Warmup or No Warmup?
Generally having a warmup is questionable, as a branch predictor may even learn random number distribution 
https://lemire.me/blog/2019/10/16/benchmarking-is-hard-processors-learn-to-predict-branches/.

This may lead you to the conclusion that a version with more branches is faster,
just because the branch predictor learned the pattern during warmup.

In Binggan there is currently no explicit warmup phase for the benchmark, but in order to know how many iterations the benchmark should be executed, 
Binggan will run the benchmark to sample the execution time.

## Insight

### Perf Counters

Binggan is integrating with `perf` to understand performance bottlenecks in your code. 
It can collect hardware performance counters during benchmark runs, such as cache misses, branch mispredictions, and CPU cycles.

### Peak Memory Usage

Using the peak memory allocator, Binggan tracks memory allocations during your benchmarks. 
Often, especially when designing data structures, you trade memory for speed.

### Additional Dimensions

Binggan allows you to report on additional dimensions beyond just execution time, such as memory usage or custom metrics you define.
Each benchmark can return a value that is reported alongside the execution time, providing a richer set of data for analysis.

For example when benchmarking different data structures, you can report the size of the data structure as an additional dimension.
Or for a compression algorithm, you can report the compression ratio.

It's flexible, you can report on anything that implements `OutputValue`, which is by default implemented for `u64`.

### Quick Feedback Cycle

When optimizing software, it's crucial to know the impact of your changes quickly. 
Binggan compiles fast and executes fast, which allows for rapid feedback cycles.

When converting the benchmarks in lz4_flex from criterion to Binggan, I observed the following execution times with default settings:

Criterion: ` Executed in  714.00 secs`

Binggan: ` Executed in   88.46 secs`

# Usage

## Output

Binggan provides a way to return additional output values from your benchmarks, which can be used to report on various metrics beyond just execution time.
This is useful for understanding the performance characteristics of your code in more depth, as well as ensuring correctness.

On top of that it will make it harder for the compiler to optimize away your benchmark code, since the output value is used in the benchmark report.

## Filtering

# A Quick Example

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

For more examples and detailed documentation, check out the [Binggan GitHub repository](https://github.com/PSeitz/binggan).
Angry github issues are welcome.

