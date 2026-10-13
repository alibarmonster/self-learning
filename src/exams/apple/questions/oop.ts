/**
 * Section 3 — Object-Oriented Programming
 * Applicants consistently report questions on the four pillars, constructors,
 * inheritance, polymorphism and access control. Examples here use Swift and a
 * Java-like syntax, since the concepts — not the language — are what is tested.
 */

import type { Question } from '@/types';

export const oop: Question[] = [
  {
    id: 'oop-01',
    topic: 'Pillars of OOP',
    difficulty: 'easy',
    prompt: 'Which of these is NOT one of the four pillars of object-oriented programming?',
    options: ['Encapsulation', 'Inheritance', 'Compilation', 'Polymorphism'],
    answer: 2,
    explanation:
      'The four pillars are encapsulation, inheritance, polymorphism and abstraction. Compilation is a build step, not an OOP concept.'
  },
  {
    id: 'oop-02',
    topic: 'Encapsulation',
    difficulty: 'easy',
    prompt:
      'Hiding an object’s internal state and exposing only controlled ways to change it is called:',
    options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Composition'],
    answer: 1,
    explanation:
      'Encapsulation bundles data with the methods that operate on it and restricts direct outside access, usually through private properties plus getters and setters.'
  },
  {
    id: 'oop-03',
    topic: 'Encapsulation',
    difficulty: 'medium',
    prompt: 'What happens on the last line?',
    lang: 'swift',
    code: `class BankAccount {
    private var balance: Double = 0

    func deposit(_ amount: Double) {
        balance += amount
    }
}

let account = BankAccount()
account.deposit(100)
account.balance = 1000000`,
    options: [
      'The balance becomes 1,000,000.',
      'A compile error — balance is private and not visible outside the class.',
      'The balance becomes 1,000,100.',
      'Nothing happens at all; the line is ignored.'
    ],
    answer: 1,
    explanation:
      'private restricts balance to the class body. Outside code must go through deposit(_:). This is encapsulation protecting the object’s invariants.'
  },
  {
    id: 'oop-04',
    topic: 'Abstraction',
    difficulty: 'medium',
    prompt: 'What does abstraction mean in OOP?',
    options: [
      'Making every property public so any class can use it.',
      'Exposing only the essential behaviour and hiding the implementation details.',
      'Copying a class into another file.',
      'Writing code without any classes.'
    ],
    answer: 1,
    explanation:
      'Abstraction models what a thing does rather than how it does it. A user of a Printer type calls print() without knowing whether it is a laser or an inkjet.'
  },
  {
    id: 'oop-05',
    topic: 'Polymorphism',
    difficulty: 'medium',
    prompt: 'What does this print?',
    lang: 'swift',
    code: `class Animal {
    func speak() -> String { return "..." }
}

class Dog: Animal {
    override func speak() -> String { return "Woof" }
}

let pets: [Animal] = [Animal(), Dog()]
for pet in pets {
    print(pet.speak())
}`,
    options: [
      '... then ...',
      '... then Woof',
      'Woof then Woof',
      'A compile error, because Dog is not an Animal'
    ],
    answer: 1,
    explanation:
      'Even though the array is typed as [Animal], each element runs its own implementation at runtime. That is polymorphism through method overriding.'
  },
  {
    id: 'oop-06',
    topic: 'Polymorphism',
    difficulty: 'medium',
    prompt:
      'Two methods in the SAME class share a name but take different parameter lists. This is called:',
    options: ['Overriding', 'Overloading', 'Shadowing', 'Inheriting'],
    answer: 1,
    explanation:
      'Overloading is several versions of a method in one type, resolved by their signature. Overriding is a subclass replacing a parent’s implementation.'
  },
  {
    id: 'oop-07',
    topic: 'Inheritance',
    difficulty: 'medium',
    prompt: 'What is the output?',
    lang: 'java',
    code: `class A {
    A() { System.out.println("A"); }
}

class B extends A {
    B() { System.out.println("B"); }
}

// somewhere in main:
new B();`,
    options: ['B', 'A', 'A then B', 'B then A'],
    answer: 2,
    explanation:
      'A subclass constructor implicitly calls the superclass constructor first, so the parent finishes initialising before the child body runs.'
  },
  {
    id: 'oop-08',
    topic: 'Inheritance',
    difficulty: 'easy',
    prompt: 'What is the purpose of calling super.init() inside a subclass initializer?',
    options: [
      'To create a second, separate object.',
      'To let the superclass initialize the properties it owns.',
      'To delete the superclass implementation.',
      'To make the class abstract.'
    ],
    answer: 1,
    explanation:
      'The subclass is responsible for its own properties, then delegates upward so the inherited part of the object is fully initialized.'
  },
  {
    id: 'oop-09',
    topic: 'Inheritance vs composition',
    difficulty: 'medium',
    prompt: 'A Car contains an Engine. Which relationship does this describe?',
    options: [
      'Inheritance ("is-a")',
      'Composition ("has-a")',
      'Polymorphism',
      'Overloading'
    ],
    answer: 1,
    explanation:
      'A Car is not a kind of Engine, it owns one. "Has-a" relationships should be modelled with composition, not by subclassing.'
  },
  {
    id: 'oop-10',
    topic: 'Inheritance vs composition',
    difficulty: 'hard',
    prompt: 'Which statement best describes the "favour composition over inheritance" guideline?',
    options: [
      'Inheritance is always wrong and should never be used.',
      'Composition keeps types loosely coupled and easier to change, while deep inheritance chains make behaviour rigid and hard to trace.',
      'Composition runs faster than inheritance at runtime.',
      'Composition removes the need for interfaces or protocols.'
    ],
    answer: 1,
    explanation:
      'Subclasses depend on their parent’s internals, so a change high in the hierarchy ripples everywhere. Assembling behaviour from smaller collaborating objects keeps each piece replaceable.'
  },
  {
    id: 'oop-11',
    topic: 'Classes vs structs',
    difficulty: 'hard',
    prompt: 'What does this print?',
    lang: 'swift',
    code: `struct Point {
    var x = 0
}

var a = Point()
var b = a
b.x = 5
print(a.x)`,
    options: ['0', '5', 'nil', 'A compile error'],
    answer: 0,
    explanation:
      'A struct is a value type. Assigning it to b makes an independent copy, so mutating b leaves a untouched.'
  },
  {
    id: 'oop-12',
    topic: 'Classes vs structs',
    difficulty: 'hard',
    prompt: 'What does this print?',
    lang: 'swift',
    code: `class Point {
    var x = 0
}

let a = Point()
let b = a
b.x = 5
print(a.x)`,
    options: ['0', '5', 'nil', 'A compile error'],
    answer: 1,
    explanation:
      'A class is a reference type. a and b point at the same instance, so a change through one is visible through the other.'
  },
  {
    id: 'oop-13',
    topic: 'Constructors',
    difficulty: 'easy',
    prompt: 'What is the main purpose of a constructor (initializer)?',
    options: [
      'To free the memory used by an object.',
      'To set up an object’s initial state when it is created.',
      'To copy an object into another class.',
      'To compile the class.'
    ],
    answer: 1,
    explanation:
      'A constructor runs at creation time and is responsible for putting the new instance into a valid starting state.'
  },
  {
    id: 'oop-14',
    topic: 'Constructors',
    difficulty: 'medium',
    prompt: 'What is a destructor / deinitializer used for?',
    options: [
      'Creating a new instance.',
      'Releasing resources just before an object is destroyed.',
      'Renaming a class.',
      'Copying an object.'
    ],
    answer: 1,
    explanation:
      'A deinit (Swift) or finalizer runs as the object is torn down, which is where you close files, cancel timers or release observers.'
  },
  {
    id: 'oop-15',
    topic: 'Protocols & interfaces',
    difficulty: 'medium',
    prompt: 'In Swift, a protocol is most similar to which concept in Java?',
    options: ['An interface', 'A package', 'A constructor', 'A static variable'],
    answer: 0,
    explanation:
      'Both declare a set of requirements a conforming type must satisfy, without providing the implementation itself.'
  },
  {
    id: 'oop-16',
    topic: 'Protocols & interfaces',
    difficulty: 'medium',
    prompt: 'What does this print?',
    lang: 'swift',
    code: `protocol Shape {
    func area() -> Double
}

struct Square: Shape {
    let side: Double
    func area() -> Double { return side * side }
}

struct Circle: Shape {
    let r: Double
    func area() -> Double { return 3.14 * r * r }
}

let shapes: [Shape] = [Square(side: 2), Circle(r: 1)]
print(shapes.count, shapes[0].area())`,
    options: ['2 4.0', '2 3.14', '1 4.0', 'A compile error'],
    answer: 0,
    explanation:
      'Both types conform to Shape so they can live in the same array. shapes[0] is the square, whose area is 2 × 2 = 4.0.'
  },
  {
    id: 'oop-17',
    topic: 'Abstract types',
    difficulty: 'medium',
    prompt: 'Which statement about an abstract class is correct?',
    options: [
      'It can be instantiated directly like any other class.',
      'It cannot be instantiated directly and exists to be subclassed.',
      'It cannot contain any methods.',
      'It must inherit from at least one other class.'
    ],
    answer: 1,
    explanation:
      'An abstract class defines shared structure and possibly unimplemented methods, and only its concrete subclasses can be instantiated.'
  },
  {
    id: 'oop-18',
    topic: 'Access control',
    difficulty: 'easy',
    prompt:
      'Which access level makes a property visible ONLY inside the type that declares it?',
    options: ['public', 'internal', 'private', 'open'],
    answer: 2,
    explanation:
      'private is the most restrictive common level. internal is module-wide, and public/open expose the member outside the module.'
  },
  {
    id: 'oop-19',
    topic: 'Static members',
    difficulty: 'medium',
    prompt: 'What is true of a static (class-level) property?',
    options: [
      'Each instance gets its own separate copy.',
      'It belongs to the type itself and is shared by all instances.',
      'It can only hold integers.',
      'It is destroyed when any instance is deallocated.'
    ],
    answer: 1,
    explanation:
      'Static members live on the type, so there is exactly one copy no matter how many instances exist — useful for counters, shared caches or constants.'
  },
  {
    id: 'oop-20',
    topic: 'Keywords',
    difficulty: 'easy',
    prompt: 'What does the keyword self (or this) refer to inside an instance method?',
    options: [
      'The superclass of the current class.',
      'The instance the method is currently running on.',
      'A newly created copy of the object.',
      'The file the class is declared in.'
    ],
    answer: 1,
    explanation:
      'self is a reference to the current instance, most often used to disambiguate a property from a parameter of the same name.'
  },
  {
    id: 'oop-21',
    topic: 'Keywords',
    difficulty: 'medium',
    prompt: 'Which keyword prevents a method or class from being overridden or subclassed?',
    options: ['static', 'final', 'private', 'override'],
    answer: 1,
    explanation:
      'final closes a class or method to further specialisation, which also allows the compiler to dispatch calls more efficiently.'
  },
  {
    id: 'oop-22',
    topic: 'Multiple inheritance',
    difficulty: 'medium',
    prompt:
      'Swift and Java do not allow a class to inherit from more than one class. How do you share behaviour from several sources instead?',
    options: [
      'By copying the code into each class.',
      'By conforming to multiple protocols / implementing multiple interfaces.',
      'By making every class static.',
      'It is impossible; you must use one class only.'
    ],
    answer: 1,
    explanation:
      'A type can adopt many protocols or interfaces. This gives the flexibility of multiple inheritance without the ambiguity of the "diamond problem".'
  },
  {
    id: 'oop-23',
    topic: 'SOLID principles',
    difficulty: 'medium',
    prompt: 'What does the "S" in SOLID stand for?',
    options: [
      'Static Typing',
      'Single Responsibility Principle',
      'Separation of Syntax',
      'Structured Inheritance'
    ],
    answer: 1,
    explanation:
      'The Single Responsibility Principle: a class should have one, and only one, reason to change.'
  },
  {
    id: 'oop-24',
    topic: 'SOLID principles',
    difficulty: 'hard',
    prompt: 'The Open/Closed Principle says software entities should be:',
    options: [
      'Open for modification but closed for reuse.',
      'Open for extension but closed for modification.',
      'Open to every developer but closed to users.',
      'Closed for extension and open for modification.'
    ],
    answer: 1,
    explanation:
      'You should be able to add new behaviour — through subclassing, protocols or injection — without editing code that already works and is already tested.'
  },
  {
    id: 'oop-25',
    topic: 'Design practice',
    difficulty: 'hard',
    prompt: 'What is the main benefit of dependency injection?',
    options: [
      'It makes the program run with less memory.',
      'A type no longer creates its own collaborators, so it is decoupled and easy to test with fakes or mocks.',
      'It removes the need for constructors.',
      'It automatically fixes merge conflicts.'
    ],
    answer: 1,
    explanation:
      'Passing dependencies in from the outside lets you swap a real network client for a stub in tests, and lets the same type work in different contexts.'
  },
  {
    id: 'oop-26',
    topic: 'Getters & setters',
    difficulty: 'easy',
    prompt: 'Why expose a private property through a getter and setter instead of making it public?',
    options: [
      'It makes the code shorter.',
      'It lets the class validate or react to changes rather than allowing any value to be written.',
      'Public properties are not allowed in OOP languages.',
      'It improves the app’s frame rate.'
    ],
    answer: 1,
    explanation:
      'Accessors give the class a chance to enforce rules — rejecting a negative balance, clamping a value, or notifying observers — that a raw public field cannot.'
  },
  {
    id: 'oop-27',
    topic: 'Value semantics',
    difficulty: 'medium',
    prompt: 'Why does a Swift struct require the mutating keyword on methods that change its properties?',
    options: [
      'Because structs cannot have methods otherwise.',
      'Because value types are copied, so the method must be explicitly marked as modifying the instance it was called on.',
      'Because mutating makes the method run asynchronously.',
      'Because it is required for all Swift methods.'
    ],
    answer: 1,
    explanation:
      'Value types are immutable by default inside their own methods. mutating signals that the method writes back to the caller’s copy — which is also why it cannot be called on a let constant.'
  },
  {
    id: 'oop-28',
    topic: 'Modelling',
    difficulty: 'medium',
    prompt:
      'You are modelling an app with Student, Instructor and Admin, all of whom have a name and an email and can log in. What is the cleanest OOP design?',
    options: [
      'Write all three classes independently, duplicating the shared code.',
      'Put the shared name, email and login behaviour in a common User type and have the three specialise it.',
      'Make one giant class with a "role" string and if-statements everywhere.',
      'Make Student inherit from Instructor, and Instructor from Admin.'
    ],
    answer: 1,
    explanation:
      'The three roles genuinely are kinds of user, so a shared base type (or protocol) removes duplication while keeping each role free to add its own behaviour. Chaining unrelated roles into an inheritance line would be an "is-a" lie.'
  }
];
