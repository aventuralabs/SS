SS
==

Ultra-fast string similarity and scoring metrics. This repo intends to provide the fastest implementations possible
for a set of common string metrics.

#### SS.jw(str1, str2)
Jaro-Winkler similarity (based on Lars Marius Garshol Java implementation).

#### SS.potter(str1, str2, fuzziness)
Optimized version of Joshaven Potter's string score. Fuzziness between 0 (exact) and 1.

#### SS.longest(str1, str2)
Length of longest common substring.

#### SS.leven(str1, str2, maxDist)
Levenshtein distance between two strings. Optional maxDist used to speed up implementation.

#### SS.phonex(str)
Returns the Phonex encoding of a string.

#### SS.cellex(str)
Variation of Phonex created by the author. As opposed to Phonex, first letters are encoded, duplicates are preserved,
results are not limited by length.
