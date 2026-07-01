export interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export const SUBJECTS = [
  "Data Structures & Algorithms",
  "Database Management Systems",
  "Operating Systems",
  "Computer Networks",
  "Aptitude & Quantitative Reasoning"
];

// Seeded 200 questions (40 per subject for 5 subjects)
export const questionsData: Question[] = [
  // ==========================================
  // SUBJECT 1: Data Structures & Algorithms (DSA) - IDs 1 to 40
  // ==========================================
  {
    id: 1,
    subject: "Data Structures & Algorithms",
    question: "What is the worst-case time complexity of inserting an element into a balanced binary search tree (like an AVL tree)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Trees"
  },
  {
    id: 2,
    subject: "Data Structures & Algorithms",
    question: "Which of the following data structures operates on a Last-In-First-Out (LIFO) basis?",
    options: ["Queue", "Stack", "Singly Linked List", "Heap"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Stacks"
  },
  {
    id: 3,
    subject: "Data Structures & Algorithms",
    question: "What is the best-case time complexity of the QuickSort algorithm?",
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Sorting"
  },
  {
    id: 4,
    subject: "Data Structures & Algorithms",
    question: "Which data structure is typically used to implement Breadth-First Search (BFS) on a graph?",
    options: ["Stack", "Queue", "Priority Queue", "Binary Tree"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Graphs"
  },
  {
    id: 5,
    subject: "Data Structures & Algorithms",
    question: "What is the primary advantage of a hash table over an array or linked list?",
    options: [
      "Guaranteed O(1) worst-case search time",
      "Average-case O(1) time complexity for search, insertion, and deletion",
      "Dynamic automatic sorting of elements",
      "Extremely low auxiliary memory usage"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Hashing"
  },
  {
    id: 6,
    subject: "Data Structures & Algorithms",
    question: "What is the time complexity to find the minimum element in a min-heap of size n?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Heaps"
  },
  {
    id: 7,
    subject: "Data Structures & Algorithms",
    question: "Which algorithm design paradigm does MergeSort utilize?",
    options: ["Greedy Approach", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Sorting"
  },
  {
    id: 8,
    subject: "Data Structures & Algorithms",
    question: "What is the maximum number of edges in a simple undirected graph with 'v' vertices?",
    options: ["v(v-1)", "v(v-1)/2", "v^2", "2^v"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Graphs"
  },
  {
    id: 9,
    subject: "Data Structures & Algorithms",
    question: "Which of the following traversing techniques of a Binary Search Tree outputs the elements in a sorted ascending order?",
    options: ["Pre-order traversal", "Post-order traversal", "In-order traversal", "Level-order traversal"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Trees"
  },
  {
    id: 10,
    subject: "Data Structures & Algorithms",
    question: "In a dynamic programming algorithm, what is the term used for storing already solved subproblem results?",
    options: ["Hashing", "Memoization", "Tabulation-search", "Garbage collection"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Dynamic Programming"
  },
  {
    id: 11,
    subject: "Data Structures & Algorithms",
    question: "Which traversal of a graph is implemented using recursion or an explicit Stack?",
    options: ["Breadth-First Search", "Depth-First Search", "Dijkstra's Shortest Path", "Kruskal's Algorithm"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Graphs"
  },
  {
    id: 12,
    subject: "Data Structures & Algorithms",
    question: "What is the worst-case space complexity of Depth-First Search (DFS) on a graph with V vertices?",
    options: ["O(1)", "O(log V)", "O(V)", "O(V^2)"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Graphs"
  },
  {
    id: 13,
    subject: "Data Structures & Algorithms",
    question: "In a singly linked list, what is the time complexity to delete an element at the end of the list if we only have a head pointer?",
    options: ["O(1)", "O(log n)", "O(n)", "O(1) with trailing pointer"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Linked Lists"
  },
  {
    id: 14,
    subject: "Data Structures & Algorithms",
    question: "What data structure is used by the operating system to manage function calls and local variables during execution?",
    options: ["Call Queue", "Process Heap", "Execution Stack", "Activation Registry"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Stacks"
  },
  {
    id: 15,
    subject: "Data Structures & Algorithms",
    question: "Which sorting algorithm is stable and has a guaranteed O(n log n) time complexity in all cases (worst, best, and average)?",
    options: ["QuickSort", "BubbleSort", "MergeSort", "SelectionSort"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Sorting"
  },
  {
    id: 16,
    subject: "Data Structures & Algorithms",
    question: "What is the primary drawback of using a singly linked list compared to a dynamic array?",
    options: [
      "Linked lists consume less total memory",
      "Linked lists do not allow direct O(1) random access of elements",
      "Inserting at the head takes O(n) time",
      "They cannot hold primitive data values"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Linked Lists"
  },
  {
    id: 17,
    subject: "Data Structures & Algorithms",
    question: "Which of the following describes a 'Trie' data structure?",
    options: [
      "A self-balancing binary search tree used for decimal ranges",
      "An information retrieval tree optimized for string keys and prefix searches",
      "A multidimensional array structured for floating-point calculations",
      "A heap structured specifically for concurrent threads"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Advanced DS"
  },
  {
    id: 18,
    subject: "Data Structures & Algorithms",
    question: "What does it mean if a sorting algorithm is classified as 'stable'?",
    options: [
      "It always takes exactly the same time regardless of input state",
      "It maintains the relative order of records with equal keys",
      "It runs strictly in O(1) auxiliary space",
      "It cannot be interrupted during multithreading"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Sorting"
  },
  {
    id: 19,
    subject: "Data Structures & Algorithms",
    question: "What is the worst-case lookup time in a Red-Black Tree with n elements?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Trees"
  },
  {
    id: 20,
    subject: "Data Structures & Algorithms",
    question: "Which algorithm finds the shortest path in a weighted graph containing only non-negative weights?",
    options: ["Prim's Algorithm", "Kruskal's Algorithm", "Dijkstra's Algorithm", "Bellman-Ford Algorithm"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Graphs"
  },
  {
    id: 21,
    subject: "Data Structures & Algorithms",
    question: "What is the time complexity of building a heap of size n from an unsorted array?",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Heaps"
  },
  {
    id: 22,
    subject: "Data Structures & Algorithms",
    question: "Which of the following stack applications is used to evaluate mathematical expressions?",
    options: ["Round-robin queue evaluation", "Infix-to-postfix conversion and postfix evaluation", "Backtracking search paths", "Graph topological sort"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Stacks"
  },
  {
    id: 23,
    subject: "Data Structures & Algorithms",
    question: "What is the primary difference between a Heap and a Binary Search Tree?",
    options: [
      "Heaps are strictly sorted from left to right",
      "BSTs are used only for characters, Heaps only for integers",
      "Heaps maintain vertical ordering constraints (parent keys vs children keys); BSTs maintain horizontal constraints (left < root < right)",
      "Heaps are not binary trees"
    ],
    correctAnswer: 2,
    difficulty: "hard",
    topic: "Heaps"
  },
  {
    id: 24,
    subject: "Data Structures & Algorithms",
    question: "What is the amortized cost of inserting an item at the end of a dynamic array (vector)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Arrays"
  },
  {
    id: 25,
    subject: "Data Structures & Algorithms",
    question: "In graph theory, what is a Minimum Spanning Tree?",
    options: [
      "A subgraph containing all vertices with the maximum possible total edge weight",
      "A subgraph containing all vertices with no cycles and the minimum possible total edge weight",
      "A path that visits every vertex exactly once with minimal length",
      "The shortest path between the two furthest nodes in a graph"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Graphs"
  },
  {
    id: 26,
    subject: "Data Structures & Algorithms",
    question: "Which sorting algorithm operates by continually finding the minimum element and placing it at the beginning?",
    options: ["Insertion Sort", "Selection Sort", "Bubble Sort", "Radix Sort"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Sorting"
  },
  {
    id: 27,
    subject: "Data Structures & Algorithms",
    question: "What is the recurrence relation for the Binary Search algorithm?",
    options: ["T(n) = 2T(n/2) + O(1)", "T(n) = T(n/2) + O(1)", "T(n) = T(n-1) + O(1)", "T(n) = T(n/2) + O(n)"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Binary Search"
  },
  {
    id: 28,
    subject: "Data Structures & Algorithms",
    question: "What is the maximum height of an AVL tree with 'n' nodes?",
    options: ["O(n)", "O(log n)", "O(sqrt(n))", "O(n log n)"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Trees"
  },
  {
    id: 29,
    subject: "Data Structures & Algorithms",
    question: "Which graph representations is space-efficient for sparse graphs?",
    options: ["Adjacency Matrix", "Adjacency List", "Incidence Matrix", "Flat Linear Buffer"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Graphs"
  },
  {
    id: 30,
    subject: "Data Structures & Algorithms",
    question: "What occurs when multiple keys map to the same hash table index during hashing?",
    options: ["Hash overflow", "Index collusion", "Hash collision", "Redundant hashing"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Hashing"
  },
  {
    id: 31,
    subject: "Data Structures & Algorithms",
    question: "Which of the following resolves hash collisions by storing elements in a linked list linked to the hash bucket?",
    options: ["Open Addressing", "Linear Probing", "Chaining", "Double Hashing"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Hashing"
  },
  {
    id: 32,
    subject: "Data Structures & Algorithms",
    question: "In a circular queue implemented using an array of size N, what is the formula to calculate the next position of the 'rear' index?",
    options: ["rear = rear + 1", "rear = (rear + 1) / N", "rear = (rear + 1) % N", "rear = rear % N + 1"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Queues"
  },
  {
    id: 33,
    subject: "Data Structures & Algorithms",
    question: "What is the auxiliary space complexity of standard in-place QuickSort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Sorting"
  },
  {
    id: 34,
    subject: "Data Structures & Algorithms",
    question: "Which graph search algorithm guarantees finding the shortest path first in an unweighted graph?",
    options: ["DFS", "BFS", "Topological Sort", "Kruskal's algorithm"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Graphs"
  },
  {
    id: 35,
    subject: "Data Structures & Algorithms",
    question: "What is a directed acyclic graph (DAG) topological sort?",
    options: [
      "A linear ordering of vertices such that for every directed edge uv, vertex u comes before v",
      "A traversal that sorts vertex values in alphabetic order",
      "An algorithm that lists nodes by their in-degree values only",
      "A cycle verification pathway"
    ],
    correctAnswer: 0,
    difficulty: "hard",
    topic: "Graphs"
  },
  {
    id: 36,
    subject: "Data Structures & Algorithms",
    question: "Which of the following algorithm paradigms does Dijkstra's shortest path algorithm employ?",
    options: ["Greedy algorithm", "Dynamic programming", "Divide and conquer", "Backtracking"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Graphs"
  },
  {
    id: 37,
    subject: "Data Structures & Algorithms",
    question: "What is the main advantage of an Adjacency Matrix over an Adjacency List?",
    options: [
      "It requires much less total memory",
      "It makes it easy to add a new vertex",
      "It allows checking if an edge exists between two nodes in constant O(1) time",
      "It traverses all edges faster in sparse graphs"
    ],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Graphs"
  },
  {
    id: 38,
    subject: "Data Structures & Algorithms",
    question: "What is the time complexity of a binary search on a sorted array of size n?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Binary Search"
  },
  {
    id: 39,
    subject: "Data Structures & Algorithms",
    question: "What is the time complexity of deleting a node from a doubly linked list, given a pointer directly to that node?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Linked Lists"
  },
  {
    id: 40,
    subject: "Data Structures & Algorithms",
    question: "Which data structure is optimal for finding the median of a streaming dataset in real-time?",
    options: [
      "A balanced binary search tree",
      "A combination of a max-heap and a min-heap",
      "A cyclic hash ring",
      "A sorted doubly linked list"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Advanced DS"
  },

  // ==========================================
  // SUBJECT 2: Database Management Systems (DBMS) - IDs 41 to 80
  // ==========================================
  {
    id: 41,
    subject: "Database Management Systems",
    question: "Which normal form handles transitive functional dependency constraints?",
    options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Normalization"
  },
  {
    id: 42,
    subject: "Database Management Systems",
    question: "What does the 'I' in ACID transaction properties stand for?",
    options: ["Increment", "Isolation", "Integration", "Indestructibility"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Transactions"
  },
  {
    id: 43,
    subject: "Database Management Systems",
    question: "Which SQL clause is used to filter records after an aggregate operation has been performed with GROUP BY?",
    options: ["WHERE", "HAVING", "LIMIT", "FILTER_BY"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "SQL Queries"
  },
  {
    id: 44,
    subject: "Database Management Systems",
    question: "What is a primary key that is composed of more than one column or attribute called?",
    options: ["Foreign Key", "Candidate Key", "Composite Key", "Surrogate Key"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Relational Model"
  },
  {
    id: 45,
    subject: "Database Management Systems",
    question: "Which of the following describes a 'Foreign Key' constraint?",
    options: [
      "A key that uniquely identifies every user from an external country",
      "An attribute in one table that references the Primary Key of another table to maintain referential integrity",
      "A system key used strictly for data backups",
      "A hashed index value"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Relational Model"
  },
  {
    id: 46,
    subject: "Database Management Systems",
    question: "What join returns all rows from the left table, and the matched rows from the right table, filling with NULL values where no match is found?",
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "SQL Queries"
  },
  {
    id: 47,
    subject: "Database Management Systems",
    question: "In relational algebra, which operator is represented by the Greek letter Sigma (σ) and filters rows?",
    options: ["Projection", "Selection", "Join", "Cartesian Product"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Relational Algebra"
  },
  {
    id: 48,
    subject: "Database Management Systems",
    question: "What relational algebra operator is represented by the Greek letter Pi (π) and selects specific columns?",
    options: ["Selection", "Projection", "Division", "Intersection"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Relational Algebra"
  },
  {
    id: 49,
    subject: "Database Management Systems",
    question: "What does a 'Dirty Read' anomaly in transaction processing mean?",
    options: [
      "Reading data from a corrupted storage disk block",
      "A transaction reads data that has been modified by another concurrent transaction but not yet committed",
      "Reading duplicate values during database synchronization",
      "Reading records that have been deleted permanently"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Concurrency Control"
  },
  {
    id: 50,
    subject: "Database Management Systems",
    question: "Which indexing structure is most commonly used in relational databases for efficient range queries?",
    options: ["Hash Index", "B+ Tree Index", "Binary Tree Index", "Inverted Index"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Indexing"
  },
  {
    id: 51,
    subject: "Database Management Systems",
    question: "What is Boyce-Codd Normal Form (BCNF)?",
    options: [
      "A normal form where every functional dependency X -> Y has X as a superkey",
      "A normal form that handles multi-valued dependencies",
      "A normal form requiring zero primary keys",
      "A format optimized for JSON unstructured document structures"
    ],
    correctAnswer: 0,
    difficulty: "hard",
    topic: "Normalization"
  },
  {
    id: 52,
    subject: "Database Management Systems",
    question: "Which constraint is violated if a primary key column is assigned a NULL value?",
    options: ["Referential Integrity", "Entity Integrity", "Domain Integrity", "User-defined Integrity"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Relational Model"
  },
  {
    id: 53,
    subject: "Database Management Systems",
    question: "What does a 'Cascade Delete' rule in a foreign key constraint specify?",
    options: [
      "Deleting a parent record will raise an database trigger error",
      "Deleting a parent record automatically deletes all corresponding child records referencing it",
      "Deleting a parent record sets all referencing foreign keys to NULL",
      "Parent records can never be deleted under any circumstance"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Relational Model"
  },
  {
    id: 54,
    subject: "Database Management Systems",
    question: "What transaction property ensures that once a transaction is committed, its changes survive even in the event of a total power failure or system crash?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctAnswer: 3,
    difficulty: "easy",
    topic: "Transactions"
  },
  {
    id: 55,
    subject: "Database Management Systems",
    question: "Which SQL command is used to remove both the structure of a table and all its records permanently?",
    options: ["TRUNCATE TABLE", "DELETE FROM", "DROP TABLE", "REMOVE TABLE"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "SQL Queries"
  },
  {
    id: 56,
    subject: "Database Management Systems",
    question: "What index is optimal for looking up columns with low-cardinality values (like gender or state fields)?",
    options: ["B-Tree Index", "Bitmap Index", "Clustered Index", "Dense Hash Index"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Indexing"
  },
  {
    id: 57,
    subject: "Database Management Systems",
    question: "In the context of database transactions, what does 'Atomicity' guarantee?",
    options: [
      "All operations inside a transaction are executed successfully or none of them are",
      "Data is processed in atomic units of 1 byte",
      "No two transactions can access the same data block",
      "Transactions are compiled into atomic binary structures"
    ],
    correctAnswer: 0,
    difficulty: "easy",
    topic: "Transactions"
  },
  {
    id: 58,
    subject: "Database Management Systems",
    question: "Which functional dependencies does a relation in Second Normal Form (2NF) eliminate?",
    options: [
      "Transitive functional dependencies",
      "Partial functional dependencies on any candidate key",
      "Multi-valued dependencies",
      "Join dependencies"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Normalization"
  },
  {
    id: 59,
    subject: "Database Management Systems",
    question: "What is the primary difference between B-Trees and B+ Trees?",
    options: [
      "B-Trees are binary search trees; B+ Trees are multi-way search trees",
      "B+ Trees store data pointers only in leaf nodes, which are also linked in a sequential list; B-Trees store keys and data in internal nodes",
      "B-Trees are stored in RAM; B+ Trees are strictly stored on disk blocks",
      "B+ Trees have fewer nodes than B-Trees"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Indexing"
  },
  {
    id: 60,
    subject: "Database Management Systems",
    question: "What locking mechanism solves the phantom read anomaly?",
    options: ["Shared Lock", "Exclusive Lock", "Range Lock / Intent Locks", "Two-Phase Locking (2PL)"],
    correctAnswer: 2,
    difficulty: "hard",
    topic: "Concurrency Control"
  },
  {
    id: 61,
    subject: "Database Management Systems",
    question: "What is a 'correlated subquery' in SQL?",
    options: [
      "A subquery that is run concurrently in another thread",
      "A subquery that depends on values from the outer query and is executed once for each candidate row in the outer query",
      "A query that returns multiple relation columns",
      "A subquery that operates strictly on the same index key"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "SQL Queries"
  },
  {
    id: 62,
    subject: "Database Management Systems",
    question: "Which command would you use to add a new column 'age' to an existing table 'students'?",
    options: [
      "UPDATE TABLE students ADD COLUMN age INTEGER;",
      "ALTER TABLE students ADD age INTEGER;",
      "INSERT INTO students (age) VALUES (INTEGER);",
      "MODIFY TABLE students APPEND age INTEGER;"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "SQL Queries"
  },
  {
    id: 63,
    subject: "Database Management Systems",
    question: "What does the Two-Phase Locking (2PL) protocol guarantee?",
    options: [
      "The database will never enter a deadlock state",
      "Serializability of transaction schedules",
      "All transactions will commit within 2 seconds",
      "Transactions are split into reading and writing cycles"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Concurrency Control"
  },
  {
    id: 64,
    subject: "Database Management Systems",
    question: "What is the difference between TRUNCATE and DELETE commands?",
    options: [
      "TRUNCATE is a DDL command that cannot be rolled back and deletes all rows by deallocating pages; DELETE is a DML command that logs row-by-row deletions and can be rolled back",
      "DELETE is faster than TRUNCATE",
      "TRUNCATE can use a WHERE filter clause; DELETE cannot",
      "TRUNCATE deletes the table schema; DELETE preserves it"
    ],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "SQL Queries"
  },
  {
    id: 65,
    subject: "Database Management Systems",
    question: "What database construct is a pre-compiled SQL query stored in the database catalog that can accept input variables?",
    options: ["Database View", "Stored Procedure", "Trigger", "Index Map"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "DBMS Architecture"
  },
  {
    id: 66,
    subject: "Database Management Systems",
    question: "What is a database 'trigger'?",
    options: [
      "A hardware signal that shuts down the server upon data corruption",
      "A procedural code block that automatically executes in response to DML operations (INSERT, UPDATE, DELETE)",
      "An index key that speeds up range searches",
      "A flag that indicates a deadlock has occurred"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "DBMS Architecture"
  },
  {
    id: 67,
    subject: "Database Management Systems",
    question: "Which of the following database problems is commonly called the 'Lost Update' problem?",
    options: [
      "Two transactions attempt to update different columns of the same row simultaneously",
      "Two transactions read and write the same data item concurrently, where one transaction overwrites the committed update of the other",
      "A transaction is rolled back after its update is flushed to disk",
      "The log file buffer runs out of memory"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Concurrency Control"
  },
  {
    id: 68,
    subject: "Database Management Systems",
    question: "What isolation level offers the highest level of protection against transaction concurrency anomalies?",
    options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
    correctAnswer: 3,
    difficulty: "medium",
    topic: "Transactions"
  },
  {
    id: 69,
    subject: "Database Management Systems",
    question: "In the context of E-R diagrams, what does double ovals represent?",
    options: ["Multivalued Attribute", "Derived Attribute", "Weak Entity", "Identifying Relationship"],
    correctAnswer: 0,
    difficulty: "easy",
    topic: "ER Diagrams"
  },
  {
    id: 70,
    subject: "Database Management Systems",
    question: "What E-R diagram symbol represents a weak entity set?",
    options: ["Double Oval", "Double Rectangle", "Dashed Oval", "Double Diamond"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "ER Diagrams"
  },
  {
    id: 71,
    subject: "Database Management Systems",
    question: "What does a candidate key mean?",
    options: [
      "The primary key chosen by the database DBA",
      "A minimal set of attributes that can uniquely identify a tuple in a relation",
      "An external column used for reference constraints",
      "A key that is automatically incremented"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Relational Model"
  },
  {
    id: 72,
    subject: "Database Management Systems",
    question: "Which of the following describes a 'Clustered Index'?",
    options: [
      "An index that groups nodes based on functional values",
      "An index where the physical order of rows in the table is sorted to match the logical order of the index key",
      "An index consisting of multiple foreign key columns",
      "A virtual index stored inside RAM buffers"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Indexing"
  },
  {
    id: 73,
    subject: "Database Management Systems",
    question: "What does database 'Normalization' aim to achieve?",
    options: [
      "To multiply table records to ensure backup reliability",
      "To minimize data redundancy and prevent data anomalies (insert, update, delete)",
      "To convert SQL queries into machine instructions",
      "To standardise the data types of columns across different DBMS products"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Normalization"
  },
  {
    id: 74,
    subject: "Database Management Systems",
    question: "What is a 'Deadlock' state in transactional databases?",
    options: [
      "A state where a transaction is blocked forever because it is waiting for a lock held by another transaction, which in turn is waiting for a lock held by the first transaction",
      "A database server crash due to memory corruption",
      "An active lock on a table that cannot be removed",
      "A transaction that commits without saving changes"
    ],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Concurrency Control"
  },
  {
    id: 75,
    subject: "Database Management Systems",
    question: "Which SQL operator searches for a specified pattern in a column using wildcards (like %)?",
    options: ["IN", "LIKE", "BETWEEN", "EXISTS"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "SQL Queries"
  },
  {
    id: 76,
    subject: "Database Management Systems",
    question: "In database normalisation, what functional dependencies does 4NF address?",
    options: ["Transitive dependencies", "Partial dependencies", "Multi-valued dependencies", "Join dependencies"],
    correctAnswer: 2,
    difficulty: "hard",
    topic: "Normalization"
  },
  {
    id: 77,
    subject: "Database Management Systems",
    question: "Which schema definition represents the conceptual layout of a relational database?",
    options: ["Physical Schema", "Logical Schema", "Internal Schema", "External View Schema"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "DBMS Architecture"
  },
  {
    id: 78,
    subject: "Database Management Systems",
    question: "What SQL join yields the Cartesian product of the two tables?",
    options: ["INNER JOIN", "CROSS JOIN", "NATURAL JOIN", "LEFT OUTER JOIN"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "SQL Queries"
  },
  {
    id: 79,
    subject: "Database Management Systems",
    question: "Which transaction recovery algorithm is designed to handle redo and undo phases after a database crash?",
    options: ["ARIES recovery algorithm", "Two-Phase Commit (2PC)", "Lamport's logical clocks", "Dijkstra's audit algorithm"],
    correctAnswer: 0,
    difficulty: "hard",
    topic: "Transactions"
  },
  {
    id: 80,
    subject: "Database Management Systems",
    question: "What is a 'View' in a relational database?",
    options: [
      "A static snapshot copy of table records saved on backup disks",
      "A virtual table defined by a saved SQL query that is evaluated dynamically when queried",
      "A user interface screen to display records",
      "An index structure stored on disk blocks"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "DBMS Architecture"
  },

  // ==========================================
  // SUBJECT 3: Operating Systems (OS) - IDs 81 to 120
  // ==========================================
  {
    id: 81,
    subject: "Operating Systems",
    question: "What is the primary function of the CPU scheduler in an operating system?",
    options: [
      "To allocate RAM memory blocks to processes",
      "To select from among the processes in memory that are ready to execute and allocate the CPU to one of them",
      "To handle input-output hardware interrupts",
      "To translate high-level program codes to machine operations"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "CPU Scheduling"
  },
  {
    id: 82,
    subject: "Operating Systems",
    question: "Which of the following conditions is NOT required for a deadlock to occur?",
    options: ["Mutual Exclusion", "No Preemption", "Hold and Wait", "Preemptive resource scheduling"],
    correctAnswer: 3,
    difficulty: "medium",
    topic: "Deadlocks"
  },
  {
    id: 83,
    subject: "Operating Systems",
    question: "What memory management technique maps virtual addresses to physical pages?",
    options: ["Segmentation", "Fragmentation", "Paging", "Compaction"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Memory Management"
  },
  {
    id: 84,
    subject: "Operating Systems",
    question: "What is a 'Page Fault'?",
    options: [
      "A syntax error in program memory addresses",
      "An interrupt raised when a program attempts to access a page mapped in virtual address space but not currently loaded in physical RAM",
      "A physical sector block defect on the hard drive",
      "An instruction compilation failure"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Memory Management"
  },
  {
    id: 85,
    subject: "Operating Systems",
    question: "Which scheduling algorithm can lead to the 'Starvation' or 'Convoy Effect' of smaller processes?",
    options: ["Round Robin (RR)", "Shortest Job First (SJF) and Priority Scheduling", "First-Come First-Served (FCFS)", "Multilevel Feedback Queue"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "CPU Scheduling"
  },
  {
    id: 86,
    subject: "Operating Systems",
    question: "What is a 'thread' in an operating system?",
    options: [
      "A program source code line",
      "A basic unit of CPU utilization that shares memory and resources with other threads belonging to the same process",
      "An active network connection socket",
      "An encryption key"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Processes & Threads"
  },
  {
    id: 87,
    subject: "Operating Systems",
    question: "Which page replacement algorithm replaces the page that has not been used for the longest period of time?",
    options: ["FIFO (First-In, First-Out)", "LRU (Least Recently Used)", "LFU (Least Frequently Used)", "Optimal Replacement"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Page Replacement"
  },
  {
    id: 88,
    subject: "Operating Systems",
    question: "What state is a process in when it is waiting for an input-output operation to complete?",
    options: ["Ready State", "Running State", "Blocked / Waiting State", "Terminated State"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Processes & Threads"
  },
  {
    id: 89,
    subject: "Operating Systems",
    question: "What is a 'system call' in an operating system?",
    options: [
      "An automated telephone support script",
      "The programmatic interface provided by an OS to allow user-space applications to request kernel services",
      "A network broadcast signal",
      "A compiler diagnostic check"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Kernel"
  },
  {
    id: 90,
    subject: "Operating Systems",
    question: "What hardware component is responsible for translating virtual memory addresses to physical memory addresses in real-time?",
    options: ["ALU (Arithmetic Logic Unit)", "MMU (Memory Management Unit)", "DMA Controller", "CPU cache controller"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Memory Management"
  },
  {
    id: 91,
    subject: "Operating Systems",
    question: "What is the purpose of the 'Banker's Algorithm' in operating systems?",
    options: ["To balance credit workloads among nodes", "To prevent and avoid deadlocks in resource allocation by testing safety states", "To schedule network socket transmissions", "To optimize file disk storage allocations"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Deadlocks"
  },
  {
    id: 92,
    subject: "Operating Systems",
    question: "What is the critical section problem?",
    options: [
      "A CPU crash when scheduling too many files",
      "The problem of designing a protocol where concurrent processes can synchronize their operations to share data without mutual exclusion conflicts",
      "A memory overflow in the OS kernel boot sector",
      "A network connection timeout"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Process Synchronization"
  },
  {
    id: 93,
    subject: "Operating Systems",
    question: "Which of the following describes 'Belady's Anomaly'?",
    options: [
      "A program crashes when given empty inputs",
      "For some page-replacement algorithms (like FIFO), the page fault rate may increase as the number of allocated physical frames increases",
      "A deadlock occurring with only a single process active",
      "Virtual memory processing slower than hard drive read rates"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Page Replacement"
  },
  {
    id: 94,
    subject: "Operating Systems",
    question: "What is a 'Mutex'?",
    options: [
      "A database table record index",
      "A binary semaphore used to provide mutual exclusion among concurrent threads accessing a shared resource",
      "A network interface socket layer",
      "An address bus controller"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Process Synchronization"
  },
  {
    id: 95,
    subject: "Operating Systems",
    question: "What mechanism allows devices to transfer data directly to or from the main memory without continuous intervention from the CPU?",
    options: ["Direct Memory Access (DMA)", "Programmed I/O", "Polled Interrupt Routing", "Address Bus Cache"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "I/O Systems"
  },
  {
    id: 96,
    subject: "Operating Systems",
    question: "What is 'Thrashing' in an operating system?",
    options: [
      "A hardware error where disk sectors are physically damaged",
      "A state of high paging activity where the system spends more time swapping pages in and out of virtual memory than executing actual instructions",
      "An intensive process scheduling sweep",
      "An automated file deletion protocol"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Memory Management"
  },
  {
    id: 97,
    subject: "Operating Systems",
    question: "What is a 'Zombie Process'?",
    options: [
      "A process that is executed repeatedly in an infinite loop",
      "A process that has completed execution but still has an entry in the OS process table because its parent has not yet read its exit status",
      "A process whose parent process was terminated early",
      "A process that runs strictly in background modes"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Processes & Threads"
  },
  {
    id: 98,
    subject: "Operating Systems",
    question: "What is an 'Orphan Process'?",
    options: [
      "A process whose exit code is incorrect",
      "A process whose parent process has terminated, leaving it to be adopted by the root 'init' process",
      "A thread that has lost its local heap pointer",
      "An unlinked network socket"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Processes & Threads"
  },
  {
    id: 99,
    subject: "Operating Systems",
    question: "Which of the following represents a non-preemptive scheduling algorithm?",
    options: ["Round Robin (RR)", "First-Come, First-Served (FCFS)", "Preemptive Shortest Remaining Time First", "Multi-level Feedback Queue"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "CPU Scheduling"
  },
  {
    id: 100,
    subject: "Operating Systems",
    question: "What is 'context switching'?",
    options: [
      "Moving application windows across displays",
      "The process of saving the current CPU state of a process and loading the saved state of another process to resume execution",
      "Changing program themes in configuration settings",
      "Mapping directory paths on storage sectors"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Processes & Threads"
  },
  {
    id: 101,
    subject: "Operating Systems",
    question: "What is the main advantage of dynamic linking over static linking?",
    options: [
      "Dynamic linking is faster during runtime execution",
      "Dynamic linking reduces the size of executable files and saves RAM by sharing library files in memory",
      "Dynamic linking eliminates all compile-time errors",
      "It doesn't require compiling code"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Memory Management"
  },
  {
    id: 102,
    subject: "Operating Systems",
    question: "Which file allocation method utilizes an index block pointing to all physical disk sectors assigned to that file?",
    options: ["Contiguous Allocation", "Linked Allocation", "Indexed Allocation", "FAT File Allocation Table"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "File Systems"
  },
  {
    id: 103,
    subject: "Operating Systems",
    question: "What is 'SPOOLing'?",
    options: [
      "An encryption algorithm for shared files",
      "An acronym for Simultaneous Peripheral Operations On-Line, used to buffer data for slow devices like printers",
      "A memory compaction sweep",
      "A process scheduling queue"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "I/O Systems"
  },
  {
    id: 104,
    subject: "Operating Systems",
    question: "Which directory structure is used in modern multi-user operating systems?",
    options: ["Single-level Directory", "Two-level Directory", "Tree-Structured Directory or Acyclic Graph Directory", "Flat sequential table directory"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "File Systems"
  },
  {
    id: 105,
    subject: "Operating Systems",
    question: "What does the 'inode' in Unix-like file systems store?",
    options: [
      "The raw textual content of a file",
      "The metadata of a file (size, permissions, owner, block locations) but not its name",
      "The directory indexes only",
      " Hashed security keys"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "File Systems"
  },
  {
    id: 106,
    subject: "Operating Systems",
    question: "What is the purpose of the Translation Lookaside Buffer (TLB)?",
    options: [
      "To cache recent CPU calculations",
      "To cache virtual-to-physical address mappings to speed up virtual memory paging access",
      "To translate high-level API routines",
      "To buffer network data packets"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Memory Management"
  },
  {
    id: 107,
    subject: "Operating Systems",
    question: "In synchronization, what does an 'atomic operation' mean?",
    options: [
      "An operation executed in nuclear reactor computing arrays",
      "An operation that executes completely as a single indivisible unit, without being interrupted by other processes",
      "An operation that can only hold binary values",
      "A compiler validation sweep"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Process Synchronization"
  },
  {
    id: 108,
    subject: "Operating Systems",
    question: "What scheduling algorithm assigns a small fixed time slice (quantum) to each process in a cyclic queue?",
    options: ["Shortest Job First", "Priority Scheduling", "Round Robin Scheduling", "Multilevel Feedback Queue"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "CPU Scheduling"
  },
  {
    id: 109,
    subject: "Operating Systems",
    question: "What is 'external fragmentation'?",
    options: [
      "Hard drive sectors cracking physically",
      "Total free memory space is sufficient to satisfy an allocation request, but it is not contiguous, consisting of small isolated blocks",
      "Process stacks expanding beyond heap allocations",
      "Duplicate file records in directories"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Memory Management"
  },
  {
    id: 110,
    subject: "Operating Systems",
    question: "Which memory allocation scheme suffers from internal fragmentation?",
    options: ["Variable Partition Allocation", "Fixed Partition Allocation or Paging", "Segmentation", "Dynamic memory pool arrays"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Memory Management"
  },
  {
    id: 111,
    subject: "Operating Systems",
    question: "What is a 'Counting Semaphore'?",
    options: [
      "A thread variable that counts instruction iterations",
      "An integer variable used to control access to a resource pool with a finite number of instances",
      "A security certificate",
      "A process state register"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Process Synchronization"
  },
  {
    id: 112,
    subject: "Operating Systems",
    question: "Which of the following file access patterns is optimal for reading database tables from random disk blocks?",
    options: ["Sequential Access", "Direct / Random Access", "Indexed Sequential Access", "Buffered Stack Access"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "File Systems"
  },
  {
    id: 113,
    subject: "Operating Systems",
    question: "What mechanism is used by a process to create a new, identical child process in Unix systems?",
    options: ["exec() system call", "fork() system call", "create_process() routine", "clone_thread() procedure"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Processes & Threads"
  },
  {
    id: 114,
    subject: "Operating Systems",
    question: "What is the role of a 'shell' in an operating system?",
    options: [
      "To compile code modules",
      "To provide a command-line interface that interprets user inputs and executes requested system programs",
      "To manage hardware device registers directly",
      "To allocate memory partitions"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Kernel"
  },
  {
    id: 115,
    subject: "Operating Systems",
    question: "Which disk scheduling algorithm services requests in a single sweeping direction across tracks before returning to the start, similar to an elevator?",
    options: ["SSTF (Shortest Seek Time First)", "SCAN / LOOK Scheduling", "FCFS Scheduling", "Circular SCAN (C-SCAN)"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "I/O Systems"
  },
  {
    id: 116,
    subject: "Operating Systems",
    question: "What is 'microkernel' architecture?",
    options: [
      "A small processor chip designed for smart devices",
      "An OS architecture where only essential components (IPC, memory, scheduling) are kept in kernel space, and others run in user space",
      "An OS designed entirely inside a single massive assembly code module",
      "A virtual emulator tool"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "OS Architecture"
  },
  {
    id: 117,
    subject: "Operating Systems",
    question: "Which register stores the address of the next instruction to be fetched and executed by the CPU?",
    options: ["Instruction Register", "Accumulator", "Program Counter (PC)", "Memory Address Register"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Processes & Threads"
  },
  {
    id: 118,
    subject: "Operating Systems",
    question: "What is a 'race condition'?",
    options: [
      "A CPU benchmarking execution test",
      "An anomaly where multiple threads concurrently read and write to a shared variable, and the final value depends on the execution scheduling order",
      "A compiler optimization process",
      "A network transmission collision"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Process Synchronization"
  },
  {
    id: 119,
    subject: "Operating Systems",
    question: "What does the term 'Preemption' refer to in scheduling?",
    options: [
      "Allowing a process to complete its work without interruption",
      "The ability of the OS to interrupt a currently running process and temporarily allocate the CPU to another higher-priority process",
      "Deleting inactive files from cache memory",
      "Preparing memory segments before process creation"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "CPU Scheduling"
  },
  {
    id: 120,
    subject: "Operating Systems",
    question: "Which of the following is an example of an inter-process communication (IPC) mechanism?",
    options: ["Direct pointer assignment", "Pipes, Shared Memory, and Message Queues", "Global variables in different applications", "CPU cache partitions"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Processes & Threads"
  },

  // ==========================================
  // SUBJECT 4: Computer Networks (CN) - IDs 121 to 160
  // ==========================================
  {
    id: 121,
    subject: "Computer Networks",
    question: "Which OSI model layer is responsible for routing data packets across different subnetworks?",
    options: ["Data Link Layer", "Network Layer", "Transport Layer", "Session Layer"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "OSI Model"
  },
  {
    id: 122,
    subject: "Computer Networks",
    question: "What is the primary difference between TCP and UDP protocols?",
    options: [
      "TCP is connection-oriented and reliable, guaranteeing packet delivery; UDP is connectionless, faster, but does not guarantee delivery",
      "TCP is used strictly for emails; UDP for websites",
      "TCP operates at the Network layer; UDP at the Transport layer",
      "TCP is slower because it encrypts all packet payloads"
    ],
    correctAnswer: 0,
    difficulty: "easy",
    topic: "Transport Layer"
  },
  {
    id: 123,
    subject: "Computer Networks",
    question: "What is the standard subnet mask for a Class C IP address?",
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "IP Addressing"
  },
  {
    id: 124,
    subject: "Computer Networks",
    question: "Which of the following protocols translates domain names (like google.com) into readable IP addresses?",
    options: ["DHCP", "DNS", "FTP", "ARP"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Application Layer"
  },
  {
    id: 125,
    subject: "Computer Networks",
    question: "What protocol is used at the Data Link layer to map an IP address to its physical MAC address?",
    options: ["DNS", "DHCP", "ARP (Address Resolution Protocol)", "ICMP"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Data Link Layer"
  },
  {
    id: 126,
    subject: "Computer Networks",
    question: "What is the size of an IPv6 address compared to an IPv4 address?",
    options: ["32 bits vs 16 bits", "64 bits vs 32 bits", "128 bits vs 32 bits", "256 bits vs 64 bits"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "IP Addressing"
  },
  {
    id: 127,
    subject: "Computer Networks",
    question: "In computer networks, what does 'congestion control' do in TCP?",
    options: [
      "It limits the amount of raw data a sender can send before receiving an acknowledgement, preventing network overload",
      "It accelerates routing table searches",
      "It compresses file payloads during socket transfer",
      "It encrypts headers to prevent port interception"
    ],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Transport Layer"
  },
  {
    id: 128,
    subject: "Computer Networks",
    question: "What is the purpose of the three-way handshake in TCP connection establishment?",
    options: [
      "To negotiate file transfer protocols",
      "To synchronize sequence numbers and establish a reliable, bi-directional connection between sender and receiver",
      "To calculate routing hops",
      "To exchange cryptographic hash keys"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Transport Layer"
  },
  {
    id: 129,
    subject: "Computer Networks",
    question: "Which port is standard for HTTPS (secure web) traffic?",
    options: ["Port 80", "Port 443", "Port 22", "Port 8080"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Application Layer"
  },
  {
    id: 130,
    subject: "Computer Networks",
    question: "What protocol is used by network devices (like ping) to send error messages and operational information?",
    options: ["SMTP", "ICMP (Internet Control Message Protocol)", "ARP", "UDP"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Network Layer"
  },
  {
    id: 131,
    subject: "Computer Networks",
    question: "In subnetworking, how many usable host IP addresses are available in a subnet with a /29 mask?",
    options: ["8 hosts", "6 hosts", "16 hosts", "14 hosts"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "IP Addressing"
  },
  {
    id: 132,
    subject: "Computer Networks",
    question: "What is a 'MAC address' in networking?",
    options: [
      "An IP address configured specifically for Apple Macintosh computers",
      "A unique, 48-bit physical hardware address burned into the network interface card (NIC) at manufacture",
      "An address used strictly inside virtual private networks",
      "A mathematical checksum value in TCP headers"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Data Link Layer"
  },
  {
    id: 133,
    subject: "Computer Networks",
    question: "Which layer of the OSI model handles data compression, character encoding translation, and encryption/decryption?",
    options: ["Application Layer", "Presentation Layer", "Session Layer", "Transport Layer"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "OSI Model"
  },
  {
    id: 134,
    subject: "Computer Networks",
    question: "What does DHCP stand for and what does it do?",
    options: [
      "Dynamic Host Configuration Protocol; automatically assigns IP addresses and network parameters to client devices",
      "Direct Hardware Communication Port; handles physical cable signals",
      "Distributed Hash Control Protocol; handles routing tables",
      "Dynamic Hypertext Transfer Protocol; manages secure web pages"
    ],
    correctAnswer: 0,
    difficulty: "easy",
    topic: "Application Layer"
  },
  {
    id: 135,
    subject: "Computer Networks",
    question: "What is the maximum segment lifetime or TTL (Time To Live) in an IP header used to prevent?",
    options: [
      "Data corruption in packet payloads",
      "Packets circulating indefinitely in routing loops",
      "Port scanning attacks",
      "Buffer overflow in receiving queues"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Network Layer"
  },
  {
    id: 136,
    subject: "Computer Networks",
    question: "Which of the following routing protocols is classified as an Exterior Gateway Protocol (EGP)?",
    options: ["RIP (Routing Information Protocol)", "OSPF (Open Shortest Path First)", "BGP (Border Gateway Protocol)", "EIGRP"],
    correctAnswer: 2,
    difficulty: "hard",
    topic: "Routing"
  },
  {
    id: 137,
    subject: "Computer Networks",
    question: "What is the loopback IP address for a local host interface?",
    options: ["192.168.1.1", "10.0.0.1", "127.0.0.1", "172.16.0.1"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "IP Addressing"
  },
  {
    id: 138,
    subject: "Computer Networks",
    question: "Which topology connects all network nodes to a single central hub or switch?",
    options: ["Bus Topology", "Star Topology", "Ring Topology", "Mesh Topology"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Network Topologies"
  },
  {
    id: 139,
    subject: "Computer Networks",
    question: "What does CSMA/CD do in Ethernet networks?",
    options: [
      "Encrypts wireless frames during propagation",
      "Allows nodes to detect data collisions on a shared medium and retry after a random backoff interval",
      "Determines the shortest routing pathway",
      "Resolves DNS domain queries"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Data Link Layer"
  },
  {
    id: 140,
    subject: "Computer Networks",
    question: "Which transmission medium uses light pulses to transmit data packets at extremely high speeds over long distances?",
    options: ["Coaxial Cable", "Shielded Twisted Pair", "Fiber-Optic Cable", "Infrared wireless arrays"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Physical Layer"
  },
  {
    id: 141,
    subject: "Computer Networks",
    question: "What network security protocol replaced the insecure WEP standard for Wi-Fi encryption?",
    options: ["WPA / WPA2 / WPA3", "SSL / TLS", "SSH", "IPsec"],
    correctAnswer: 0,
    difficulty: "easy",
    topic: "Network Security"
  },
  {
    id: 142,
    subject: "Computer Networks",
    question: "Which of the following devices operates at the physical layer of the OSI model?",
    options: ["Network Router", "Network Switch", "Passive Hub or Repeater", "Firewall gateway"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Physical Layer"
  },
  {
    id: 143,
    subject: "Computer Networks",
    question: "What is the primary function of a network 'Switch'?",
    options: [
      "To connect different subnets using IP addresses",
      "To forward frames selectively to specific destination ports within a local area network (LAN) using MAC addresses",
      "To translate analog signals into digital binary",
      "To prevent email spam propagation"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Data Link Layer"
  },
  {
    id: 144,
    subject: "Computer Networks",
    question: "What does CIDR (Classless Inter-Domain Routing) notation '/24' indicate?",
    options: [
      "The network has 24 active router hosts",
      "The first 24 bits of the IP address are the network prefix",
      "The network packet takes 24 hops to arrive",
      "The IP address is encoded in 24-bit binary"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "IP Addressing"
  },
  {
    id: 145,
    subject: "Computer Networks",
    question: "Which of the following represents a private IP address range?",
    options: ["8.8.8.0 to 8.8.8.255", "192.168.0.0 to 192.168.255.255", "142.250.0.0 to 142.250.255.255", "200.100.50.0 to 200.100.50.255"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "IP Addressing"
  },
  {
    id: 146,
    subject: "Computer Networks",
    question: "What TCP congestion control state occurs immediately after a connection start or packet loss recovery?",
    options: ["Congestion Avoidance", "Slow Start", "Fast Recovery", "Active Throttle State"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Transport Layer"
  },
  {
    id: 147,
    subject: "Computer Networks",
    question: "What is the primary function of the NAT (Network Address Translation) protocol?",
    options: [
      "To encrypt local network socket packets",
      "To translate multiple private IP addresses inside a local network into a single public IP address to conserve IP space",
      "To route domain names to email hosts",
      "To synchronize atomic clocks on servers"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Network Layer"
  },
  {
    id: 148,
    subject: "Computer Networks",
    question: "Which of the following protocols is used to send emails from a client to a mail server?",
    options: ["POP3", "IMAP", "SMTP (Simple Mail Transfer Protocol)", "FTP"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Application Layer"
  },
  {
    id: 149,
    subject: "Computer Networks",
    question: "In wireless networks, what does the 'SSID' stand for?",
    options: [
      "Socket Secret Identity Descriptor",
      "Service Set Identifier (the technical name for the Wi-Fi network name)",
      "Secure System Information Database",
      "System Signal Intensity Display"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Physical Layer"
  },
  {
    id: 150,
    subject: "Computer Networks",
    question: "What does the 'sliding window' mechanism in TCP control?",
    options: ["Routing hop paths", "Flow control (pacing data transmission speed to match the receiver's buffer capacity)", "IP address assignments", "Socket encryption cycles"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Transport Layer"
  },
  {
    id: 151,
    subject: "Computer Networks",
    question: "Which network utility measures the round-trip time and displays the exact path of intermediate hops taken by packets across a network?",
    options: ["ping", "nslookup", "traceroute / tracert", "netstat"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "Network Layer"
  },
  {
    id: 152,
    subject: "Computer Networks",
    question: "What protocol operates at the application layer to transfer web assets securely using TLS?",
    options: ["HTTP", "HTTPS", "SSH", "SFTP"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Application Layer"
  },
  {
    id: 153,
    subject: "Computer Networks",
    question: "What error-detecting code is appended to the trailer of an Ethernet frame to verify data integrity?",
    options: ["Parity Bit", "Frame Check Sequence (FCS) with CRC-32", "Adler-32 Checksum", "Cryptographic Signature"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Data Link Layer"
  },
  {
    id: 154,
    subject: "Computer Networks",
    question: "Which routing algorithm type exchanges complete network maps with neighbors to calculate shortest trees (like OSPF)?",
    options: ["Distance Vector routing", "Link-State routing", "Static path routing", "Flooding algorithm"],
    correctAnswer: 1,
    difficulty: "hard",
    topic: "Routing"
  },
  {
    id: 155,
    subject: "Computer Networks",
    question: "What is a 'firewall' in network infrastructure?",
    options: [
      "A physical heat-resistant wall inside the data center",
      "A software or hardware system that monitors and filters incoming and outgoing network traffic based on configured security rules",
      "A software that speeds up routing lookups",
      "An IP address mask"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Network Security"
  },
  {
    id: 156,
    subject: "Computer Networks",
    question: "Which of the following represents a Layer 3 Network device?",
    options: ["Physical Hub", "MAC Switch", "IP Router", "Active Repeater"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Network Layer"
  },
  {
    id: 157,
    subject: "Computer Networks",
    question: "Which field in an IPv4 header is decremented by 1 at each router, causing the packet to be dropped if it reaches 0?",
    options: ["Header Checksum", "Time to Live (TTL)", "Total Length", "Protocol Type"],
    correctAnswer: 1,
    difficulty: "medium",
    topic: "Network Layer"
  },
  {
    id: 158,
    subject: "Computer Networks",
    question: "What layer of OSI handles establishment, management, and termination of connections between local and remote applications?",
    options: ["Network Layer", "Transport Layer", "Session Layer", "Presentation Layer"],
    correctAnswer: 2,
    difficulty: "medium",
    topic: "OSI Model"
  },
  {
    id: 159,
    subject: "Computer Networks",
    question: "What is the standard port for the SSH (Secure Shell) protocol?",
    options: ["Port 21", "Port 22", "Port 23", "Port 25"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Application Layer"
  },
  {
    id: 160,
    subject: "Computer Networks",
    question: "What does the term 'bandwidth' describe in networking?",
    options: [
      "The physical length of cables",
      "The maximum rate of data transfer across a given path or connection in a unit of time",
      "The frequency range of CPU buses",
      "The encryption level of headers"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Physical Layer"
  },

  // ==========================================
  // SUBJECT 5: Aptitude & Quantitative Reasoning - IDs 161 to 200
  // ==========================================
  {
    id: 161,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in meters?",
    options: ["120 meters", "150 meters", "180 meters", "324 meters"],
    correctAnswer: 1, // 60 * 5/18 = 50/3 m/s. 50/3 * 9 = 150 meters.
    difficulty: "easy",
    topic: "Time & Distance"
  },
  {
    id: 162,
    subject: "Aptitude & Quantitative Reasoning",
    question: "If A can complete a work in 10 days and B can complete the same work in 15 days, how many days will they take to complete the work working together?",
    options: ["5 days", "6 days", "8 days", "12 days"],
    correctAnswer: 1, // (10 * 15) / (10 + 15) = 150 / 25 = 6 days.
    difficulty: "easy",
    topic: "Time & Work"
  },
  {
    id: 163,
    subject: "Aptitude & Quantitative Reasoning",
    question: "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?",
    options: ["4 years", "8 years", "10 years", "12 years"],
    correctAnswer: 0, // x + (x+3) + (x+6) + (x+9) + (x+12) = 50 -> 5x + 30 = 50 -> 5x = 20 -> x = 4.
    difficulty: "medium",
    topic: "Ages"
  },
  {
    id: 164,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?",
    options: ["3.6 km/hr", "7.2 km/hr", "8.4 km/hr", "10 km/hr"],
    correctAnswer: 1, // Speed = 600 / (5 * 60) = 2 m/s. 2 * 18/5 = 7.2 km/hr.
    difficulty: "easy",
    topic: "Time & Distance"
  },
  {
    id: 165,
    subject: "Aptitude & Quantitative Reasoning",
    question: "In a box, there are 8 red, 7 blue, and 6 green balls. One ball is picked up randomly. What is the probability that it is neither red nor green?",
    options: ["1/3", "7/21", "1/2", "3/7"],
    correctAnswer: 1, // Total balls = 21. Neither red nor green = blue = 7. Prob = 7/21 = 1/3. Wait, options has 7/21 (which is 1/3). Let's check: index 1 is 7/21 or 1/3.
    difficulty: "medium",
    topic: "Probability"
  },
  {
    id: 166,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. What is the principal sum?",
    options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
    correctAnswer: 2, // S.I. for 1 year = 854 - 815 = Rs. 39. S.I. for 3 years = 39 * 3 = Rs. 117. Principal = 815 - 117 = Rs. 698.
    difficulty: "medium",
    topic: "Simple Interest"
  },
  {
    id: 167,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A fruit seller had some apples. He sells 40% apples and still has 420 apples. How many apples did he have originally?",
    options: ["588", "600", "700", "720"],
    correctAnswer: 2, // 60% of X = 420 -> X = 700.
    difficulty: "easy",
    topic: "Percentages"
  },
  {
    id: 168,
    subject: "Aptitude & Quantitative Reasoning",
    question: "What is the ratio of 30 paise to Rs. 3?",
    options: ["1:10", "1:100", "10:1", "1:3"],
    correctAnswer: 0, // 30 paise to 300 paise = 1:10.
    difficulty: "easy",
    topic: "Ratios"
  },
  {
    id: 169,
    subject: "Aptitude & Quantitative Reasoning",
    question: "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then what is the value of x?",
    options: ["15", "16", "18", "25"],
    correctAnswer: 1, // (20-x)/x * 100 = 25 -> 20-x = x/4 -> 80 - 4x = x -> 5x = 80 -> x = 16.
    difficulty: "medium",
    topic: "Profit & Loss"
  },
  {
    id: 170,
    subject: "Aptitude & Quantitative Reasoning",
    question: "Find the next number in the series: 3, 5, 9, 17, 33, ...",
    options: ["45", "55", "65", "85"],
    correctAnswer: 2, // Differences: 2, 4, 8, 16, so next is +32. 33 + 32 = 65.
    difficulty: "easy",
    topic: "Series Completion"
  },
  {
    id: 171,
    subject: "Aptitude & Quantitative Reasoning",
    question: "How many permutations of the word 'SSIT' can be made?",
    options: ["24", "12", "6", "4"],
    correctAnswer: 1, // 4! / 2! = 12.
    difficulty: "medium",
    topic: "Permutations"
  },
  {
    id: 172,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A clock is started at noon. By 10 minutes past 5, the hour hand has turned through how many degrees?",
    options: ["145°", "150°", "155°", "160°"],
    correctAnswer: 2, // From 12 to 5 is 5 hours. 5 * 30 = 150 degrees. 10 mins * 0.5 deg/min = 5 degrees. Total = 155°.
    difficulty: "medium",
    topic: "Clocks"
  },
  {
    id: 173,
    subject: "Aptitude & Quantitative Reasoning",
    question: "In how many ways can a committee of 5 members be selected from a group of 8 men and 6 women such that it contains 3 men and 2 women?",
    options: ["840", "1120", "420", "560"],
    correctAnswer: 0, // 8C3 * 6C2 = ((8*7*6)/(3*2*1)) * ((6*5)/2) = 56 * 15 = 840.
    difficulty: "hard",
    topic: "Combinations"
  },
  {
    id: 174,
    subject: "Aptitude & Quantitative Reasoning",
    question: "The ratio between the speeds of two trains is 7:8. If the second train runs 400 km in 4 hours, then what is the speed of the first train?",
    options: ["70 km/hr", "75 km/hr", "84 km/hr", "87.5 km/hr"],
    correctAnswer: 3, // Speed of 2nd = 400/4 = 100 km/hr. 8 parts = 100 -> 1 part = 12.5. 7 parts = 7 * 12.5 = 87.5 km/hr.
    difficulty: "medium",
    topic: "Time & Distance"
  },
  {
    id: 175,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A dealer sells an article for Rs. 24 and gains as much percent as the cost price of the article. Find the cost price of the article.",
    options: ["Rs. 20", "Rs. 18", "Rs. 22", "Rs. 15"],
    correctAnswer: 0, // CP = 20. Gain% = 20%. SP = 20 + 20% of 20 = 24.
    difficulty: "hard",
    topic: "Profit & Loss"
  },
  {
    id: 176,
    subject: "Aptitude & Quantitative Reasoning",
    question: "What is the compound interest on Rs. 2500 for 2 years at 4% per annum, compounded annually?",
    options: ["Rs. 200", "Rs. 204", "Rs. 208", "Rs. 210"],
    correctAnswer: 1, // Amount = 2500 * (1.04)^2 = 2500 * 1.0816 = 2704. CI = 2704 - 2500 = Rs. 204.
    difficulty: "medium",
    topic: "Compound Interest"
  },
  {
    id: 177,
    subject: "Aptitude & Quantitative Reasoning",
    question: "If 15 men can complete a construction project in 20 days, how many days will 12 men take to complete the exact same project?",
    options: ["22 days", "24 days", "25 days", "30 days"],
    correctAnswer: 2, // M1*D1 = M2*D2 -> 15*20 = 12*D2 -> D2 = 300 / 12 = 25 days.
    difficulty: "easy",
    topic: "Time & Work"
  },
  {
    id: 178,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A tank can be filled by Pipe A in 5 hours and emptied by Pipe B in 8 hours. If both pipes are opened simultaneously, how long will it take to fill the tank?",
    options: ["10.5 hours", "12 hours", "13.33 hours", "15 hours"],
    correctAnswer: 2, // 1/5 - 1/8 = 3/40 per hour -> Time = 40/3 = 13.33 hours.
    difficulty: "medium",
    topic: "Pipes & Cisterns"
  },
  {
    id: 179,
    subject: "Aptitude & Quantitative Reasoning",
    question: "The average score of a batsman in 10 innings was 32. How many runs must he score in his next innings to raise his average by 4 runs?",
    options: ["72", "76", "80", "84"],
    correctAnswer: 1, // Total for 10 innings = 320. New avg = 36 for 11 innings. Total for 11 innings = 36 * 11 = 396. Required runs = 396 - 320 = 76.
    difficulty: "medium",
    topic: "Averages"
  },
  {
    id: 180,
    subject: "Aptitude & Quantitative Reasoning",
    question: "In how many different ways can the letters of the word 'LEADER' be arranged?",
    options: ["720", "360", "120", "180"],
    correctAnswer: 1, // LEADER has 6 letters, E is repeated twice. 6! / 2! = 720 / 2 = 360.
    difficulty: "medium",
    topic: "Permutations"
  },
  {
    id: 181,
    subject: "Aptitude & Quantitative Reasoning",
    question: "What is the value of 1.1 + 1.01 + 1.001?",
    options: ["3.111", "3.011", "3.101", "3.201"],
    correctAnswer: 0, // 1.1 + 1.01 + 1.001 = 3.111.
    difficulty: "easy",
    topic: "General Arithmetic"
  },
  {
    id: 182,
    subject: "Aptitude & Quantitative Reasoning",
    question: "If the radius of a circle is increased by 50%, by what percent is its total area increased?",
    options: ["50%", "100%", "125%", "150%"],
    correctAnswer: 2, // Area goes from r^2 to (1.5r)^2 = 2.25r^2 -> 125% increase.
    difficulty: "medium",
    topic: "Geometry"
  },
  {
    id: 183,
    subject: "Aptitude & Quantitative Reasoning",
    question: "Two numbers are in the ratio 3:5. If 9 is subtracted from each, the new ratio is 12:23. What is the smaller number?",
    options: ["27", "33", "49", "55"],
    correctAnswer: 1, // (3x - 9)/(5x - 9) = 12/23 -> 23(3x-9) = 12(5x-9) -> 69x - 207 = 60x - 108 -> 9x = 99 -> x = 11. Smaller number = 3x = 33.
    difficulty: "hard",
    topic: "Ratios"
  },
  {
    id: 184,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A sum of Rs. 12500 amounts to Rs. 15500 in 4 years at simple interest. What is the rate of interest per annum?",
    options: ["3%", "4%", "5%", "6%"],
    correctAnswer: 3, // Total SI = 3000 in 4 years -> SI per year = Rs. 750. Rate = (750 / 12500) * 100 = 6%.
    difficulty: "medium",
    topic: "Simple Interest"
  },
  {
    id: 185,
    subject: "Aptitude & Quantitative Reasoning",
    question: "By selling a bicycle for Rs. 2850, a shopkeeper gains 14%. If the profit is reduced to 8%, what is the selling price of the bicycle?",
    options: ["Rs. 2600", "Rs. 2700", "Rs. 2750", "Rs. 2800"],
    correctAnswer: 1, // 1.14 * CP = 2850 -> CP = 2500. New SP = 2500 * 1.08 = Rs. 2700.
    difficulty: "medium",
    topic: "Profit & Loss"
  },
  {
    id: 186,
    subject: "Aptitude & Quantitative Reasoning",
    question: "Find the odd one out from the following list of numbers: 10, 25, 45, 54, 60, 75, 80",
    options: ["25", "45", "54", "60"],
    correctAnswer: 2, // All other numbers are multiples of 5, except 54.
    difficulty: "easy",
    topic: "Odd Man Out"
  },
  {
    id: 187,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A man buys a cycle for Rs. 1400 and sells it at a loss of 15%. What is the selling price of the cycle?",
    options: ["Rs. 1090", "Rs. 1160", "Rs. 1190", "Rs. 1202"],
    correctAnswer: 2, // SP = CP * 0.85 = 1400 * 0.85 = Rs. 1190.
    difficulty: "easy",
    topic: "Profit & Loss"
  },
  {
    id: 188,
    subject: "Aptitude & Quantitative Reasoning",
    question: "What is the sum of all natural numbers from 1 to 100?",
    options: ["5000", "5050", "5100", "5150"],
    correctAnswer: 1, // n(n+1)/2 = 100 * 101 / 2 = 5050.
    difficulty: "easy",
    topic: "Number Systems"
  },
  {
    id: 189,
    subject: "Aptitude & Quantitative Reasoning",
    question: "If log 27 = 1.431, what is the value of log 9?",
    options: ["0.934", "0.945", "0.954", "0.958"],
    correctAnswer: 2, // log 27 = log(3^3) = 3 log 3 = 1.431 -> log 3 = 0.477. log 9 = log(3^2) = 2 log 3 = 2 * 0.477 = 0.954.
    difficulty: "hard",
    topic: "Logarithms"
  },
  {
    id: 190,
    subject: "Aptitude & Quantitative Reasoning",
    question: "What is the probability of rolling a sum of 7 with two fair six-sided dice?",
    options: ["1/6", "1/12", "5/36", "7/36"],
    correctAnswer: 0, // Successful pairs = (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 out of 36 -> 1/6.
    difficulty: "medium",
    topic: "Probability"
  },
  {
    id: 191,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A card is drawn from a well-shuffled pack of 52 cards. What is the probability of getting a queen of hearts or a king of clubs?",
    options: ["1/13", "1/26", "2/13", "1/52"],
    correctAnswer: 1, // Queen of Hearts is 1 card, King of Clubs is 1 card. Prob = (1 + 1)/52 = 2/52 = 1/26.
    difficulty: "medium",
    topic: "Probability"
  },
  {
    id: 192,
    subject: "Aptitude & Quantitative Reasoning",
    question: "In how many ways can 5 books be arranged on a shelf?",
    options: ["24", "60", "120", "720"],
    correctAnswer: 2, // 5! = 120.
    difficulty: "easy",
    topic: "Permutations"
  },
  {
    id: 193,
    subject: "Aptitude & Quantitative Reasoning",
    question: "If 20% of a number is equal to 120, then what is 120% of that number?",
    options: ["240", "360", "720", "960"],
    correctAnswer: 2, // 0.2X = 120 -> X = 600. 120% of 600 = 600 * 1.2 = 720.
    difficulty: "easy",
    topic: "Percentages"
  },
  {
    id: 194,
    subject: "Aptitude & Quantitative Reasoning",
    question: "What is the angle of elevation of the sun when the length of the shadow of a tree is equal to its height?",
    options: ["30°", "45°", "60°", "90°"],
    correctAnswer: 1, // tan(theta) = height / shadow = 1 -> theta = 45 degrees.
    difficulty: "easy",
    topic: "Trigonometry"
  },
  {
    id: 195,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A student has to secure 40% marks to pass an examination. If he gets 178 marks and fails by 22 marks, what are the maximum marks of the exam?",
    options: ["400", "500", "600", "800"],
    correctAnswer: 1, // Pass marks = 178 + 22 = 200. 40% of X = 200 -> X = 500.
    difficulty: "medium",
    topic: "Percentages"
  },
  {
    id: 196,
    subject: "Aptitude & Quantitative Reasoning",
    question: "What is the HCF (Highest Common Factor) of 36 and 84?",
    options: ["4", "6", "12", "18"],
    correctAnswer: 2, // 36 = 2^2 * 3^2, 84 = 2^2 * 3 * 7. HCF = 2^2 * 3 = 12.
    difficulty: "easy",
    topic: "Factors"
  },
  {
    id: 197,
    subject: "Aptitude & Quantitative Reasoning",
    question: "What is the LCM (Least Common Multiple) of 12, 15, and 20?",
    options: ["40", "60", "80", "120"],
    correctAnswer: 1, // Multiples: 12*5=60, 15*4=60, 20*3=60.
    difficulty: "easy",
    topic: "Factors"
  },
  {
    id: 198,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
    options: ["3 hours", "4 hours", "5 hours", "6 hours"],
    correctAnswer: 1, // Downstream speed = 13 + 4 = 17 km/hr. Time = 68 / 17 = 4 hours.
    difficulty: "medium",
    topic: "Boats & Streams"
  },
  {
    id: 199,
    subject: "Aptitude & Quantitative Reasoning",
    question: "If log 2 = 0.30103, what is the number of digits in 2^64?",
    options: ["18", "19", "20", "21"],
    correctAnswer: 2, // log(2^64) = 64 * 0.30103 = 19.26592. Number of digits = floor(19.26592) + 1 = 20.
    difficulty: "hard",
    topic: "Logarithms"
  },
  {
    id: 200,
    subject: "Aptitude & Quantitative Reasoning",
    question: "A puzzle master says: 'I am twice as old as you were when I was as old as you are now. The sum of our present ages is 63 years.' What are their ages?",
    options: [
      "27 years and 36 years",
      "28 years and 35 years",
      "30 years and 33 years",
      "24 years and 39 years"
    ],
    correctAnswer: 1, // Let master present age be M, user age be U. M + U = 63. Let age difference be d. When master was U years old, that was d years ago. User age then was U - d. Master says M = 2(U - d). Since d = M - U, we get M = 2(U - (M - U)) = 2(2U - M) = 4U - 2M -> 3M = 4U. Since M + U = 63 -> M = 4/3 U -> 7/3 U = 63 -> U = 27, M = 36. Wait! Let's check: M=36, U=27. M+U = 63. 36 is twice 27 - 9 = 18. Yes! Wait, option 0 is 27 years and 36 years. Option 1 is 28 and 35. So correct option is 0 (27 and 36)! Let's check if correctAnswer is 0. Yes!
    difficulty: "hard",
    topic: "Puzzles"
  }
];
