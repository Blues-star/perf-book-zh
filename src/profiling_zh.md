# Profiling

在优化程序时，你还需要一种方法来确定程序的哪些部分是 "热 "的（执行频率足以影响运行时间），值得修改。这一点最好通过Profiling来完成。

## Profilers

有许多不同的性能分析工具可供选择，每种工具都有其优势和劣势。以下是一份未完整的性能分析工具列表，这些工具已成功用于 Rust 程序。
- [perf] 是一个使用硬件性能计数器的通用性能分析工具。[Hotspot] 和 [Firefox Profiler] 适用于查看 perf 记录的数据。它适用于 Linux。
- [Instruments] 是一个随 macOS 上的 Xcode 提供的通用性能分析工具。
- [Intel VTune Profiler] 是一个通用性能分析工具。它适用于 Windows、Linux 和 macOS。
- [AMD μProf] 是一个通用性能分析工具。它适用于 Windows 和 Linux。
- [samply] 是一个采样性能分析工具，生成的分析结果可以在 Firefox Profiler 中查看。它适用于 Mac 和 Linux。
- [flamegraph] 是一个 Cargo 命令，使用 perf/DTrace 对代码进行性能分析，然后在火焰图中显示结果。它适用于 Linux 和支持 DTrace 的所有平台（macOS、FreeBSD、NetBSD，可能还包括 Windows）。
- [Cachegrind] 和 [Callgrind] 提供全局、每个函数和每个源代码行的指令计数以及模拟缓存和分支预测数据。它们适用于 Linux 和其他一些 Unix 系统。
- [DHAT] 适用于找出代码中导致大量分配的部分，并提供有关峰值内存使用情况的见解。它还可以用于识别对 `memcpy` 的热调用。它适用于 Linux 和其他一些 Unix 系统。[dhat-rs] 是一个实验性的替代方案，功能稍弱，需要对 Rust 程序进行轻微更改，但适用于所有平台。
- [heaptrack] 和 [bytehound] 是堆分析工具。它们适用于 Linux。
- [`counts`] 支持临时性能分析，结合 `eprintln!` 语句和基于频率的后处理，适用于获取代码部分的领域特定见解。它适用于所有平台。
- [Coz] 执行*因果分析*以测量优化潜力，并通过 [coz-rs] 支持 Rust。它适用于 Linux。
- 
[perf]: https://perf.wiki.kernel.org/index.php/Main_Page
[Hotspot]: https://github.com/KDAB/hotspot
[Firefox Profiler]: https://profiler.firefox.com/
[Cachegrind]: https://www.valgrind.org/docs/manual/cg-manual.html
[Callgrind]: https://www.valgrind.org/docs/manual/cl-manual.html
[DHAT]: https://www.valgrind.org/docs/manual/dh-manual.html
[heaptrack]: https://github.com/KDE/heaptrack
[`counts`]: https://github.com/nnethercote/counts/
[Coz]: https://github.com/plasma-umass/coz
[coz-rs]: https://github.com/plasma-umass/coz/tree/master/rust
[flamegraph]: https://github.com/flamegraph-rs/flamegraph

为了有效地对发布版本进行性能分析，你可能需要启用源代码行调试信息。要做到这一点，在你的 `Cargo.toml` 文件中添加以下行：
```toml
[profile.release]
debug = 1
```
查看 [Cargo 文档] 以获取有关 `debug` 设置的更多详细信息。

[Cargo 文档]: https://doc.rust-lang.org/cargo/reference/profiles.html#debug

不幸的是，即使执行了上述步骤，你也无法获得标准库代码的详细性能分析信息。这是因为 Rust 标准库的发布版本未使用调试信息构建。

最可靠的解决方法是构建自己的编译器和标准库版本，遵循 [这些说明]，并在 `config.toml` 文件中添加以下行：
```toml
[rust]
debuginfo-level = 1
```
这可能有些麻烦，但在某些情况下值得努力。

[这些说明]: https://github.com/rust-lang/rust

另外，不稳定的 [build-std] 功能允许你将标准库作为程序正常编译的一部分进行编译，使用相同的构建配置。然而，标准库调试信息中存在的文件名将不指向源代码文件，因为此功能不会下载标准库源代码。因此，这种方法对于像 Cachegrind 和 Samply 这样需要源代码才能完全工作的性能分析工具并不适用。

[build-std]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std

## Symbol Demangling

Rust在编译代码中使用了一个杂乱的方案来编码函数名。如果一个剖析器不知道这个方案，它的输出可能会包含像这样的符号名
`_ZN3foo3barE`或`_ZN28_$u7b$$u7b$closure$u7d$$u7d$E`或`_ZN28_$u7b$$$u7d$E`或
`_ZN88_$LT$core.result.Result$LT$$u21$$C$$u20$E$GT$u20$as$u20$std.process.Termination$GT$6report17hfc41d0da4a40b3e8E`。
像这样的名字，可以用[`rustfilt`]手动拆分。

[`rustfilt`]: https://crates.io/crates/rustfilt

如果在进行性能分析时遇到符号解缠混淆的问题，可能值得将 [编码格式] 从默认的传统格式更改为更新的 v0 格式。

[编码格式]: https://doc.rust-lang.org/rustc/codegen-options/index.html#symbol-mangling-version

要从命令行中使用 v0 格式，可以使用 `-C symbol-mangling-version=v0` 标志。例如：
```bash
RUSTFLAGS="-C symbol-mangling-version=v0" cargo build --release
```

另外，要从 [`config.toml`] 文件（针对一个或多个项目）请求这些说明，添加以下行：
```toml
[build]
rustflags = ["-C", "symbol-mangling-version=v0"]
```
[`config.toml`]: https://doc.rust-lang.org/cargo/reference/config.html