# Benchmarking

基准测试通常涉及比较执行相同任务的两个或多个程序的性能。有时可能涉及比较两个或多个不同的程序，例如 `Firefox` vs `Safari` vs `Chrome`。有时涉及比较同一程序的两个不同版本。后一种情况让我们能够可靠地回答问题“这个变化是否加快了速度？”

基准测试是一个复杂的主题，全面覆盖超出了本书的范围，但以下是基础知识。

首先，您需要工作负载来进行测量。理想情况下，您会有各种代表程序实际使用情况的工作负载。使用真实世界输入的工作负载最好，但[microbenchmarks]和[压力测试]在适度的情况下也是有用的。

[microbenchmarks]: https://stackoverflow.com/questions/2842695/what-is-microbenchmarking
[压力测试]: https://en.wikipedia.org/wiki/Stress_testing_(software)

其次，您需要一种运行工作负载的方式，这也将决定所使用的度量标准。

Rust 内置的[benchmark tests]是一个简单的起点，但它们使用不稳定的功能，因此仅适用于夜间版的 Rust。
[Criterion] 和 [Divan] 是更复杂的替代方案。
[Hyperfine] 是一个出色的通用基准测试工具。
也可以使用自定义基准测试工具。例如，[rustc-perf] 是用于对 Rust 编译器进行基准测试的工具。

[benchmark tests]: https://doc.rust-lang.org/nightly/unstable-book/library-features/test.html
[Criterion]: https://github.com/bheisler/criterion.rs
[Divan]: https://github.com/nvzqz/divan
[Hyperfine]: https://github.com/sharkdp/hyperfine
[rustc-perf]: https://github.com/rust-lang/rustc-perf/

在度量标准方面，有许多选择，选择合适的度量标准取决于正在进行基准测试的程序的性质。例如，对于`批处理程序`(batch program)有意义的度量标准可能对`交互式程序`(interactive program)没有意义。在许多情况下，`Wall-time`是一个显而易见的选择，因为它对应于用户的感知。然而，它可能受到高方差的影响。特别是，内存布局中微小的变化可能导致显著但短暂的性能波动。因此，具有较低方差的其他度量标准（如周期cycles或指令计数）可能是一个合理的替代方案。

总结来自多个工作负载的测量结果也是一个挑战，有许多方法可以做到这一点，没有一种方法显然是最好的。

良好的基准测试很困难。话虽如此，在拟进行程序优化时，不要过分强调拥有完美的基准测试设置，尤其是在开始优化程序时。一般的基准测试要比没有基准测试好得多。保持对您正在测量的内容开放的态度，随着时间的推移，您可以根据了解到的程序性能特征进行基准测试改进。

