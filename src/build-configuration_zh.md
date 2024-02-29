# 构建配置

您可以通过更改构建配置而不更改代码，从而显著改变 Rust 程序的性能。对于每个 Rust 程序，都有许多可能的构建配置。所选择的配置将影响编译代码的几个特征，如编译时间、运行时速度、内存使用、二进制大小、调试性、性能分析性以及编译程序将在哪些架构上运行。

大多数配置选择会改善一个或多个特征，同时恶化一个或多个其他特征。例如，一个常见的权衡是为了获得更高的运行时速度而接受更差的编译时间。对于您的程序来说，正确的选择取决于您的需求和程序的具体情况，与性能相关的选择（其中大部分都是）应该通过基准测试来验证。

请注意，Cargo 只查看工作区根目录下 Cargo.toml 文件中的配置设置。在依赖项中定义的配置设置将被忽略。因此，这些选项主要与二进制 crate 相关，而不是库 crate。

## 发布构建

最重要的一个Rust性能提示很简单，但[很容易被忽视]：当你想要高性能时，确保你使用的是release构建而不是debug构建。这通常是通过在Cargo中指定`--release`标志来实现的。

[很容易被忽视]: https://users.rust-lang.org/t/why-my-rust-program-is-so-slow/47764/5

开发构建是默认设置。它们适用于调试，但没有经过优化。如果运行 cargo build 或 cargo run，则会生成这些构建。（另外，运行 `rustc` 而不添加额外选项也会生成未经优化的构建。）

考虑以下来自 cargo build 运行的输出的最后一行。
```text
Finished dev [unoptimized + debuginfo] target(s) in 29.80s
```
这个输出表明已生成了一个开发构建。编译后的代码将放在 `target/debug/` 目录中。`cargo run` 将运行开发构建。

相比之下，发布构建经过了更多优化，省略了调试断言和整数溢出检查，也省略了调试信息。相对于开发构建，通常可以实现 10-100 倍的速度提升！如果运行 `cargo build --release` 或 `cargo run --release`，则会生成这些构建。（另外，`rustc` 有多个选项用于优化构建，如 `-O` 和 `-C opt-level`。）由于额外的优化，这通常会比开发构建花费更长的时间。

请看下面的`"cargo build --release"`运行的最后一行输出。
```text
Finished release [optimized] target(s) in 1m 01s
```
这个输出表明已生成了一个发布构建。编译后的代码将放在 `target/release/` 目录中。`cargo run --release` 将运行发布构建。

查看 [Cargo 配置文件文档] 以获取有关开发构建（使用 `dev` 配置文件）和发布构建（使用 `release` 配置文件）之间差异的更多详细信息。

[Cargo 配置文件文档]: https://doc.rust-lang.org/cargo/reference/profiles.html

发布构建中使用的默认构建配置选择在编译时间、运行时速度和二进制文件大小等方面提供了良好的平衡。但正如下文所述，还有许多可能的调整。

## 最大化运行时速度

以下构建配置选项主要旨在最大化运行时速度。其中一些选项也可能会减小二进制文件大小。

### codegen units

Rust编译器将crate分割为多个[codegen units]以并行化编译（从而加快速度）。然而，这可能导致它错过一些潜在的优化。您可以通过将单元数设置为1来提高运行时速度并减小二进制文件大小，但这会增加编译时间。请将以下行添加到`Cargo.toml`文件中：
```toml
[profile.release]
codegen-units = 1
```
<!-- Using `https` for this link triggers "potential security risk" warnings due
to a certificate problem. -->
[**Example 1**](http://likebike.com/posts/How_To_Write_Fast_Rust_Code.html#emit-asm),
[**Example 2**](https://github.com/rust-lang/rust/pull/115554#issuecomment-1742192440).

[codegen units]: https://doc.rust-lang.org/cargo/reference/profiles.html#codegen-units

### 链接时优化

[链接时优化]（LTO）是一种整体程序优化技术，可以提高运行时速度10-20%或更多，并减小二进制文件大小，但会导致较差的编译时间。它有几种形式。

[链接时优化]: https://doc.rust-lang.org/cargo/reference/profiles.html#lto

LTO的第一种形式是thin local LTO，这是一种轻量级的LTO形式。默认情况下，编译器会在涉及非零优化级别的任何构建中使用此形式。这包括发布构建。要显式请求此级别的LTO，请将以下行放入Cargo.toml文件中：
```toml
[profile.release]
lto = false
```
LTO的第二种形式是thin LTO，它稍微更具侵略性，可能会提高运行时速度并减小二进制文件大小，同时也会增加编译时间。在Cargo.toml中使用lto = "thin"来启用它。

LTO的第三种形式是fat LTO，它更具侵略性，可能会进一步提高性能并减小二进制文件大小，同时再次增加构建时间。在Cargo.toml中使用lto = "fat"来启用它。

最后，可以完全禁用LTO，这可能会降低运行时速度并增加二进制文件大小，但会减少编译时间。在Cargo.toml中使用lto = "off"来实现此目的。请注意，这与lto = false选项不同，如上所述，后者会保留thin local LTO。

### 替代分配器
可以使用替代分配器替换Rust程序使用的默认（系统）堆分配器。具体效果取决于个别程序和所选择的替代分配器，但在实践中已经看到了运行时速度大幅提升和内存使用大幅减少。效果还会因平台而异，因为每个平台的系统分配器都有其优势和劣势。使用替代分配器还可能增加二进制文件大小和编译时间。

#### jemalloc

一种流行的适用于Linux和Mac的替代分配器是[jemalloc]，可通过[`tikv-jemallocator`] crate使用。要使用它，请在您的Cargo.toml文件中添加一个依赖项：
```toml
[dependencies]
tikv-jemallocator = "0.5"
```
然后在您的Rust代码中添加以下内容，例如在`src/main.rs`的顶部：
```rust,ignore
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;
```

此外，在Linux上，jemalloc可以配置为使用[透明大页][THP]。这可以进一步加快程序的运行速度，可能会以更高的内存使用为代价。

[THP]: https://www.kernel.org/doc/html/next/admin-guide/mm/transhuge.html

在构建程序之前，通过适当设置 `MALLOC_CONF` 环境变量来执行此操作，例如：
```bash
MALLOC_CONF="thp:always,metadata_thp:always" cargo build --release
```
运行编译程序的系统还必须配置为支持THP。有关更多详细信息，请参阅[此博客]。

[此博客]: https://kobzol.github.io/rust/rustc/2023/10/21/make-rust-compiler-5percent-faster.html

#### mimalloc

另一个适用于许多平台的替代分配器是[mimalloc]，可通过[mimalloc] crate使用。要使用它，请在您的`Cargo.toml`文件中添加一个依赖项：
```toml
[dependencies]
mimalloc = "0.1"
```
然后在您的Rust代码中添加以下内容，例如在`src/main.rs`的顶部：
```rust,ignore
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;
```

[jemalloc]: https://github.com/jemalloc/jemalloc
[`tikv-jemallocator`]: https://crates.io/crates/tikv-jemallocator
[better performance]: https://github.com/rust-lang/rust/pull/83152
[mimalloc]: https://github.com/microsoft/mimalloc
[`mimalloc`]: https://crates.io/crates/mimalloc

## 使用CPU专用指令

如果您不关心二进制文件在旧版（或其他类型的）处理器上的兼容性，您可以告诉编译器生成针对特定CPU架构的最新（可能是最快的）指令，比如针对x86-64 CPU的AVX SIMD指令。

[特定CPU架构]: https://doc.rust-lang.org/1.41.1/rustc/codegen-options/index.html#target-cpu

例如，如果你把`-C target-cpu=native`传给rustc，它将使用当前CPU的最佳指令。
```bash
$ RUSTFLAGS="-C target-cpu=native" cargo build --release
```
或者，要从一个[config.toml]文件（用于一个或多个项目）中请求这些指令，请添加以下行：
```toml
[build]
rustflags = ["-C", "target-cpu=native"]
```
[`config.toml`]: https://doc.rust-lang.org/cargo/reference/config.html

这可能会有助于提升运行时的性能，特别是当编译器在你的代码中发现矢量化的机会时。

如果您不确定`-C target-cpu=native`是否达到了最佳效果，请比较`rustc --print cfg`和`rustc --print cfg -C target-cpu=native`的输出，看看在后一种情况下是否正确检测到了CPU特性。如果没有，您可以使用`-C target-feature`来针对特定特性。

## Profile-guided Optimization

Profile-guided optimization(PGO)是一种编译模式，即编译程序后，在收集样本数据的同时在样本数据上运行，然后用样本数据引导程序的第二次编译。这可以提升10%或更多的运行时性能
[**Example 1**](https://blog.rust-lang.org/inside-rust/2020/11/11/exploring-pgo-for-the-rust-compiler.html),
[**Example 2**](https://github.com/rust-lang/rust/pull/96978).

这是一种高级技术，需要一些设置工作，但在某些情况下是值得的。详细信息请参阅[rustc PGO文档]。此外，[cargo-pgo]命令使使用PGO（以及类似的[BOLT]）来优化Rust二进制文件变得更加容易。

不幸的是，对于托管在crates.io上并通过cargo install分发的二进制文件，不支持PGO，这限制了其可用性。

[rustc PGO文档]: https://doc.rust-lang.org/rustc/profile-guided-optimization.html
[`cargo-pgo`]: https://github.com/Kobzol/cargo-pgo
[BOLT]: https://github.com/llvm/llvm-project/tree/main/bolt

## 最小化二进制文件大小

以下构建配置选项主要旨在最小化二进制文件大小。它们对运行时速度的影响各不相同。

### 优化级别

您可以通过向`Cargo.toml`文件添加以下行来请求一个旨在最小化二进制文件大小的优化级别：
```toml
[profile.release]
opt-level = "z"
```
[optimization level]: https://doc.rust-lang.org/cargo/reference/profiles.html#opt-level

这可能会降低运行时速度。

另一种选择是`opt-level = "s"`，它针对最小化二进制文件大小的目标略微不那么激进。与`opt-level = "z"`相比，它允许[稍微更多的内联]和循环的矢量化。

[稍微更多的内联]: https://doc.rust-lang.org/rustc/codegen-options/index.html#inline-threshold

### 在`panic!`时中止

如果您不需要在发生恐慌时展开，例如因为您的程序不使用[`catch_unwind`]，您可以告诉编译器在恐慌时简单地[abort on panic]。在发生恐慌时，您的程序仍将生成回溯信息。

[`catch_unwind`]: https://doc.rust-lang.org/std/panic/fn.catch_unwind.html
[abort on panic]: https://doc.rust-lang.org/cargo/reference/profiles.html#panic

这可能会减小二进制文件大小并略微增加运行时速度，甚至可能会略微减少编译时间。将以下内容添加到`Cargo.toml`文件中：
```toml
[profile.release]
panic = "abort"
```

### 剥离调试信息和符号

您可以告诉编译器从编译后的二进制文件中[剥离]调试信息和符号。将以下内容添加到`Cargo.toml`中以仅剥离调试信息：

```toml
[profile.release]
strip = "debuginfo"
```

或者，使用`strip = "symbols"`来同时剥离调试信息和符号。

剥离调试信息可以极大地减小二进制文件大小。在Linux上，当剥离调试信息时，一个小型Rust程序的二进制文件大小可能会缩小4倍。剥离符号也可以减小二进制文件大小，尽管通常不会减少那么多。[**示例**](https://github.com/nnethercote/counts/commit/53cab44cd09ff1aa80de70a6dbe1893ff8a41142)。具体效果取决于平台。

然而，剥离会使您编译的程序更难以调试和分析性能。例如，如果一个被剥离的程序发生恐慌，生成的回溯信息可能会比正常情况下包含的信息更少。两种剥离级别的具体效果取决于平台。

### 其他想法

要了解更多高级的二进制文件大小最小化技术，请参考优秀的[`min-sized-rust`]存储库中的全面文档。

[`min-sized-rust`]: https://github.com/johnthagen/min-sized-rust

## 最小化编译时间

以下构建配置选项主要旨在最小化编译时间。

### 链接

编译时间的一个重要部分实际上是链接时间，特别是在对程序进行小改动后重新构建时。可以选择比默认链接器更快的链接器。

一个选择是[lld]，它在Linux和Windows上都可用。要从命令行指定lld，请使用`-C link-arg=-fuse-ld=lld`标志。例如：
```bash
RUSTFLAGS="-C link-arg=-fuse-ld=lld" cargo build --release
```

[lld]: https://lld.llvm.org/

另一种方法是从[`config.toml`]文件（针对一个或多个项目）中指定lld，添加以下内容：
```toml
[build]
rustflags = ["-C", "link-arg=-fuse-ld=lld"]
```
[`config.toml`]: https://doc.rust-lang.org/cargo/reference/config.html

lld目前并不完全支持与Rust一起使用，但在Linux和Windows上的大多数用例中应该可以工作。有一个[GitHub Issue]跟踪lld的完全支持。

另一个选择是[mold]，目前在Linux和macOS上可用。只需在上述说明中用`mold`替换`lld`。mold通常比lld更快。它也要新得多，可能不适用于所有情况。

[mold]: https://github.com/rui314/mold

与本章中的其他选项不同，这里没有任何权衡！替代链接器可以显著提高速度，而没有任何不利影响。

[GitHub Issue]: https://github.com/rust-lang/rust/issues/39915#issuecomment-618726211

### 实验性并行前端

如果您使用nightly版的Rust，可以启用实验性的[并行前端]。这可能会减少编译时间，但会增加编译时内存的使用。它不会影响生成的代码质量。

[并行前端]: https://blog.rust-lang.org/2023/11/09/parallel-rustc.html

您可以通过将`-Zthreads=N`添加到RUSTFLAGS来实现，例如：
```bash
RUSTFLAGS="-Zthreads=8" cargo build --release
```

或者，要从[`config.toml`]文件（针对一个或多个项目）启用并行前端，添加以下内容：
```toml
[build]
rustflags = ["-Z", "threads=8"]
```
[`config.toml`]: https://doc.rust-lang.org/cargo/reference/config.html

除了`8`之外，还可以使用其他值，但这个数字通常会产生最佳结果。

在最佳情况下，实验性并行前端可以将编译时间缩短高达50%。但效果因代码特性和构建配置的不同而异，对于某些程序，编译时间可能不会有所改喀。

### Cranelift代码生成后端

如果您在x86-64/Linux或ARM/Linux上使用nightly版的Rust，可以启用Cranelift代码生成后端。它可能会减少编译时间，但会以生成的代码质量降低为代价，因此建议用于开发构建而不是发布构建。

首先，使用以下`rustup`命令安装后端：
```bash
rustup component add rustc-codegen-cranelift-preview --toolchain nightly
```

要从命令行选择Cranelift，请使用`-Zcodegen-backend=cranelift`标志。例如：
```bash
RUSTFLAGS="-Zcodegen-backend=cranelift" cargo +nightly build
```

或者，要从[`config.toml`]文件（针对一个或多个项目）指定Cranelift，添加以下内容：
```toml
[unstable]
codegen-backend = true

[profile.dev]
codegen-backend = "cranelift"
```
[`config.toml`]: https://doc.rust-lang.org/cargo/reference/config.html

有关更多信息，请参阅[Cranelift文档]。

[Cranelift文档]: https://github.com/rust-lang/rustc_codegen_cranelift

## 自定义配置文件

除了`dev`和`release`配置文件外，Cargo还支持[自定义配置文件]。例如，如果您发现开发构建的运行时速度不够，发布构建的编译时间对日常开发来说太慢，那么创建一个介于`dev`和`release`之间的自定义配置文件可能会很有用。

[自定义配置文件]: https://doc.rust-lang.org/cargo/reference/profiles.html#custom-profiles

## 总结

在构建配置方面有许多选择需要考虑。以下总结了上述信息并提出了一些建议。

- 如果您想最大化运行时速度，请考虑以下所有内容：`codegen-units = 1`、`lto = "fat"`、替代分配器和`panic = "abort"`。
- 如果您想最小化二进制文件大小，请考虑`opt-level = "z"`、`codegen-units = 1`、`lto = "fat"`、`panic = "abort"`和`strip = "symbols"`。
- 在任何情况下，如果不需要广泛的架构支持，请考虑使用`-C target-cpu=native`，如果与您的分发机制兼容，请考虑使用`cargo-pgo`。
- 如果您所在的平台支持更快的链接器，请始终使用它，因为这样做没有任何不利之处。
- 逐个对所有更改进行基准测试，以确保它们产生预期效果。

最后，[此问题]跟踪了Rust编译器自身构建配置的演变。Rust编译器的构建系统比大多数Rust程序更奇特和复杂。尽管如此，这个问题可能有助于展示如何将构建配置选择应用于大型程序。

[此问题]: https://github.com/rust-lang/rust/issues/103595