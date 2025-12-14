+++
title = "Binggan: A new benchmark lib for rust"
description = "A blog post about the release of Binggan, a benchmarking library in rust."
date = 2025-12-14
keywords = [ "perf", "benchmark", "lib", "rust" ]
draft = false

[taxonomies]
categories = [ ]
tags = [ "perf", "benchmark", "lib", "rust" ]
+++


Today I’m excited to announce the release of [Binggan](https://github.com/PSeitz/binggan).

Binggan is the new cool kid on the block for Rust benchmarking. It’s basically the third roommate who just moved into the apartment with Criterion and Divan.

Criterion is the “I bought wine” friend. Divan is the “I brought vibes” friend.
Binggan shows up in a hoodie, kicks the door shut with their heel, and goes:

> “Okay. We’re gonna benchmark. But this time we’ll measure the code, not just our CPU caches.”

First thing it does is turn on colored output, because obviously performance doesn’t count unless it’s aesthetically pleasing. A marvelous achievement. Truly, society has peaked.

Then it pulls the hood over its head, grabs the strings, and *tightens them*:

* “Running one benchmark to completion and then the next? That’s cute. Let’s **interleave** them so cache effects don’t turn your results into… whatever *that* was.”
* “Also: your stack doesn’t start at some divine, stable offset. It starts wherever process startup details leave it today (argv/env included — yes, even stuff like `USER=...`). So yeah: **stack offset randomization**. (Seeded by a very scientific die roll: +1.)”
* “And because CPUs are tiny chaos machines with opinions, here’s a **cache trasher** to reduce cache carry-over between runs.”
* “And for my next trick: I’m going to annoy your CPU’s Branch Prediction Unit, because otherwise you may end up benchmarking ‘how fast the CPU learned your pattern’ rather than your code. Hence: **BPU trasher**. Crown jewel. Cutting-edge. Also extremely dumb if you look at the implementation.”

Then Binggan slaps `perf` on the table:

“Do you want *numbers*, or do you want **answers**? I can collect counters—cycles, cache misses, branch mispredicts—so you can stop guessing why something got slower.”

And just when you think it’s done, it pulls out a peak-tracking allocator like:

“Also, you’re trading memory for speed. Everyone is. Let’s measure **peak allocations** while we’re here.”

And that’s the vibe: fast runs, stable-ish results, and enough context to actually understand what changed—plus delta comparisons so regressions can’t quietly sneak out the back door.

If that sounds like your kind of trouble, check it out: [github.com/PSeitz/binggan](https://github.com/PSeitz/binggan)

Angry GitHub issues are welcome.


# Key Features
So first let's show off what makes Binggan special:

* 📊 Peak Memory Usage
* 💎 Stack Offset Randomization
* 💖 Perf Integration
* 🔄 Delta Comparison
* ⚡ Fast Execution
* 🔀 Interleaving Test Runs
* 🏷️ Named Benchmark Inputs
* 🧙 No Macros, No Magic, Just a regular API
* 🎨 NOW with colored output! (A marvelous achievement)
* 🦀 Runs on Stable Rust

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
Marvel at my most prized possession, the crown jewel, cutting-edge technology of stable benchmarking:
The **mighty** BPU Trasher (and also lame if you check out the code).

Branch Prediction Units (BPU) are a critical component of modern CPUs that predict 
the outcome of branch instructions to improve performance.
BPUs are complex and their functionalities are trade secrets of CPU manufacturers.
There is some research on this topic, but for the most part, we don't really know how they work internally.

The BPU Trasher tries to disrupt the BPU, so it cannot learn patterns from your benchmark code.
By executing a series of unpredictable branches, we are trying to trash the branch predictor's state.

For more information, check out the BPU Trasher repository:
https://github.com/pseitz/bpu_trasher

### Warmup or No Warmup?
Generally having a warmup is questionable, as a branch predictor may even learn random number distribution 
https://lemire.me/blog/2019/10/16/benchmarking-is-hard-processors-learn-to-predict-branches/.

This may lead you to the conclusion that a version with more branches is faster,
just because the branch predictor learned the pattern during warmup.

In Binggan there is no warmup phase for the benchmark, but in order to know how many iterations the benchmark should be executed, 
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

