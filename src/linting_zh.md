# Linting

[Clippy]是一个用来捕捉Rust代码中常见错误的lints集合。它是运行在Rust代码上的一个优秀工具。它还可以帮助提高性能，因为许多lints与可能导致次优性能的代码模式有关。

[Clippy]: https://github.com/rust-lang/rust-clippy

鉴于自动检测问题优于手动检测问题，本书的其余部分将不会提及 Clippy 默认检测到的性能问题。

## 基础

Clippy 是一个 Rust 的 lint 工具，用于静态代码分析。安装后，可以通过以下命令轻松运行：

```text
cargo clippy
```

可以通过访问 [lint list] 并取消选择除了 "Perf" 之外的所有 lint 组，查看完整的性能 lint 列表。

[lint list]: https://rust-lang.github.io/rust-clippy/master/

除了使代码更快之外，性能 lint 建议通常会导致更简单、更符合惯例的代码，因此即使对于不经常执行的代码，也值得遵循这些建议。

相反，一些非性能 lint 建议可能会提高性能。例如，[`ptr_arg`] 风格 lint 建议将各种容器参数更改为切片，例如将 `&mut Vec<T>` 参数更改为 `&mut [T]`。这里的主要动机是切片提供了更灵活的 API，但也可能由于减少间接性和为编译器提供更好的优化机会而导致更快的代码。
[**Example**](https://github.com/fschutt/fastblur/pull/3/files).

[`ptr_arg`]: https://rust-lang.github.io/rust-clippy/master/index.html#ptr_arg

## Disallowing Types

在接下来的章节中，我们将看到有时候值得避免使用某些标准库类型，而选择更快的替代方案。如果你决定使用这些替代方案，很容易在某些地方意外地错误使用标准库类型。

你可以使用 Clippy 的 [`disallowed_types`] lint 来避免这个问题。例如，为了禁止使用标准哈希表（原因在 [Hashing] 部分有解释），可以在你的代码中添加一个 `clippy.toml` 文件，并包含以下行。

```toml
disallowed-types = ["std::collections::HashMap", "std::collections::HashSet"]
```

[Hashing]: hashing.md
[`disallowed_types`]: https://rust-lang.github.io/rust-clippy/master/index.html#disallowed_types