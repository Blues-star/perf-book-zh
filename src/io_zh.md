# I/O

## Locking

Rust的[`print!`]和[`println!`]宏在每次调用时锁定stdout。如果你需要重复调用这些宏，最好手动锁定stdout。

[`print!`]: https://doc.rust-lang.org/std/macro.print.html
[`println!`]: https://doc.rust-lang.org/std/macro.println.html

例如，修改这段代码。
```rust
# let lines = vec!["one", "two", "three"];
for line in lines {
    println!("{}", line);
}
```
to this:
```rust
# fn blah() -> Result<(), std::io::Error> {
# let lines = vec!["one", "two", "three"];
use std::io::Write;
let mut stdout = std::io::stdout();
let mut lock = stdout.lock();
for line in lines {
    writeln!(lock, "{}", line)?;
}
// stdout is unlocked when `lock` is dropped
# Ok(())
# }
```
当对stdin和stderr进行重复操作时，同样可以锁定它们。

## 缓冲

Rust文件I/O默认是无缓冲的。如果你对文件或网络套接字有许多小的和重复的读写调用，使用[`BufReader`]或[`BufWriter`]。它们为输入和输出维护了一个内存缓冲区，最大限度地减少了系统调用的次数。

[`BufReader`]: https://doc.rust-lang.org/std/io/struct.BufReader.html
[`BufWriter`]: https://doc.rust-lang.org/std/io/struct.BufWriter.html

例如，修改这个无缓冲的输出代码。
```rust
# fn blah() -> Result<(), std::io::Error> {
# let lines = vec!["one", "two", "three"];
use std::io::Write;
let mut out = std::fs::File::create("test.txt").unwrap();
for line in lines {
    writeln!(out, "{}", line)?;
}
# Ok(())
# }
```
修改为：
```rust
# fn blah() -> Result<(), std::io::Error> {
# let lines = vec!["one", "two", "three"];
use std::io::{BufWriter, Write};
let mut out = std::fs::File::create("test.txt")?;
let mut buf = BufWriter::new(out);
for line in lines {
    writeln!(buf, "{}", line)?;
}
buf.flush()?;
# Ok(())
# }
```
对[`flush`]的显式调用并不是绝对必要的，因为当`buf`被丢弃时，刷新将自动发生。然而，在这种情况下，刷新时发生的任何错误都将被忽略，而显式刷新将使该错误显式化。

[`flush`]: https://doc.rust-lang.org/std/io/trait.Write.html#tymethod.flush

在编写时忘记使用缓冲区是比较常见的。无缓冲和有缓冲的写入器都实现了 [Write] trait，这意味着向无缓冲写入器和有缓冲写入器写入的代码基本相同。相比之下，无缓冲读取器实现了 [Read] trait，但有缓冲读取器实现了 [BufRead] trait，这意味着从无缓冲读取器和有缓冲读取器读取的代码是不同的。例如，使用无缓冲读取器逐行读取文件是困难的，但使用有缓冲读取器通过 [BufRead::read_line] 或 [BufRead::lines] 则很简单。因此，对于读取器来说，很难像对写入器那样编写一个示例，其中之前和之后的版本是如此相似。

[`Write`]: https://doc.rust-lang.org/std/io/trait.Write.html
[`Read`]: https://doc.rust-lang.org/std/io/trait.Read.html
[`BufRead`]: https://doc.rust-lang.org/std/io/trait.BufRead.html
[`BufRead::read_line`]: https://doc.rust-lang.org/std/io/trait.BufRead.html#method.read_line
[`BufRead::lines`]: https://doc.rust-lang.org/std/io/trait.BufRead.html#method.lines

最后，请注意，缓冲也适用于标准输出(stdout)，因此当向标准输出频繁写入时，您可能希望结合手动锁定和缓冲。

## Reading Lines from a File

[这一部分]解释了如何在使用 [BufRead] 逐行读取文件时避免过多的内存分配。

[这一部分]: heap-allocations_zh.md#reading-lines-from-a-file
[`BufRead`]: https://doc.rust-lang.org/std/io/trait.BufRead.html

## Reading Input as Raw Bytes

内置的[String]类型在内部使用UTF-8，当你读取输入到string类型时，会增加一个由UTF-8验证引起的小但非零的开销。如果你只想处理输入字节而不担心UTF-8（例如，如果你处理ASCII文本），你可以使用[`BufRead::read_until`]。

[String]: https://doc.rust-lang.org/std/string/struct.String.html
[`BufRead::read_until`]: https://doc.rust-lang.org/std/io/trait.BufRead.html#method.read_until

还有专门的箱子用于读取[面向字节的数据行]和处理[byte strings]。

[面向字节的数据行]: https://github.com/Freaky/rust-linereader
[byte strings]: https://github.com/BurntSushi/bstr
