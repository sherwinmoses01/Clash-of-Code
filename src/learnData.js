// ==========================================================================
// Clash of Code - Striver's A2Z DSA Roadmap Data
// Curated problems from Striver's A2Z Sheet with verified LeetCode links
// ==========================================================================

export const ROADMAP_STEPS = [
  {
    stepId: 1,
    stepNumber: "01",
    title: "Learn the Basics",
    desc: "Foundational programming logic, basic mathematics, recursion, and hashing concepts.",
    icon: "🧱",
    subtopics: [
      {
        subtopicName: "Basic Mathematics",
        problems: [
          {
            id: "1-1",
            title: "Reverse Integer",
            leetcodeId: 7,
            difficulty: "Medium",
            category: "Math",
            url: "https://leetcode.com/problems/reverse-integer/"
          },
          {
            id: "1-2",
            title: "Palindrome Number",
            leetcodeId: 9,
            difficulty: "Easy",
            category: "Math",
            url: "https://leetcode.com/problems/palindrome-number/"
          },
          {
            id: "1-3",
            title: "Find Greatest Common Divisor of Array",
            leetcodeId: 1979,
            difficulty: "Easy",
            category: "Math / GCD",
            url: "https://leetcode.com/problems/find-greatest-common-divisor-of-array/"
          },
          {
            id: "1-4",
            title: "Armstrong Number",
            leetcodeId: 1134,
            difficulty: "Easy",
            category: "Math",
            url: "https://leetcode.com/problems/armstrong-number/"
          }
        ]
      },
      {
        subtopicName: "Basic Recursion & Hashing",
        problems: [
          {
            id: "1-5",
            title: "Fibonacci Number",
            leetcodeId: 509,
            difficulty: "Easy",
            category: "Recursion",
            url: "https://leetcode.com/problems/fibonacci-number/"
          },
          {
            id: "1-6",
            title: "Valid Palindrome",
            leetcodeId: 125,
            difficulty: "Easy",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/valid-palindrome/"
          },
          {
            id: "1-7",
            title: "Top K Frequent Elements",
            leetcodeId: 347,
            difficulty: "Medium",
            category: "Hashing",
            url: "https://leetcode.com/problems/top-k-frequent-elements/"
          }
        ]
      }
    ]
  },
  {
    stepId: 2,
    stepNumber: "02",
    title: "Important Sorting Techniques",
    desc: "Master key sorting paradigms: Merge Sort, Quick Sort, Dutch National Flag, and custom comparators.",
    icon: "⚡",
    subtopics: [
      {
        subtopicName: "Fundamental & Divide-and-Conquer Sorts",
        problems: [
          {
            id: "2-1",
            title: "Sort an Array (Merge / Quick Sort)",
            leetcodeId: 912,
            difficulty: "Medium",
            category: "Divide & Conquer",
            url: "https://leetcode.com/problems/sort-an-array/"
          },
          {
            id: "2-2",
            title: "Sort Colors (Dutch National Flag)",
            leetcodeId: 75,
            difficulty: "Medium",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/sort-colors/"
          },
          {
            id: "2-3",
            title: "Largest Number",
            leetcodeId: 179,
            difficulty: "Medium",
            category: "Sorting / Greedy",
            url: "https://leetcode.com/problems/largest-number/"
          },
          {
            id: "2-4",
            title: "Relative Sort Array",
            leetcodeId: 1122,
            difficulty: "Easy",
            category: "Counting Sort",
            url: "https://leetcode.com/problems/relative-sort-array/"
          }
        ]
      }
    ]
  },
  {
    stepId: 3,
    stepNumber: "03",
    title: "Solve Problems on Arrays",
    desc: "Core interview array problems categorized into Easy, Medium, and Hard milestones.",
    icon: "📊",
    subtopics: [
      {
        subtopicName: "Easy Array Problems",
        problems: [
          {
            id: "3-1",
            title: "Check if Array Is Sorted and Rotated",
            leetcodeId: 1752,
            difficulty: "Easy",
            category: "Arrays",
            url: "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/"
          },
          {
            id: "3-2",
            title: "Remove Duplicates from Sorted Array",
            leetcodeId: 26,
            difficulty: "Easy",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/"
          },
          {
            id: "3-3",
            title: "Rotate Array by K Steps",
            leetcodeId: 189,
            difficulty: "Medium",
            category: "Arrays",
            url: "https://leetcode.com/problems/rotate-array/"
          },
          {
            id: "3-4",
            title: "Move Zeroes",
            leetcodeId: 283,
            difficulty: "Easy",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/move-zeroes/"
          },
          {
            id: "3-5",
            title: "Missing Number",
            leetcodeId: 268,
            difficulty: "Easy",
            category: "Bit / Math",
            url: "https://leetcode.com/problems/missing-number/"
          },
          {
            id: "3-6",
            title: "Max Consecutive Ones",
            leetcodeId: 485,
            difficulty: "Easy",
            category: "Arrays",
            url: "https://leetcode.com/problems/max-consecutive-ones/"
          },
          {
            id: "3-7",
            title: "Single Number",
            leetcodeId: 136,
            difficulty: "Easy",
            category: "Bit Manipulation",
            url: "https://leetcode.com/problems/single-number/"
          }
        ]
      },
      {
        subtopicName: "Medium Array Problems",
        problems: [
          {
            id: "3-8",
            title: "Two Sum",
            leetcodeId: 1,
            difficulty: "Easy",
            category: "Hash Table",
            url: "https://leetcode.com/problems/two-sum/"
          },
          {
            id: "3-9",
            title: "Majority Element (> n/2)",
            leetcodeId: 169,
            difficulty: "Easy",
            category: "Boyer-Moore Voting",
            url: "https://leetcode.com/problems/majority-element/"
          },
          {
            id: "3-10",
            title: "Maximum Subarray (Kadane's Algo)",
            leetcodeId: 53,
            difficulty: "Medium",
            category: "Dynamic Programming",
            url: "https://leetcode.com/problems/maximum-subarray/"
          },
          {
            id: "3-11",
            title: "Best Time to Buy and Sell Stock",
            leetcodeId: 121,
            difficulty: "Easy",
            category: "Greedy",
            url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
          },
          {
            id: "3-12",
            title: "Rearrange Array Elements by Sign",
            leetcodeId: 2149,
            difficulty: "Medium",
            category: "Arrays",
            url: "https://leetcode.com/problems/rearrange-array-elements-by-sign/"
          },
          {
            id: "3-13",
            title: "Next Permutation",
            leetcodeId: 31,
            difficulty: "Medium",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/next-permutation/"
          },
          {
            id: "3-14",
            title: "Longest Consecutive Sequence",
            leetcodeId: 128,
            difficulty: "Medium",
            category: "Hash Set",
            url: "https://leetcode.com/problems/longest-consecutive-sequence/"
          },
          {
            id: "3-15",
            title: "Set Matrix Zeroes",
            leetcodeId: 73,
            difficulty: "Medium",
            category: "Matrix",
            url: "https://leetcode.com/problems/set-matrix-zeroes/"
          },
          {
            id: "3-16",
            title: "Rotate Image",
            leetcodeId: 48,
            difficulty: "Medium",
            category: "Matrix",
            url: "https://leetcode.com/problems/rotate-image/"
          },
          {
            id: "3-17",
            title: "Spiral Matrix",
            leetcodeId: 54,
            difficulty: "Medium",
            category: "Matrix",
            url: "https://leetcode.com/problems/spiral-matrix/"
          },
          {
            id: "3-18",
            title: "Subarray Sum Equals K",
            leetcodeId: 560,
            difficulty: "Medium",
            category: "Prefix Sum",
            url: "https://leetcode.com/problems/subarray-sum-equals-k/"
          }
        ]
      },
      {
        subtopicName: "Hard Array Problems",
        problems: [
          {
            id: "3-19",
            title: "Pascal's Triangle",
            leetcodeId: 118,
            difficulty: "Easy",
            category: "Dynamic Programming",
            url: "https://leetcode.com/problems/pascals-triangle/"
          },
          {
            id: "3-20",
            title: "Majority Element II (> n/3)",
            leetcodeId: 229,
            difficulty: "Medium",
            category: "Voting Algorithm",
            url: "https://leetcode.com/problems/majority-element-ii/"
          },
          {
            id: "3-21",
            title: "3Sum",
            leetcodeId: 15,
            difficulty: "Medium",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/3sum/"
          },
          {
            id: "3-22",
            title: "4Sum",
            leetcodeId: 18,
            difficulty: "Medium",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/4sum/"
          },
          {
            id: "3-23",
            title: "Merge Intervals",
            leetcodeId: 56,
            difficulty: "Medium",
            category: "Intervals",
            url: "https://leetcode.com/problems/merge-intervals/"
          },
          {
            id: "3-24",
            title: "Merge Sorted Array",
            leetcodeId: 88,
            difficulty: "Easy",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/merge-sorted-array/"
          },
          {
            id: "3-25",
            title: "Reverse Pairs",
            leetcodeId: 493,
            difficulty: "Hard",
            category: "Merge Sort / BIT",
            url: "https://leetcode.com/problems/reverse-pairs/"
          },
          {
            id: "3-26",
            title: "Maximum Product Subarray",
            leetcodeId: 152,
            difficulty: "Medium",
            category: "Dynamic Programming",
            url: "https://leetcode.com/problems/maximum-product-subarray/"
          }
        ]
      }
    ]
  },
  {
    stepId: 4,
    stepNumber: "04",
    title: "Binary Search",
    desc: "1D arrays, rotated sorted arrays, search space pruning, and 2D matrix binary search.",
    icon: "🎯",
    subtopics: [
      {
        subtopicName: "Binary Search on 1D Arrays",
        problems: [
          {
            id: "4-1",
            title: "Binary Search",
            leetcodeId: 704,
            difficulty: "Easy",
            category: "Binary Search",
            url: "https://leetcode.com/problems/binary-search/"
          },
          {
            id: "4-2",
            title: "Search Insert Position",
            leetcodeId: 35,
            difficulty: "Easy",
            category: "Binary Search",
            url: "https://leetcode.com/problems/search-insert-position/"
          },
          {
            id: "4-3",
            title: "Find First and Last Position in Sorted Array",
            leetcodeId: 34,
            difficulty: "Medium",
            category: "Binary Search",
            url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/"
          },
          {
            id: "4-4",
            title: "Search in Rotated Sorted Array",
            leetcodeId: 33,
            difficulty: "Medium",
            category: "Binary Search",
            url: "https://leetcode.com/problems/search-in-rotated-sorted-array/"
          },
          {
            id: "4-5",
            title: "Search in Rotated Sorted Array II",
            leetcodeId: 81,
            difficulty: "Medium",
            category: "Binary Search",
            url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/"
          },
          {
            id: "4-6",
            title: "Find Minimum in Rotated Sorted Array",
            leetcodeId: 153,
            difficulty: "Medium",
            category: "Binary Search",
            url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/"
          },
          {
            id: "4-7",
            title: "Single Element in a Sorted Array",
            leetcodeId: 540,
            difficulty: "Medium",
            category: "Binary Search",
            url: "https://leetcode.com/problems/single-element-in-a-sorted-array/"
          },
          {
            id: "4-8",
            title: "Find Peak Element",
            leetcodeId: 162,
            difficulty: "Medium",
            category: "Binary Search",
            url: "https://leetcode.com/problems/find-peak-element/"
          }
        ]
      },
      {
        subtopicName: "Binary Search on Answer / Search Space",
        problems: [
          {
            id: "4-9",
            title: "Sqrt(x)",
            leetcodeId: 69,
            difficulty: "Easy",
            category: "Math / BS",
            url: "https://leetcode.com/problems/sqrtx/"
          },
          {
            id: "4-10",
            title: "Koko Eating Bananas",
            leetcodeId: 875,
            difficulty: "Medium",
            category: "BS on Answer",
            url: "https://leetcode.com/problems/koko-eating-bananas/"
          },
          {
            id: "4-11",
            title: "Minimum Number of Days to Make m Bouquets",
            leetcodeId: 1482,
            difficulty: "Medium",
            category: "BS on Answer",
            url: "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/"
          },
          {
            id: "4-12",
            title: "Find the Smallest Divisor Given a Threshold",
            leetcodeId: 1283,
            difficulty: "Medium",
            category: "BS on Answer",
            url: "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/"
          },
          {
            id: "4-13",
            title: "Capacity To Ship Packages Within D Days",
            leetcodeId: 1011,
            difficulty: "Medium",
            category: "BS on Answer",
            url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/"
          },
          {
            id: "4-14",
            title: "Split Array Largest Sum",
            leetcodeId: 410,
            difficulty: "Hard",
            category: "BS on Answer",
            url: "https://leetcode.com/problems/split-array-largest-sum/"
          },
          {
            id: "4-15",
            title: "Median of Two Sorted Arrays",
            leetcodeId: 4,
            difficulty: "Hard",
            category: "Binary Search",
            url: "https://leetcode.com/problems/median-of-two-sorted-arrays/"
          }
        ]
      },
      {
        subtopicName: "Binary Search on 2D Matrices",
        problems: [
          {
            id: "4-16",
            title: "Search a 2D Matrix",
            leetcodeId: 74,
            difficulty: "Medium",
            category: "2D Matrix",
            url: "https://leetcode.com/problems/search-a-2d-matrix/"
          },
          {
            id: "4-17",
            title: "Search a 2D Matrix II",
            leetcodeId: 240,
            difficulty: "Medium",
            category: "2D Matrix",
            url: "https://leetcode.com/problems/search-a-2d-matrix-ii/"
          },
          {
            id: "4-18",
            title: "Find a Peak Element II",
            leetcodeId: 1901,
            difficulty: "Medium",
            category: "2D Matrix",
            url: "https://leetcode.com/problems/find-a-peak-element-ii/"
          }
        ]
      }
    ]
  },
  {
    stepId: 5,
    stepNumber: "05",
    title: "Strings [Basic & Medium]",
    desc: "String parsing, anagrams, palindrome windows, and Roman numerals.",
    icon: "🔤",
    subtopics: [
      {
        subtopicName: "Essential String Problems",
        problems: [
          {
            id: "5-1",
            title: "Remove Outermost Parentheses",
            leetcodeId: 1021,
            difficulty: "Easy",
            category: "Stack / String",
            url: "https://leetcode.com/problems/remove-outermost-parentheses/"
          },
          {
            id: "5-2",
            title: "Reverse Words in a String",
            leetcodeId: 151,
            difficulty: "Medium",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/reverse-words-in-a-string/"
          },
          {
            id: "5-3",
            title: "Largest Odd Number in String",
            leetcodeId: 1903,
            difficulty: "Easy",
            category: "Greedy / Math",
            url: "https://leetcode.com/problems/largest-odd-number-in-string/"
          },
          {
            id: "5-4",
            title: "Longest Common Prefix",
            leetcodeId: 14,
            difficulty: "Easy",
            category: "String Parsing",
            url: "https://leetcode.com/problems/longest-common-prefix/"
          },
          {
            id: "5-5",
            title: "Isomorphic Strings",
            leetcodeId: 205,
            difficulty: "Easy",
            category: "Hash Map",
            url: "https://leetcode.com/problems/isomorphic-strings/"
          },
          {
            id: "5-6",
            title: "Rotate String",
            leetcodeId: 796,
            difficulty: "Easy",
            category: "String",
            url: "https://leetcode.com/problems/rotate-string/"
          },
          {
            id: "5-7",
            title: "Valid Anagram",
            leetcodeId: 242,
            difficulty: "Easy",
            category: "Hash Table",
            url: "https://leetcode.com/problems/valid-anagram/"
          },
          {
            id: "5-8",
            title: "Sort Characters By Frequency",
            leetcodeId: 451,
            difficulty: "Medium",
            category: "Heap / Bucket",
            url: "https://leetcode.com/problems/sort-characters-by-frequency/"
          },
          {
            id: "5-9",
            title: "Roman to Integer",
            leetcodeId: 13,
            difficulty: "Easy",
            category: "Hash Map",
            url: "https://leetcode.com/problems/roman-to-integer/"
          },
          {
            id: "5-10",
            title: "String to Integer (atoi)",
            leetcodeId: 8,
            difficulty: "Medium",
            category: "Parsing",
            url: "https://leetcode.com/problems/string-to-integer-atoi/"
          },
          {
            id: "5-11",
            title: "Longest Palindromic Substring",
            leetcodeId: 5,
            difficulty: "Medium",
            category: "Dynamic Programming",
            url: "https://leetcode.com/problems/longest-palindromic-substring/"
          }
        ]
      }
    ]
  },
  {
    stepId: 6,
    stepNumber: "06",
    title: "Learn LinkedList",
    desc: "Single & Doubly LinkedList pointer manipulation, cycles, reversals, and sorting.",
    icon: "🔗",
    subtopics: [
      {
        subtopicName: "Medium & Hard LinkedList",
        problems: [
          {
            id: "6-1",
            title: "Middle of the Linked List",
            leetcodeId: 876,
            difficulty: "Easy",
            category: "Fast & Slow Pointers",
            url: "https://leetcode.com/problems/middle-of-the-linked-list/"
          },
          {
            id: "6-2",
            title: "Reverse Linked List",
            leetcodeId: 206,
            difficulty: "Easy",
            category: "Recursion / Iterative",
            url: "https://leetcode.com/problems/reverse-linked-list/"
          },
          {
            id: "6-3",
            title: "Linked List Cycle",
            leetcodeId: 141,
            difficulty: "Easy",
            category: "Floyd Cycle Detection",
            url: "https://leetcode.com/problems/linked-list-cycle/"
          },
          {
            id: "6-4",
            title: "Linked List Cycle II (Cycle Start)",
            leetcodeId: 142,
            difficulty: "Medium",
            category: "Floyd Cycle",
            url: "https://leetcode.com/problems/linked-list-cycle-ii/"
          },
          {
            id: "6-5",
            title: "Palindrome Linked List",
            leetcodeId: 234,
            difficulty: "Easy",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/palindrome-linked-list/"
          },
          {
            id: "6-6",
            title: "Odd Even Linked List",
            leetcodeId: 328,
            difficulty: "Medium",
            category: "Pointers",
            url: "https://leetcode.com/problems/odd-even-linked-list/"
          },
          {
            id: "6-7",
            title: "Remove Nth Node From End of List",
            leetcodeId: 19,
            difficulty: "Medium",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/"
          },
          {
            id: "6-8",
            title: "Delete Node in a Linked List",
            leetcodeId: 237,
            difficulty: "Medium",
            category: "Node Overwrite",
            url: "https://leetcode.com/problems/delete-node-in-a-linked-list/"
          },
          {
            id: "6-9",
            title: "Sort List (Merge Sort LL)",
            leetcodeId: 148,
            difficulty: "Medium",
            category: "Merge Sort",
            url: "https://leetcode.com/problems/sort-list/"
          },
          {
            id: "6-10",
            title: "Intersection of Two Linked Lists",
            leetcodeId: 160,
            difficulty: "Easy",
            category: "Two Pointers",
            url: "https://leetcode.com/problems/intersection-of-two-linked-lists/"
          },
          {
            id: "6-11",
            title: "Add Two Numbers",
            leetcodeId: 2,
            difficulty: "Medium",
            category: "Math / Simulation",
            url: "https://leetcode.com/problems/add-two-numbers/"
          },
          {
            id: "6-12",
            title: "Reverse Nodes in k-Group",
            leetcodeId: 25,
            difficulty: "Hard",
            category: "Recursion",
            url: "https://leetcode.com/problems/reverse-nodes-in-k-group/"
          },
          {
            id: "6-13",
            title: "Copy List with Random Pointer",
            leetcodeId: 138,
            difficulty: "Medium",
            category: "Hash Table / Weaving",
            url: "https://leetcode.com/problems/copy-list-with-random-pointer/"
          }
        ]
      }
    ]
  },
  {
    stepId: 7,
    stepNumber: "07",
    title: "Recursion & Backtracking",
    desc: "Power sets, combination sums, permutation generation, and classical N-Queens / Sudoku.",
    icon: "🌀",
    subtopics: [
      {
        subtopicName: "Combinations & Classic Backtracking",
        problems: [
          {
            id: "7-1",
            title: "Pow(x, n)",
            leetcodeId: 50,
            difficulty: "Medium",
            category: "Binary Exponentiation",
            url: "https://leetcode.com/problems/powx-n/"
          },
          {
            id: "7-2",
            title: "Subsets",
            leetcodeId: 78,
            difficulty: "Medium",
            category: "Backtracking",
            url: "https://leetcode.com/problems/subsets/"
          },
          {
            id: "7-3",
            title: "Subsets II (with duplicates)",
            leetcodeId: 90,
            difficulty: "Medium",
            category: "Backtracking",
            url: "https://leetcode.com/problems/subsets-ii/"
          },
          {
            id: "7-4",
            title: "Combination Sum",
            leetcodeId: 39,
            difficulty: "Medium",
            category: "Backtracking",
            url: "https://leetcode.com/problems/combination-sum/"
          },
          {
            id: "7-5",
            title: "Combination Sum II",
            leetcodeId: 40,
            difficulty: "Medium",
            category: "Backtracking",
            url: "https://leetcode.com/problems/combination-sum-ii/"
          },
          {
            id: "7-6",
            title: "Letter Combinations of a Phone Number",
            leetcodeId: 17,
            difficulty: "Medium",
            category: "Backtracking",
            url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/"
          },
          {
            id: "7-7",
            title: "Palindrome Partitioning",
            leetcodeId: 131,
            difficulty: "Medium",
            category: "Backtracking",
            url: "https://leetcode.com/problems/palindrome-partitioning/"
          },
          {
            id: "7-8",
            title: "Word Search",
            leetcodeId: 79,
            difficulty: "Medium",
            category: "Matrix DFS",
            url: "https://leetcode.com/problems/word-search/"
          },
          {
            id: "7-9",
            title: "N-Queens",
            leetcodeId: 51,
            difficulty: "Hard",
            category: "Classic Backtracking",
            url: "https://leetcode.com/problems/n-queens/"
          },
          {
            id: "7-10",
            title: "Sudoku Solver",
            leetcodeId: 37,
            difficulty: "Hard",
            category: "Matrix Backtracking",
            url: "https://leetcode.com/problems/sudoku-solver/"
          }
        ]
      }
    ]
  },
  {
    stepId: 8,
    stepNumber: "08",
    title: "Bit Manipulation",
    desc: "Bitwise XOR tricks, bit counts, single numbers, and integer division without multiplication.",
    icon: "0️⃣",
    subtopics: [
      {
        subtopicName: "Bitwise Operators & Tricks",
        problems: [
          {
            id: "8-1",
            title: "Number of 1 Bits",
            leetcodeId: 191,
            difficulty: "Easy",
            category: "Kernighan Algorithm",
            url: "https://leetcode.com/problems/number-of-1-bits/"
          },
          {
            id: "8-2",
            title: "Counting Bits",
            leetcodeId: 338,
            difficulty: "Easy",
            category: "DP / Bit",
            url: "https://leetcode.com/problems/counting-bits/"
          },
          {
            id: "8-3",
            title: "Single Number II (Appears 3 Times)",
            leetcodeId: 137,
            difficulty: "Medium",
            category: "Bit Counts",
            url: "https://leetcode.com/problems/single-number-ii/"
          },
          {
            id: "8-4",
            title: "Single Number III (Two Unique Numbers)",
            leetcodeId: 260,
            difficulty: "Medium",
            category: "XOR Bucketing",
            url: "https://leetcode.com/problems/single-number-iii/"
          },
          {
            id: "8-5",
            title: "Divide Two Integers",
            leetcodeId: 29,
            difficulty: "Medium",
            category: "Bit Shifts",
            url: "https://leetcode.com/problems/divide-two-integers/"
          }
        ]
      }
    ]
  },
  {
    stepId: 9,
    stepNumber: "09",
    title: "Stack and Queues",
    desc: "Monotonic stacks, next greater elements, histogram rectangles, LRU Cache, and Rainwater trapping.",
    icon: "🥞",
    subtopics: [
      {
        subtopicName: "Monotonic Stack & LRU Cache",
        problems: [
          {
            id: "9-1",
            title: "Valid Parentheses",
            leetcodeId: 20,
            difficulty: "Easy",
            category: "Stack",
            url: "https://leetcode.com/problems/valid-parentheses/"
          },
          {
            id: "9-2",
            title: "Min Stack",
            leetcodeId: 155,
            difficulty: "Medium",
            category: "Stack Design",
            url: "https://leetcode.com/problems/min-stack/"
          },
          {
            id: "9-3",
            title: "Next Greater Element I",
            leetcodeId: 496,
            difficulty: "Easy",
            category: "Monotonic Stack",
            url: "https://leetcode.com/problems/next-greater-element-i/"
          },
          {
            id: "9-4",
            title: "Next Greater Element II",
            leetcodeId: 503,
            difficulty: "Medium",
            category: "Circular Monotonic Stack",
            url: "https://leetcode.com/problems/next-greater-element-ii/"
          },
          {
            id: "9-5",
            title: "Trapping Rain Water",
            leetcodeId: 42,
            difficulty: "Hard",
            category: "Two Pointers / Stack",
            url: "https://leetcode.com/problems/trapping-rain-water/"
          },
          {
            id: "9-6",
            title: "Asteroid Collision",
            leetcodeId: 735,
            difficulty: "Medium",
            category: "Stack Simulation",
            url: "https://leetcode.com/problems/asteroid-collision/"
          },
          {
            id: "9-7",
            title: "Largest Rectangle in Histogram",
            leetcodeId: 84,
            difficulty: "Hard",
            category: "Monotonic Stack",
            url: "https://leetcode.com/problems/largest-rectangle-in-histogram/"
          },
          {
            id: "9-8",
            title: "Sliding Window Maximum",
            leetcodeId: 239,
            difficulty: "Hard",
            category: "Monotonic Deque",
            url: "https://leetcode.com/problems/sliding-window-maximum/"
          },
          {
            id: "9-9",
            title: "LRU Cache",
            leetcodeId: 146,
            difficulty: "Medium",
            category: "Doubly LL + Hash Map",
            url: "https://leetcode.com/problems/lru-cache/"
          }
        ]
      }
    ]
  },
  {
    stepId: 10,
    stepNumber: "10",
    title: "Sliding Window & Two Pointers",
    desc: "Dynamic window resizing, character frequency replacement, and substring constraints.",
    icon: "🪟",
    subtopics: [
      {
        subtopicName: "Essential Sliding Window",
        problems: [
          {
            id: "10-1",
            title: "Longest Substring Without Repeating Characters",
            leetcodeId: 3,
            difficulty: "Medium",
            category: "Sliding Window",
            url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
          },
          {
            id: "10-2",
            title: "Max Consecutive Ones III",
            leetcodeId: 1004,
            difficulty: "Medium",
            category: "Sliding Window",
            url: "https://leetcode.com/problems/max-consecutive-ones-iii/"
          },
          {
            id: "10-3",
            title: "Fruit Into Baskets",
            leetcodeId: 904,
            difficulty: "Medium",
            category: "Sliding Window",
            url: "https://leetcode.com/problems/fruit-into-baskets/"
          },
          {
            id: "10-4",
            title: "Longest Repeating Character Replacement",
            leetcodeId: 424,
            difficulty: "Medium",
            category: "Sliding Window",
            url: "https://leetcode.com/problems/longest-repeating-character-replacement/"
          },
          {
            id: "10-5",
            title: "Binary Subarrays With Sum",
            leetcodeId: 930,
            difficulty: "Medium",
            category: "Prefix Sum / Window",
            url: "https://leetcode.com/problems/binary-subarrays-with-sum/"
          },
          {
            id: "10-6",
            title: "Subarrays with K Different Integers",
            leetcodeId: 992,
            difficulty: "Hard",
            category: "Exact K Window",
            url: "https://leetcode.com/problems/subarrays-with-k-different-integers/"
          },
          {
            id: "10-7",
            title: "Minimum Window Substring",
            leetcodeId: 76,
            difficulty: "Hard",
            category: "Sliding Window",
            url: "https://leetcode.com/problems/minimum-window-substring/"
          }
        ]
      }
    ]
  },
  {
    stepId: 11,
    stepNumber: "11",
    title: "Heaps & Priority Queues",
    desc: "Min-heaps, max-heaps, Kth largest elements, stream medians, and Task Scheduler.",
    icon: "🏔️",
    subtopics: [
      {
        subtopicName: "Priority Queue Patterns",
        problems: [
          {
            id: "11-1",
            title: "Kth Largest Element in an Array",
            leetcodeId: 215,
            difficulty: "Medium",
            category: "Min Heap",
            url: "https://leetcode.com/problems/kth-largest-element-in-an-array/"
          },
          {
            id: "11-2",
            title: "Merge k Sorted Lists",
            leetcodeId: 23,
            difficulty: "Hard",
            category: "Priority Queue",
            url: "https://leetcode.com/problems/merge-k-sorted-lists/"
          },
          {
            id: "11-3",
            title: "Find Median from Data Stream",
            leetcodeId: 295,
            difficulty: "Hard",
            category: "Two Heaps",
            url: "https://leetcode.com/problems/find-median-from-data-stream/"
          },
          {
            id: "11-4",
            title: "Task Scheduler",
            leetcodeId: 621,
            difficulty: "Medium",
            category: "Greedy / Max Heap",
            url: "https://leetcode.com/problems/task-scheduler/"
          }
        ]
      }
    ]
  },
  {
    stepId: 12,
    stepNumber: "12",
    title: "Greedy Algorithms",
    desc: "Local optimality choices: Jump Game, interval insertions, and Candy distribution.",
    icon: "🪙",
    subtopics: [
      {
        subtopicName: "Greedy Interval & State Problems",
        problems: [
          {
            id: "12-1",
            title: "Assign Cookies",
            leetcodeId: 455,
            difficulty: "Easy",
            category: "Sorting / Greedy",
            url: "https://leetcode.com/problems/assign-cookies/"
          },
          {
            id: "12-2",
            title: "Lemonade Change",
            leetcodeId: 860,
            difficulty: "Easy",
            category: "Greedy Simulation",
            url: "https://leetcode.com/problems/lemonade-change/"
          },
          {
            id: "12-3",
            title: "Jump Game",
            leetcodeId: 55,
            difficulty: "Medium",
            category: "Greedy Reach",
            url: "https://leetcode.com/problems/jump-game/"
          },
          {
            id: "12-4",
            title: "Jump Game II",
            leetcodeId: 45,
            difficulty: "Medium",
            category: "Greedy Window",
            url: "https://leetcode.com/problems/jump-game-ii/"
          },
          {
            id: "12-5",
            title: "Non-overlapping Intervals",
            leetcodeId: 435,
            difficulty: "Medium",
            category: "Interval Greedy",
            url: "https://leetcode.com/problems/non-overlapping-intervals/"
          },
          {
            id: "12-6",
            title: "Insert Interval",
            leetcodeId: 57,
            difficulty: "Medium",
            category: "Intervals",
            url: "https://leetcode.com/problems/insert-interval/"
          },
          {
            id: "12-7",
            title: "Candy",
            leetcodeId: 135,
            difficulty: "Hard",
            category: "Two-pass Greedy",
            url: "https://leetcode.com/problems/candy/"
          }
        ]
      }
    ]
  },
  {
    stepId: 13,
    stepNumber: "13",
    title: "Binary Trees",
    desc: "DFS/BFS Traversals, diameter, max path sum, zigzag order, and Lowest Common Ancestor (LCA).",
    icon: "🌳",
    subtopics: [
      {
        subtopicName: "Traversals, Views & Ancestry",
        problems: [
          {
            id: "13-1",
            title: "Binary Tree Inorder Traversal",
            leetcodeId: 94,
            difficulty: "Easy",
            category: "DFS Traversal",
            url: "https://leetcode.com/problems/binary-tree-inorder-traversal/"
          },
          {
            id: "13-2",
            title: "Binary Tree Level Order Traversal",
            leetcodeId: 102,
            difficulty: "Medium",
            category: "BFS Queue",
            url: "https://leetcode.com/problems/binary-tree-level-order-traversal/"
          },
          {
            id: "13-3",
            title: "Maximum Depth of Binary Tree",
            leetcodeId: 104,
            difficulty: "Easy",
            category: "DFS Depth",
            url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
          },
          {
            id: "13-4",
            title: "Diameter of Binary Tree",
            leetcodeId: 543,
            difficulty: "Easy",
            category: "DFS Postorder",
            url: "https://leetcode.com/problems/diameter-of-binary-tree/"
          },
          {
            id: "13-5",
            title: "Binary Tree Maximum Path Sum",
            leetcodeId: 124,
            difficulty: "Hard",
            category: "DFS Postorder",
            url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/"
          },
          {
            id: "13-6",
            title: "Same Tree",
            leetcodeId: 100,
            difficulty: "Easy",
            category: "DFS Recursion",
            url: "https://leetcode.com/problems/same-tree/"
          },
          {
            id: "13-7",
            title: "Binary Tree Zigzag Level Order Traversal",
            leetcodeId: 103,
            difficulty: "Medium",
            category: "BFS Deque",
            url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/"
          },
          {
            id: "13-8",
            title: "Lowest Common Ancestor of a Binary Tree",
            leetcodeId: 236,
            difficulty: "Medium",
            category: "LCA DFS",
            url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"
          },
          {
            id: "13-9",
            title: "Serialize and Deserialize Binary Tree",
            leetcodeId: 297,
            difficulty: "Hard",
            category: "Design / BFS",
            url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"
          }
        ]
      }
    ]
  },
  {
    stepId: 14,
    stepNumber: "14",
    title: "Binary Search Trees (BST)",
    desc: "Binary search property, BST deletion, Kth smallest element, and BST validation.",
    icon: "🌲",
    subtopics: [
      {
        subtopicName: "BST Verification & Modification",
        problems: [
          {
            id: "14-1",
            title: "Search in a Binary Search Tree",
            leetcodeId: 700,
            difficulty: "Easy",
            category: "BST Search",
            url: "https://leetcode.com/problems/search-in-a-binary-search-tree/"
          },
          {
            id: "14-2",
            title: "Delete Node in a BST",
            leetcodeId: 450,
            difficulty: "Medium",
            category: "BST Mutation",
            url: "https://leetcode.com/problems/delete-node-in-a-bst/"
          },
          {
            id: "14-3",
            title: "Kth Smallest Element in a BST",
            leetcodeId: 230,
            difficulty: "Medium",
            category: "Inorder BST",
            url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/"
          },
          {
            id: "14-4",
            title: "Validate Binary Search Tree",
            leetcodeId: 98,
            difficulty: "Medium",
            category: "Range Bounds",
            url: "https://leetcode.com/problems/validate-binary-search-tree/"
          },
          {
            id: "14-5",
            title: "Lowest Common Ancestor of a BST",
            leetcodeId: 235,
            difficulty: "Medium",
            category: "BST Property",
            url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/"
          },
          {
            id: "14-6",
            title: "Construct BST from Preorder Traversal",
            leetcodeId: 1008,
            difficulty: "Medium",
            category: "BST Construction",
            url: "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/"
          }
        ]
      }
    ]
  },
  {
    stepId: 15,
    stepNumber: "15",
    title: "Graphs [Concepts & Algorithms]",
    desc: "BFS/DFS, Topological Sort, Dijkstra's Shortest Path, Bellman-Ford, and Disjoint Set Union (DSU).",
    icon: "🕸️",
    subtopics: [
      {
        subtopicName: "Traversals, TopoSort & Shortest Paths",
        problems: [
          {
            id: "15-1",
            title: "Number of Provinces",
            leetcodeId: 547,
            difficulty: "Medium",
            category: "Connected Components",
            url: "https://leetcode.com/problems/number-of-provinces/"
          },
          {
            id: "15-2",
            title: "Rotting Oranges",
            leetcodeId: 994,
            difficulty: "Medium",
            category: "Multi-Source BFS",
            url: "https://leetcode.com/problems/rotting-oranges/"
          },
          {
            id: "15-3",
            title: "Flood Fill",
            leetcodeId: 733,
            difficulty: "Easy",
            category: "Matrix DFS",
            url: "https://leetcode.com/problems/flood-fill/"
          },
          {
            id: "15-4",
            title: "01 Matrix",
            leetcodeId: 542,
            difficulty: "Medium",
            category: "Multi-Source BFS",
            url: "https://leetcode.com/problems/01-matrix/"
          },
          {
            id: "15-5",
            title: "Surrounded Regions",
            leetcodeId: 130,
            difficulty: "Medium",
            category: "Boundary DFS",
            url: "https://leetcode.com/problems/surrounded-regions/"
          },
          {
            id: "15-6",
            title: "Word Ladder",
            leetcodeId: 127,
            difficulty: "Hard",
            category: "Shortest Path BFS",
            url: "https://leetcode.com/problems/word-ladder/"
          },
          {
            id: "15-7",
            title: "Course Schedule (Cycle Detection)",
            leetcodeId: 207,
            difficulty: "Medium",
            category: "Kahn's TopoSort",
            url: "https://leetcode.com/problems/course-schedule/"
          },
          {
            id: "15-8",
            title: "Course Schedule II",
            leetcodeId: 210,
            difficulty: "Medium",
            category: "Topological Sort",
            url: "https://leetcode.com/problems/course-schedule-ii/"
          },
          {
            id: "15-9",
            title: "Network Delay Time",
            leetcodeId: 743,
            difficulty: "Medium",
            category: "Dijkstra's Algorithm",
            url: "https://leetcode.com/problems/network-delay-time/"
          },
          {
            id: "15-10",
            title: "Path With Minimum Effort",
            leetcodeId: 1631,
            difficulty: "Medium",
            category: "Dijkstra / Binary Search",
            url: "https://leetcode.com/problems/path-with-minimum-effort/"
          },
          {
            id: "15-11",
            title: "Cheapest Flights Within K Stops",
            leetcodeId: 787,
            difficulty: "Medium",
            category: "Bellman-Ford / BFS",
            url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/"
          },
          {
            id: "15-12",
            title: "Accounts Merge",
            leetcodeId: 721,
            difficulty: "Medium",
            category: "Disjoint Set Union",
            url: "https://leetcode.com/problems/accounts-merge/"
          }
        ]
      }
    ]
  },
  {
    stepId: 16,
    stepNumber: "16",
    title: "Dynamic Programming",
    desc: "1D DP, 2D Grid DP, Subsequence DP, Knapsack patterns, and Longest Increasing Subsequence.",
    icon: "💎",
    subtopics: [
      {
        subtopicName: "1D, 2D Grids & Subsequences",
        problems: [
          {
            id: "16-1",
            title: "Climbing Stairs",
            leetcodeId: 70,
            difficulty: "Easy",
            category: "1D Fibonacci DP",
            url: "https://leetcode.com/problems/climbing-stairs/"
          },
          {
            id: "16-2",
            title: "House Robber",
            leetcodeId: 198,
            difficulty: "Medium",
            category: "1D State DP",
            url: "https://leetcode.com/problems/house-robber/"
          },
          {
            id: "16-3",
            title: "House Robber II",
            leetcodeId: 213,
            difficulty: "Medium",
            category: "Circular DP",
            url: "https://leetcode.com/problems/house-robber-ii/"
          },
          {
            id: "16-4",
            title: "Unique Paths",
            leetcodeId: 62,
            difficulty: "Medium",
            category: "2D Grid DP",
            url: "https://leetcode.com/problems/unique-paths/"
          },
          {
            id: "16-5",
            title: "Minimum Path Sum",
            leetcodeId: 64,
            difficulty: "Medium",
            category: "2D Grid DP",
            url: "https://leetcode.com/problems/minimum-path-sum/"
          },
          {
            id: "16-6",
            title: "Partition Equal Subset Sum",
            leetcodeId: 416,
            difficulty: "Medium",
            category: "0/1 Knapsack",
            url: "https://leetcode.com/problems/partition-equal-subset-sum/"
          },
          {
            id: "16-7",
            title: "Coin Change",
            leetcodeId: 322,
            difficulty: "Medium",
            category: "Unbounded Knapsack",
            url: "https://leetcode.com/problems/coin-change/"
          },
          {
            id: "16-8",
            title: "Target Sum",
            leetcodeId: 494,
            difficulty: "Medium",
            category: "Subset Sum DP",
            url: "https://leetcode.com/problems/target-sum/"
          },
          {
            id: "16-9",
            title: "Longest Common Subsequence",
            leetcodeId: 1143,
            difficulty: "Medium",
            category: "String DP",
            url: "https://leetcode.com/problems/longest-common-subsequence/"
          },
          {
            id: "16-10",
            title: "Edit Distance",
            leetcodeId: 72,
            difficulty: "Medium",
            category: "String Transformation",
            url: "https://leetcode.com/problems/edit-distance/"
          },
          {
            id: "16-11",
            title: "Longest Increasing Subsequence",
            leetcodeId: 300,
            difficulty: "Medium",
            category: "DP / Binary Search",
            url: "https://leetcode.com/problems/longest-increasing-subsequence/"
          }
        ]
      }
    ]
  },
  {
    stepId: 17,
    stepNumber: "17",
    title: "Tries (Prefix Tree)",
    desc: "Trie data structure implementation, prefix search, and maximum XOR pairings.",
    icon: "🎋",
    subtopics: [
      {
        subtopicName: "Trie Implementation & Applications",
        problems: [
          {
            id: "17-1",
            title: "Implement Trie (Prefix Tree)",
            leetcodeId: 208,
            difficulty: "Medium",
            category: "Trie Design",
            url: "https://leetcode.com/problems/implement-trie-prefix-tree/"
          },
          {
            id: "17-2",
            title: "Design Add and Search Words Data Structure",
            leetcodeId: 211,
            difficulty: "Medium",
            category: "Trie DFS",
            url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/"
          },
          {
            id: "17-3",
            title: "Maximum XOR of Two Numbers in an Array",
            leetcodeId: 421,
            difficulty: "Medium",
            category: "Bitwise Trie",
            url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/"
          }
        ]
      }
    ]
  }
];
