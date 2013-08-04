"use strict";

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // The top-level namespace. All public SS classes and modules will
  // be attached to this. Exported for both the browser and the server.
  var SS;
  if (typeof exports !== 'undefined') {
    SS = exports;
  } else {
    SS = root.SS = {};
  }



  /*!
   * string_score.js: String Scoring Algorithm 0.1.10 
   *
   * http://joshaven.com/string_score
   * https://github.com/joshaven/string_score
   *
   * Copyright (C) 2009-2011 Joshaven Potter <yourtech@gmail.com>
   * Special thanks to all of the contributors listed here https://github.com/joshaven/string_score
   * MIT license: http://www.opensource.org/licenses/mit-license.php
   *
   * Date: Tue Mar 1 2011
   *
   * Substantially optimized by Brandon Carl on Tue Jun 11 2013
   * Also includes custom triple score function to speed up application-specific execution
   *
  */

  SS.potter = function(str1, str2, fuzziness) {

    // If the strings are equal, perfect match.
    if (str1 == str2) return 1;

    //if it's not a perfect match and is empty return 0
    if( str2 == "") return 0;

    var runningScore = 0,
        charScore,
        finalScore,
        lStr1 = str1.toLowerCase(),
        str1Len = str1.length,
        lStr2 = str2.toLowerCase(),
        str2Len = str2.length,
        idxOf,
        startAt = 0,
        fuzzies = 1,
        fuzzyFactor;
    
    if (fuzziness) fuzzyFactor = 1 - fuzziness;

    // Walk through str2 and add up scores.
    if (fuzziness) {
      for (var i = 0; i < str2Len; ++i) {
        
        idxOf = lStr1.indexOf(lStr2[i], startAt);
        
        if (-1 === idxOf) {
          fuzzies += fuzzyFactor;
          continue;
        } else if (startAt === idxOf) {
          charScore = 0.7;
        } else {
          charScore = 0.1;
          if (str1[idxOf - 1] === ' ') charScore += 0.8;
        }
        
        if (str1[idxOf] === str2[i]) charScore += 0.1; 
             
        runningScore += charScore;
        startAt = idxOf + 1;

      }
    } else {
      for (var i = 0; i < str2Len; ++i) {
      
        idxOf = lStr1.indexOf(lStr2[i], startAt);
        
        if (-1 === idxOf) {
          return 0;
        } else if (startAt === idxOf) {
          charScore = 0.7;
        } else {
          charScore = 0.1;
          if (str1[idxOf - 1] === ' ') charScore += 0.8;
        }
        
        if (str1[idxOf] === str2[i]) charScore += 0.1; 

        runningScore += charScore;
        startAt = idxOf + 1;
      }
    }


    finalScore = 0.5 * (runningScore / str1Len  + runningScore / str2Len) / fuzzies;
    
    if ((lStr2[0] === lStr1[0]) && (finalScore < 0.85)) {
      finalScore += 0.15;
    }
    
    return finalScore;
  };



  // Longest substring

  SS.longest = function(str1, str2, caseSensitive) {

    if (!caseSensitive) {
      str1 = str1.toUpperCase();
      str2 = str2.toUpperCase();
    }

    if ((str1 == '') || (str2 == '')) return 0;
    if (str1 == str2) return str1.length;

    var maxlen = 0;

    var tmp = [], num = [];
    for (var j = 0; j < str2.length; ++j) tmp.push(0);
    for (var i = 0; i < str1.length; ++i) num.push(tmp.slice(0));

    for (var i = 0; i < str1.length; ++i)
      for (var j = 0; j < str2.length; ++j) {
        if (str1[i] != str2[j])
          num[i][j] = 0;
        else {
          if ((i == 0) || (j == 0))
            num[i][j] = 1;
          else
            num[i][j] = 1 + num[i-1][j-1];

          if (num[i][j] > maxlen) maxlen = num[i][j];
        } 
      }

    return maxlen;
  }




  // Levenshtein distance. Fastest taken from jsPerf
  // http://jsperf.com/levenshtein-algorithms/4

  var min3 = function(a, b, c) {
    return (a < b ? (a < c ? a : c) : b < c ? b : c);
  };
  
  SS.levenDist = function(str1, str2, caseSensitive) {

    if (!caseSensitive) {
      str1 = str1.toUpperCase();
      str2 = str2.toUpperCase();
    }

    var i, j, cost, v0, v1, v_tmp, b, c, L1 = str1.length,
        L2 = str2.length;

    if (L1 === 0) {
      return L2;
    } else if (L2 === 0) {
      return L1;
    } else if (str1 === str2) {
      return 0;
    }

    v0 = new Array(L1 + 1);
    v1 = new Array(L1 + 1);
    for (i = 0; i < L1 + 1; i++) {
      v0[i] = i;
    }
    for (j = 1; j <= L2; j++) {
      v1[0] = j;
      for (i = 0; i < L1; i++) {
        cost = (str1[i] === str2[j - 1]) ? 0 : 1;
        v1[i + 1] = min3(v0[i + 1] + 1, v1[i] + 1, v0[i] + cost);

      }
      v_tmp = v0;
      v0 = v1;
      v1 = v_tmp;
    }

    return v0[L1];
  };


  SS.leven = function(str1, str2, caseSensitive) {
    var dist = SS.levenDist(str1, str2, caseSensitive);
    return (1.0 - dist/Math.max(str1.length, str2.length));
  }


  // Jaro-Winkler similarity (based on Lars Marius Garshol Java implementation).
  // To date, he has licensed as Apache 2.0. Please see his implementation for updated
  // licensing.

  SS.jw = function(str1, str2, caseSensitive) {

    if (!caseSensitive) {
      str1 = str1.toUpperCase();
      str2 = str2.toUpperCase();
    }

    // If the string is equal to the word, perfect match.
    if (str1 == str2) return 1;

    // Ensure str is shorter than str2
    if (str1.length > this.length) {
      var tmp = str2;
      str2 = str1;
      str1 = tmp;
    }

    // Variable declarations

    // Find number of chars strings have in common.
    // Matching chars can only be half longer string apart.

    var maxDist = parseInt(0.5 * str2.length),
        c = 0,            // Common chars count
        t = 0,            // Transposition count
        ch, i, j,
        prevPos = -1,
        score;

    for (i = 0; i < str1.length; ++i) {
      ch = str1[i];

      // Try to find character in str2
      for (j = Math.max(0,i-maxDist); j < Math.min(str2.length,i+maxDist); ++j) {
        if (ch == str2[j]) {
          // Found
          c++;
          if (-1 != prevPos && j < prevPos) t++;
          prevPos = j;
          break;
        }
      }
    }

    // If nothing found, return zero
    if (0 == c) return 0.0;

    // Compute the score
    score = (c/str1.length + c/str2.length + (c-t)/c) / 3.0;

    // Common prefix modification (Winkler) 
    var p ,
        last = Math.min(4, str1.length);
        for (p = 0; p < last && str1[p] == str2[p]; p++);

    score = score + ((p * (1 - score)) / 10);

    return score;
  }




  // Phonex is adapted from An Assessment of Name Matching Algorithms by Lait and Randall
  // Paper is available at http://www.cs.utah.edu/contest/2005/NameMatching.pdf

  var isVowelY = function(c) {
    return ['A','E','I','O','U','Y'].indexOf(c) > -1;
  };

  SS.phonex = function(str) {
    var word = str.toUpperCase(),
        chr,
        next,
        y = 1,
        code,
        last = -1;

    // Remove trailing Ss
    word = word.replace(/S+$/, '')
      .replace(/^KN/, 'N')
      .replace(/^PH/, 'F')
      .replace(/^WR/, 'R')
      .replace(/^H/, '');

    if (!word.length) return '';

    switch (word[0]) {
      case 'E','I','O','U','Y':
        word = 'A' + word.slice(1);
        break;
      case 'P':
        word = 'B' + word.slice(1);
        break;
      case 'V':
        word = 'F' + word.slice(1);
        break;
      case 'K', 'Q':
        word = 'C' + word.slice(1);
        break;
      case 'J':
        word = 'G' + word.slice(1);
        break;
      case 'Z':
        word = 'S' + word.slice(1);
        break;
    }

    next = word[0];

    for (var i = 0; i < word.length; ++i) {
      chr = next;
      next = word[i+1] || '';

      if (' ' == chr || ',' == chr) break;
      // if (y >= 4) break;

      code = 0;

      switch (chr) {
        case 'B':
        case 'P':
        case 'F':
        case 'V':
          code = 1;
          break;
        case 'C':
        case 'S':
        case 'K':
        case 'G':
        case 'J':
        case 'Q':
        case 'X':
        case 'Z':
          code = 2;
          break;
        case 'D':
        case 'T':
          if (next != 'C') code = 3;
          break;
        case 'L':
          if (isVowelY(next) || '' == next) code = 4;
          break;
        case 'M':
        case 'N':
          if (next == 'D' || next == 'G') word = word.slice(0,i+1) + word.slice(i+2);
          code = 5;
          break;
        case 'R':
          if (isVowelY(next) || '' == next) code = 6;
      }

      if (last != code && code != 0 && i != 0) {
        word = word.slice(0, y) + code + word.slice(y + 1);
        y++;
      }

      last = word[y-1];
      if (1 == y) last = code;
    }

    // while (y < 4) word[y++] = '0';
    word = word.slice(0, y);

    return word;
  };



  // Cellex is a less stringent form of Phonex. The variation encodes initial letters,
  // retains rather than consumes duplicates, and does not limit the length of results.
  // Copyright(c) 2013 Brandon Carl <brandon.j.carl@gmail.com>
  // MIT Licensed

  SS.cellex = function(str) {
    var word = str.toUpperCase(),
        chr,
        next,
        y = 0,
        code,
        last = -1;

    // Remove trailing Ss
    word = word.replace(/S+$/, '')
      .replace(/^KN/, 'N')
      .replace(/^PH/, 'F')
      .replace(/^WR/, 'R')
      .replace(/^H/, '');

    if (!word.length) return '';

    switch (word[0]) {
      case 'E','I','O','U','Y':
        word = 'A' + word.slice(1);
        break;
      case 'P':
        word = 'B' + word.slice(1);
        break;
      case 'V':
        word = 'F' + word.slice(1);
        break;
      case 'K', 'Q':
        word = 'C' + word.slice(1);
        break;
      case 'J':
        word = 'G' + word.slice(1);
        break;
      case 'Z':
        word = 'S' + word.slice(1);
        break;
    }

    next = word[0];

    for (var i = 0; i < word.length; ++i) {
      chr = next;
      next = word[i+1] || '';

      if (' ' == chr || ',' == chr) break;
      // if (y >= 4) break;

      code = 0;

      switch (chr) {
        case 'B':
        case 'P':
        case 'F':
        case 'V':
          code = 1;
          break;
        case 'C':
        case 'S':
        case 'K':
        case 'G':
        case 'J':
        case 'Q':
        case 'X':
        case 'Z':
          code = 2;
          break;
        case 'D':
        case 'T':
          if (next != 'C') code = 3;
          break;
        case 'L':
          if (isVowelY(next) || '' == next) code = 4;
          break;
        case 'M':
        case 'N':
          if (next == 'D' || next == 'G') word = word.slice(0,i+1) + word.slice(i+2);
          code = 5;
          break;
        case 'R':
          if (isVowelY(next) || '' == next) code = 6;
      }

      if (code != 0) {
        word = word.slice(0, y) + code + word.slice(y + 1);
        y++;
      } else {
        if (0 == i) y++;
      }

      last = word[y-1];
      if (1 == y) last = code;
    }

    word = word.slice(0, y);

    return word;
  };


}).call(this);