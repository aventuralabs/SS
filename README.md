SS
==

Ultra-fast string similarity and scoring metrics. This repo intends to provide the fastest implementations possible
for a set of common string metrics. Speed scores are based on scale of 0 to 100, relative to other algorithms

11KB development, < 2KB minified and gzipped

## Similarity measures

#### SS.jw(str1, str2)
*Speed score: 67*. Jaro-Winkler similarity (based on Lars Marius Garshol Java implementation).

#### SS.leven(str1, str2)
*Speed score: 35*. Levenshtein distance between two strings.

#### SS.longest(str1, str2)
*Speed score: 20*. Length of longest common substring.

#### SS.potter(str1, str2, fuzziness)
*Speed score: 100*. Optimized version of Joshaven Potter's string score. Fuzziness between 0 (exact) and 1.


## Phonetic conversions

#### SS.cellex(str)
Variation of Phonex created by the author. As opposed to Phonex, first letters are encoded, duplicates are preserved,
results are not limited by length.

#### SS.phonex(str)
Returns the Phonex encoding of a string.
