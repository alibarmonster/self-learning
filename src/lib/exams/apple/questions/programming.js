/**
 * Section 2 — Programming Fundamentals
 * The real test uses language-agnostic pseudocode plus some Swift-flavoured
 * snippets. It stays at the level of variables, data types, conditionals,
 * loops, arrays and simple complexity — with a few Git / terminal / backend
 * basics, which the official knowledge base also lists.
 */

export const programming = [
  {
    id: 'prg-01',
    topic: 'Variable tracing',
    difficulty: 'medium',
    prompt: 'What does this pseudocode output?',
    lang: 'pseudocode',
    code: `x ← 5
y ← 10
x ← x + y
y ← x - y
x ← x - y
OUTPUT x, y`,
    options: ['5 10', '10 5', '15 5', '5 5'],
    answer: 1,
    explanation:
      'This is the classic swap without a temporary variable. x becomes 15, then y becomes 15 − 10 = 5, then x becomes 15 − 5 = 10. The values have been exchanged.'
  },
  {
    id: 'prg-02',
    topic: 'Loops',
    difficulty: 'easy',
    prompt: 'What is the final value of sum?',
    lang: 'pseudocode',
    code: `sum ← 0
FOR i FROM 1 TO 5
    IF i MOD 2 = 0 THEN
        sum ← sum + i
    END IF
END FOR
OUTPUT sum`,
    options: ['6', '9', '15', '10'],
    answer: 0,
    explanation: 'Only the even values 2 and 4 are added, giving 6.'
  },
  {
    id: 'prg-03',
    topic: 'Loops',
    difficulty: 'easy',
    prompt: 'How many values does this loop print?',
    lang: 'pseudocode',
    code: `i ← 0
WHILE i < 3
    OUTPUT i
    i ← i + 1
END WHILE`,
    options: ['2', '3', '4', 'It never stops'],
    answer: 1,
    explanation: 'The loop prints 0, 1 and 2 and stops when i reaches 3 — three values in total.'
  },
  {
    id: 'prg-04',
    topic: 'Loops',
    difficulty: 'medium',
    prompt: 'What is the final value of count?',
    lang: 'pseudocode',
    code: `count ← 0
FOR i FROM 1 TO 3
    FOR j FROM 1 TO 3
        IF i = j THEN
            CONTINUE
        END IF
        count ← count + 1
    END FOR
END FOR
OUTPUT count`,
    options: ['3', '6', '9', '12'],
    answer: 1,
    explanation:
      'The nested loops run 3 × 3 = 9 times, but the three iterations where i equals j are skipped. 9 − 3 = 6.'
  },
  {
    id: 'prg-05',
    topic: 'Loops',
    difficulty: 'hard',
    prompt: 'How many times does the loop body run?',
    lang: 'pseudocode',
    code: `n ← 6
steps ← 0
WHILE n > 1
    IF n MOD 2 = 0 THEN
        n ← n / 2
    ELSE
        n ← 3 * n + 1
    END IF
    steps ← steps + 1
END WHILE
OUTPUT steps`,
    options: ['5', '6', '7', '8'],
    answer: 3,
    explanation:
      'The sequence is 6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1, which is 8 steps.'
  },
  {
    id: 'prg-06',
    topic: 'Off-by-one errors',
    difficulty: 'medium',
    prompt:
      'An array named data holds 5 elements at indices 0 to 4. What happens when this runs?',
    lang: 'pseudocode',
    code: `FOR i FROM 0 TO 5
    OUTPUT data[i]
END FOR`,
    options: [
      'It prints all 5 elements correctly.',
      'It prints only the first 4 elements.',
      'It tries to read index 5 and fails — an off-by-one error.',
      'It prints the array in reverse.'
    ],
    answer: 2,
    explanation:
      'The loop runs from 0 through 5 inclusive, which is 6 iterations. Index 5 is out of bounds for a 5-element array. The correct upper bound is 4 (or "length − 1").'
  },
  {
    id: 'prg-07',
    topic: 'Arrays',
    difficulty: 'easy',
    prompt: 'What does this pseudocode output?',
    lang: 'pseudocode',
    code: `arr ← [3, 1, 4, 1, 5]
max ← arr[0]
FOR i FROM 1 TO 4
    IF arr[i] > max THEN
        max ← arr[i]
    END IF
END FOR
OUTPUT max`,
    options: ['1', '3', '4', '5'],
    answer: 3,
    explanation: 'The loop keeps the largest value seen so far. The largest element is 5.'
  },
  {
    id: 'prg-08',
    topic: 'Arrays',
    difficulty: 'medium',
    prompt: 'What is printed?',
    lang: 'swift',
    code: `var numbers = [1, 2, 3, 4, 5]
let result = numbers.filter { $0 % 2 == 1 }
                    .map { $0 * $0 }
print(result)`,
    options: ['[1, 2, 3, 4, 5]', '[1, 9, 25]', '[4, 16]', '[1, 4, 9, 16, 25]'],
    answer: 1,
    explanation:
      'filter keeps the odd numbers 1, 3 and 5; map then squares each of them, producing [1, 9, 25].'
  },
  {
    id: 'prg-09',
    topic: 'Arrays',
    difficulty: 'medium',
    prompt: 'What is the value of total?',
    lang: 'swift',
    code: `let scores = [10, 20, 30]
var total = 0
for score in scores {
    total += score
}
total = total / scores.count
print(total)`,
    options: ['20', '30', '60', '10'],
    answer: 0,
    explanation: 'The sum is 60 and there are 3 elements, so the average is 20.'
  },
  {
    id: 'prg-10',
    topic: 'Recursion',
    difficulty: 'medium',
    prompt: 'What does f(4) return?',
    lang: 'pseudocode',
    code: `FUNCTION f(n)
    IF n <= 1 THEN
        RETURN 1
    END IF
    RETURN n * f(n - 1)
END FUNCTION`,
    options: ['4', '10', '24', '120'],
    answer: 2,
    explanation: 'This is factorial: 4 × 3 × 2 × 1 = 24.'
  },
  {
    id: 'prg-11',
    topic: 'Recursion',
    difficulty: 'hard',
    prompt: 'What does fib(6) return?',
    lang: 'pseudocode',
    code: `FUNCTION fib(n)
    IF n = 0 THEN RETURN 0
    IF n = 1 THEN RETURN 1
    RETURN fib(n - 1) + fib(n - 2)
END FUNCTION`,
    options: ['5', '8', '13', '21'],
    answer: 1,
    explanation:
      'The sequence from n = 0 is 0, 1, 1, 2, 3, 5, 8. The value at index 6 is 8.'
  },
  {
    id: 'prg-12',
    topic: 'Recursion',
    difficulty: 'medium',
    prompt: 'What is the most important thing every recursive function must have?',
    options: [
      'A loop inside it',
      'A base case that stops the recursion',
      'At least two parameters',
      'A global variable'
    ],
    answer: 1,
    explanation:
      'Without a base case the function calls itself forever and the program crashes with a stack overflow.'
  },
  {
    id: 'prg-13',
    topic: 'Operators',
    difficulty: 'easy',
    prompt: 'What is the result of 17 MOD 5?',
    options: ['2', '3', '3.4', '5'],
    answer: 0,
    explanation: 'MOD (modulo) gives the remainder. 17 = 3 × 5 + 2, so the remainder is 2.'
  },
  {
    id: 'prg-14',
    topic: 'Data types',
    difficulty: 'medium',
    prompt: 'What does this print?',
    lang: 'swift',
    code: `let a = 7
let b = 2
print(a / b)
print(Double(a) / Double(b))`,
    options: ['3.5 then 3.5', '3 then 3.5', '3 then 3', '4 then 3.5'],
    answer: 1,
    explanation:
      'Dividing two integers performs integer division and discards the fraction, giving 3. Converting to Double first gives the true value 3.5.'
  },
  {
    id: 'prg-15',
    topic: 'Data types',
    difficulty: 'medium',
    prompt: 'Which of these is a valid Boolean expression that evaluates to true?',
    options: [
      '(true && false) || !false',
      '!(true || false)',
      'true && !true',
      'false || (false && true)'
    ],
    answer: 0,
    explanation:
      '(true && false) is false, but !false is true, and false || true is true. Every other option evaluates to false.'
  },
  {
    id: 'prg-16',
    topic: 'Conditionals',
    difficulty: 'medium',
    prompt: 'Why is the order of the two conditions important here?',
    lang: 'pseudocode',
    code: `IF x != 0 AND (10 / x) > 2 THEN
    OUTPUT "ok"
END IF`,
    options: [
      'It is not important — both orders behave the same.',
      'Short-circuit evaluation stops at x != 0, preventing a division by zero.',
      'AND requires the numeric test to come first.',
      'It makes the condition run faster on large numbers.'
    ],
    answer: 1,
    explanation:
      'With AND, if the left side is false the right side is never evaluated. Putting the x != 0 guard first protects the division.'
  },
  {
    id: 'prg-17',
    topic: 'Conditionals',
    difficulty: 'medium',
    prompt: 'What is printed when score is 85?',
    lang: 'pseudocode',
    code: `IF score > 90 THEN
    OUTPUT "A"
ELSE IF score > 80 THEN
    OUTPUT "B"
ELSE IF score > 70 THEN
    OUTPUT "C"
ELSE
    OUTPUT "D"
END IF`,
    options: ['A', 'B', 'C', 'B and C'],
    answer: 1,
    explanation:
      'The chain stops at the first matching branch. 85 is not greater than 90 but is greater than 80, so "B" prints and the rest is skipped.'
  },
  {
    id: 'prg-18',
    topic: 'Functions & scope',
    difficulty: 'medium',
    prompt: 'What does this output?',
    lang: 'pseudocode',
    code: `total ← 10

FUNCTION addFive(total)
    total ← total + 5
    RETURN total
END FUNCTION

addFive(total)
OUTPUT total`,
    options: ['10', '15', '5', 'Error'],
    answer: 0,
    explanation:
      'The parameter is a local copy, so changing it inside the function does not affect the outer variable. The returned value is also discarded.'
  },
  {
    id: 'prg-19',
    topic: 'Strings',
    difficulty: 'easy',
    prompt: 'What does this print?',
    lang: 'swift',
    code: `let name = "Swift"
print(name.count)
print(name.uppercased())`,
    options: ['5 then SWIFT', '6 then SWIFT', '5 then Swift', '4 then swift'],
    answer: 0,
    explanation: '"Swift" has 5 characters, and uppercased() returns "SWIFT".'
  },
  {
    id: 'prg-20',
    topic: 'Strings',
    difficulty: 'medium',
    prompt: 'What does this pseudocode produce for input "academy"?',
    lang: 'pseudocode',
    code: `FUNCTION mystery(s)
    result ← ""
    FOR i FROM length(s) - 1 DOWNTO 0
        result ← result + s[i]
    END FOR
    RETURN result
END FUNCTION`,
    options: ['"academy"', '"ymedaca"', '"ACADEMY"', '"a"'],
    answer: 1,
    explanation:
      'It walks the string from the last index to the first, appending each character — it reverses the string.'
  },
  {
    id: 'prg-21',
    topic: 'Optionals',
    difficulty: 'medium',
    prompt: 'What does this print?',
    lang: 'swift',
    code: `var username: String? = nil
print(username ?? "Guest")`,
    options: ['nil', 'Optional("Guest")', 'Guest', 'It crashes'],
    answer: 2,
    explanation:
      'The nil-coalescing operator ?? supplies a default when the optional is nil, so "Guest" is printed.'
  },
  {
    id: 'prg-22',
    topic: 'Constants',
    difficulty: 'easy',
    prompt: 'Which line causes a compile error?',
    lang: 'swift',
    code: `var count = 0      // line 1
let limit = 10     // line 2
count = count + 1  // line 3
limit = 20         // line 4`,
    options: ['Line 1', 'Line 2', 'Line 3', 'Line 4'],
    answer: 3,
    explanation:
      'let declares a constant. Assigning a new value to limit on line 4 is not allowed; use var if the value must change.'
  },
  {
    id: 'prg-23',
    topic: 'Debugging',
    difficulty: 'medium',
    prompt: 'This function should return the average of an array. What is the bug?',
    lang: 'pseudocode',
    code: `FUNCTION average(arr)
    sum ← 0
    FOR i FROM 0 TO length(arr) - 1
        sum ← arr[i]
    END FOR
    RETURN sum / length(arr)
END FUNCTION`,
    options: [
      'The loop bounds are wrong.',
      'sum is assigned instead of accumulated — it should be sum ← sum + arr[i].',
      'sum should start at 1.',
      'The division should happen inside the loop.'
    ],
    answer: 1,
    explanation:
      'Each iteration overwrites sum instead of adding to it, so only the last element counts. The fix is sum ← sum + arr[i].'
  },
  {
    id: 'prg-24',
    topic: 'Complexity',
    difficulty: 'medium',
    prompt: 'What is the time complexity of binary search on a sorted array of n elements?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    answer: 1,
    explanation:
      'Binary search halves the search space with every comparison, so it needs about log₂(n) steps.'
  },
  {
    id: 'prg-25',
    topic: 'Complexity',
    difficulty: 'medium',
    prompt: 'What is the time complexity of this code?',
    lang: 'pseudocode',
    code: `FOR i FROM 1 TO n
    FOR j FROM 1 TO n
        OUTPUT i * j
    END FOR
END FOR`,
    options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
    answer: 3,
    explanation: 'Two nested loops each running n times give n × n = n² operations.'
  },
  {
    id: 'prg-26',
    topic: 'Complexity',
    difficulty: 'easy',
    prompt: 'For a very large n, which of these runs fastest?',
    options: ['O(n!)', 'O(2ⁿ)', 'O(n²)', 'O(n log n)'],
    answer: 3,
    explanation:
      'Ordered from fastest to slowest growth: O(n log n) < O(n²) < O(2ⁿ) < O(n!).'
  },
  {
    id: 'prg-27',
    topic: 'Complexity',
    difficulty: 'easy',
    prompt: 'What is the time complexity of reading an array element by its index, such as arr[7]?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    answer: 0,
    explanation:
      'Arrays store elements contiguously, so the address of any index is computed directly — constant time.'
  },
  {
    id: 'prg-28',
    topic: 'Data structures',
    difficulty: 'easy',
    prompt:
      'You push 1, then 2, then 3 onto a stack, then pop twice. Which value remains on the stack?',
    options: ['1', '2', '3', 'The stack is empty'],
    answer: 0,
    explanation:
      'A stack is last-in-first-out. Popping removes 3 and then 2, leaving 1 at the bottom.'
  },
  {
    id: 'prg-29',
    topic: 'Data structures',
    difficulty: 'easy',
    prompt:
      'You enqueue A, then B, then C into a queue, then dequeue once. Which item is now at the front?',
    options: ['A', 'B', 'C', 'The queue is empty'],
    answer: 1,
    explanation: 'A queue is first-in-first-out. A leaves first, so B is now at the front.'
  },
  {
    id: 'prg-30',
    topic: 'Data structures',
    difficulty: 'medium',
    prompt:
      'You need to look up a user by their unique ID thousands of times per second. Which structure gives the best average lookup time?',
    options: [
      'An unsorted array searched linearly',
      'A hash map / dictionary keyed by ID',
      'A linked list',
      'A stack'
    ],
    answer: 1,
    explanation:
      'A hash map gives average O(1) lookup by key, while linear search over an array or list is O(n).'
  },
  {
    id: 'prg-31',
    topic: 'Algorithms',
    difficulty: 'medium',
    prompt: 'What is the worst-case time complexity of linear search over n elements?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    answer: 2,
    explanation:
      'In the worst case the target is the last element, or absent, so all n elements are checked.'
  },
  {
    id: 'prg-32',
    topic: 'Algorithms',
    difficulty: 'medium',
    prompt: 'Which condition must hold before binary search can be used?',
    options: [
      'The array must be sorted.',
      'The array must contain only integers.',
      'The array must have an even length.',
      'The array must contain no duplicates.'
    ],
    answer: 0,
    explanation:
      'Binary search relies on discarding half the range each step, which is only valid if the data is ordered.'
  },
  {
    id: 'prg-33',
    topic: 'Git',
    difficulty: 'easy',
    prompt: 'Which command creates a new branch and switches to it in one step?',
    options: [
      'git branch feature',
      'git checkout -b feature',
      'git switch feature',
      'git merge feature'
    ],
    answer: 1,
    explanation:
      'git checkout -b (or the newer git switch -c) creates the branch and moves onto it. Plain git branch only creates it.'
  },
  {
    id: 'prg-34',
    topic: 'Git',
    difficulty: 'easy',
    prompt: 'What does git fetch do that git pull does not?',
    options: [
      'It downloads remote changes without merging them into your branch.',
      'It uploads your commits to the remote.',
      'It deletes your local branch.',
      'It creates a new repository.'
    ],
    answer: 0,
    explanation:
      'git fetch only downloads remote objects and refs. git pull is effectively a fetch followed by a merge (or rebase).'
  },
  {
    id: 'prg-35',
    topic: 'Git',
    difficulty: 'easy',
    prompt: 'You edited a file and want it included in your next commit. Which command do you run first?',
    options: ['git commit', 'git push', 'git add file.swift', 'git status'],
    answer: 2,
    explanation:
      'git add moves changes into the staging area. git commit then records everything that is staged.'
  },
  {
    id: 'prg-36',
    topic: 'Git',
    difficulty: 'medium',
    prompt: 'What is a merge conflict?',
    options: [
      'A network error while pushing to the remote.',
      'Two branches changed the same lines, so Git cannot decide which version to keep.',
      'A commit message that is too long.',
      'A branch that has no commits.'
    ],
    answer: 1,
    explanation:
      'Git merges automatically when changes touch different regions. When two branches edit the same lines it stops and asks a human to resolve the conflict.'
  },
  {
    id: 'prg-37',
    topic: 'Terminal',
    difficulty: 'easy',
    prompt: 'Which command lists files in the current directory, including hidden ones?',
    options: ['ls -a', 'ls -l', 'cd -a', 'pwd -a'],
    answer: 0,
    explanation: 'The -a flag means "all", including dotfiles such as .gitignore. -l only changes the format to a long listing.'
  },
  {
    id: 'prg-38',
    topic: 'Terminal',
    difficulty: 'easy',
    prompt: 'What does the pwd command do?',
    options: [
      'Changes the password.',
      'Prints the path of the current working directory.',
      'Removes a directory.',
      'Lists running processes.'
    ],
    answer: 1,
    explanation: 'pwd stands for "print working directory".'
  },
  {
    id: 'prg-39',
    topic: 'Terminal',
    difficulty: 'easy',
    prompt: 'Which command renames the file old.txt to new.txt?',
    options: ['cp old.txt new.txt', 'mv old.txt new.txt', 'rm old.txt new.txt', 'mkdir new.txt'],
    answer: 1,
    explanation:
      'mv moves a file, and moving it to a new name in the same directory is how you rename. cp would leave the original in place.'
  },
  {
    id: 'prg-40',
    topic: 'Backend basics',
    difficulty: 'easy',
    prompt: 'An HTTP response returns status code 404. What does it mean?',
    options: [
      'The request succeeded.',
      'The server had an internal error.',
      'The requested resource was not found.',
      'The client is not authenticated.'
    ],
    answer: 2,
    explanation:
      '404 Not Found is a client error. 200 means success, 401 means unauthenticated and 500 means an internal server error.'
  },
  {
    id: 'prg-41',
    topic: 'Backend basics',
    difficulty: 'easy',
    prompt: 'In a REST API, which HTTP method is normally used to create a new resource?',
    options: ['GET', 'POST', 'DELETE', 'HEAD'],
    answer: 1,
    explanation:
      'POST submits new data to create a resource. GET reads, PUT/PATCH update and DELETE removes.'
  },
  {
    id: 'prg-42',
    topic: 'Backend basics',
    difficulty: 'medium',
    prompt: 'Which of these is valid JSON?',
    options: [
      "{ name: 'Ana', age: 21 }",
      '{ "name": "Ana", "age": 21 }',
      '{ "name" = "Ana", "age" = 21 }',
      "{ 'name': 'Ana', 'age': 21 }"
    ],
    answer: 1,
    explanation:
      'JSON requires double quotes around keys and string values, and a colon between key and value. Single quotes and unquoted keys are not valid JSON.'
  },
  {
    id: 'prg-43',
    topic: 'Backend basics',
    difficulty: 'easy',
    prompt: 'What does API stand for?',
    options: [
      'Applied Programming Interface',
      'Application Programming Interface',
      'Automatic Process Integration',
      'Application Process Instance'
    ],
    answer: 1,
    explanation:
      'An Application Programming Interface is the contract that lets one piece of software talk to another.'
  },
  {
    id: 'prg-44',
    topic: 'Variable tracing',
    difficulty: 'hard',
    prompt: 'What is the final value of result?',
    lang: 'pseudocode',
    code: `result ← 1
n ← 5
WHILE n > 0
    IF n MOD 2 = 1 THEN
        result ← result * n
    END IF
    n ← n - 1
END WHILE
OUTPUT result`,
    options: ['8', '15', '120', '5'],
    answer: 1,
    explanation:
      'Only odd values multiply into result: 5, 3 and 1. 1 × 5 × 3 × 1 = 15.'
  },
  {
    id: 'prg-45',
    topic: 'Loops',
    difficulty: 'medium',
    prompt: 'What is printed?',
    lang: 'swift',
    code: `var i = 1
var output = ""
while i <= 10 {
    if i % 3 == 0 {
        output += String(i) + " "
    }
    i += 1
}
print(output)`,
    options: ['3 6 9', '1 2 3', '3 6 9 12', '0 3 6 9'],
    answer: 0,
    explanation: 'The multiples of 3 that are 10 or less are 3, 6 and 9.'
  },
  {
    id: 'prg-46',
    topic: 'Data types',
    difficulty: 'easy',
    prompt:
      'In this pseudocode, + joins two pieces of text but adds two numbers. What are the two lines of output?',
    lang: 'pseudocode',
    code: `a ← "5"
b ← "3"
c ← 5
d ← 3
OUTPUT a + b
OUTPUT c + d`,
    options: ['53 then 8', '8 then 8', '53 then 53', '8 then 53'],
    answer: 0,
    explanation:
      'The quotation marks matter. a and b hold the characters "5" and "3", so + glues them into "53". c and d hold the numbers 5 and 3, so + adds them to 8. Telling a number apart from a numeral stored as text is one of the things the programming section checks.'
  },
  {
    id: 'prg-47',
    topic: 'Data types',
    difficulty: 'medium',
    prompt:
      'Swift refuses to compile a + b here, because the two types do not match. What does the line that is actually written print?',
    lang: 'swift',
    code: `let a = "7"
let b = 3
print(Int(a)! + b)`,
    options: ['10', '73', '7 3', 'Nothing — it fails to compile'],
    answer: 0,
    explanation:
      'a is a String and b is an Int, and Swift never converts between them behind your back. Int(a) turns the text "7" into the number 7, so the sum is 7 + 3 = 10.'
  },
  {
    id: 'prg-48',
    topic: 'Operators',
    difficulty: 'easy',
    prompt:
      'In this pseudocode / is integer division — it throws the remainder away — and MOD gives the remainder. What are the two lines of output?',
    lang: 'pseudocode',
    code: `a ← 17
b ← 5
OUTPUT a / b
OUTPUT a MOD b`,
    options: ['3 then 2', '3.4 then 2', '2 then 3', '3 then 3'],
    answer: 0,
    explanation:
      '17 = 3 × 5 + 2. Integer division keeps the 3 and discards the rest; MOD keeps the 2. Note that 3.4 is what you would get from real division, which is not what / means here.'
  },
  {
    id: 'prg-49',
    topic: 'Data types',
    difficulty: 'medium',
    prompt:
      'x and y hold text, not numbers, and text is compared character by character. What is printed?',
    lang: 'pseudocode',
    code: `x ← "10"
y ← "9"
IF x < y THEN
    OUTPUT "smaller"
ELSE
    OUTPUT "not smaller"
END IF`,
    options: ['smaller', 'not smaller', 'Nothing — text cannot be compared', '10'],
    answer: 0,
    explanation:
      'Compared as text, the first characters decide it: "1" comes before "9", so "10" < "9" is true and the answer is "smaller" — even though the number 10 is bigger than 9. This is the classic bug from reading numbers in from a form and forgetting to convert them.'
  }
];
