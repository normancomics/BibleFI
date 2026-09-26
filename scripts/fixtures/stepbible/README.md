# STEPBible parser fixtures

Verbatim excerpts from [STEPBible-Data](https://github.com/STEPBible/STEPBible-Data),
created by [Tyndale House Cambridge](https://www.tyndalehouse.com) and curated by
[STEPBible.org](https://www.STEPBible.org). Licensed **CC BY 4.0**.

- `tahot-sample.txt` — Hebrew OT (TAHOT), Genesis 1
- `tagnt-sample.txt` — Greek NT (TAGNT), Matthew 1

Committed rather than downloaded at test time so the parser tests are hermetic:
this repo's edge functions fetch STEPBible at runtime, but many CI and agent
environments block outbound egress to raw.githubusercontent.com.
