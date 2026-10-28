
import { useState } from "react";

/* ==========================================
   TECHBOOK — CONCEPT MAP
   Interactive concept graph + mini lessons
   ========================================== */

const knowledgeMaps = {
  dictionary: {
    nodes: [
      {
        id: "root",
        label: "Python\nDictionaries",
        x: 50,
        y: 47,
        kind: "root",
        detail: "A key-value data structure used to store and retrieve information by key.",
      },
      {
        id: "hashing",
        label: "Hashing",
        x: 24,
        y: 19,
        kind: "foundation",
        detail: "Hashing transforms a key into a hash value used to help locate data.",
      },
      {
        id: "tables",
        label: "Hash Tables",
        x: 77,
        y: 19,
        kind: "related",
        detail: "Hash tables use a hash function to support efficient key-based lookup.",
      },
      {
        id: "sets",
        label: "Python Sets",
        x: 17,
        y: 72,
        kind: "related",
        detail: "Sets store unique elements and commonly use hashing for membership checks.",
      },
      {
        id: "collision",
        label: "Collisions",
        x: 48,
        y: 83,
        kind: "advanced",
        detail: "A collision occurs when different keys map to the same hash-table location.",
      },
      {
        id: "database",
        label: "Database\nIndexing",
        x: 82,
        y: 72,
        kind: "application",
        detail: "Indexes help databases locate records efficiently. Hash-based indexes are one possible indexing technique.",
      },
    ],
    links: [
      { from: "root", to: "hashing", label: "uses" },
      { from: "root", to: "tables", label: "implemented using" },
      { from: "root", to: "sets", label: "related structure" },
      { from: "tables", to: "collision", label: "must handle" },
      { from: "tables", to: "database", label: "can support" },
      { from: "hashing", to: "tables", label: "powers lookup" },
    ],
  },

  recursion: {
    nodes: [
      {
        id: "root",
        label: "Recursion",
        x: 50,
        y: 47,
        kind: "root",
        detail: "A technique where a function solves a problem by calling itself on smaller subproblems.",
      },
      {
        id: "base",
        label: "Base Case",
        x: 23,
        y: 19,
        kind: "foundation",
        detail: "The stopping condition that prevents recursive calls from continuing forever.",
      },
      {
        id: "stack",
        label: "Call Stack",
        x: 78,
        y: 19,
        kind: "related",
        detail: "Each function call creates a stack frame that stores information needed to resume execution.",
      },
      {
        id: "trees",
        label: "Tree Traversal",
        x: 18,
        y: 74,
        kind: "application",
        detail: "Recursive algorithms naturally visit nodes and their child subtrees.",
      },
      {
        id: "divide",
        label: "Divide & Conquer",
        x: 50,
        y: 84,
        kind: "advanced",
        detail: "Break a problem into smaller subproblems, solve them, and combine their results.",
      },
      {
        id: "factorial",
        label: "Factorial",
        x: 83,
        y: 72,
        kind: "related",
        detail: "Factorial is a classic example: n! = n × (n−1)! with 0! = 1.",
      },
    ],
    links: [
      { from: "root", to: "base", label: "needs" },
      { from: "root", to: "stack", label: "uses" },
      { from: "root", to: "trees", label: "applied to" },
      { from: "root", to: "divide", label: "related strategy" },
      { from: "root", to: "factorial", label: "example" },
      { from: "stack", to: "divide", label: "stores calls" },
    ],
  },

  neural: {
    nodes: [
      {
        id: "root",
        label: "Neural Networks",
        x: 50,
        y: 47,
        kind: "root",
        detail: "Models that learn patterns by adjusting connected computational units during training.",
      },
      {
        id: "neurons",
        label: "Neurons",
        x: 23,
        y: 19,
        kind: "foundation",
        detail: "Artificial neurons combine inputs, weights, a bias, and an activation function.",
      },
      {
        id: "training",
        label: "Training Data",
        x: 78,
        y: 19,
        kind: "related",
        detail: "Training examples provide the signals a model learns patterns from.",
      },
      {
        id: "gradient",
        label: "Gradient Descent",
        x: 18,
        y: 74,
        kind: "advanced",
        detail: "An optimization method that updates parameters to reduce a loss function.",
      },
      {
        id: "deep",
        label: "Deep Learning",
        x: 50,
        y: 84,
        kind: "related",
        detail: "Deep learning uses neural networks with multiple layers.",
      },
      {
        id: "vision",
        label: "Computer Vision",
        x: 83,
        y: 72,
        kind: "application",
        detail: "A field using models to interpret images and video.",
      },
    ],
    links: [
      { from: "root", to: "neurons", label: "built from" },
      { from: "root", to: "training", label: "learns from" },
      { from: "root", to: "gradient", label: "often trained with" },
      { from: "root", to: "deep", label: "foundation of" },
      { from: "root", to: "vision", label: "used in" },
      { from: "training", to: "gradient", label: "guides learning" },
    ],
  },
};

/* Color categories used by the graph */

const nodeColors = {
  root: "#8974d8",
  foundation: "#9a89df",
  related: "#b3a1e8",
  advanced: "#edb6c8",
  application: "#9dcbbb",
};

/* ==========================================
   DETAILED TEACHING CONTENT
   ========================================== */

const lessons = {
  dictionary: {
    root: {
      definition:
        "A Python dictionary stores information as key-value pairs. Each key identifies a value, making it useful for storing related information such as student names and marks.",
      how:
        "You provide a key, and Python uses a hash-based mechanism to help locate its associated value. Dictionaries can also add, update, and remove entries.",
      example:
        'marks = {"Aman": 85, "Riya": 92}\nprint(marks["Aman"])  # 85',
      connection:
        "Dictionaries connect to hashing and hash tables because Python uses hashing to support key-based lookup. They also relate to sets, collision handling, and database indexing.",
      why:
        "Dictionaries are useful for storing structured information, counting items, grouping data, and building many real-world applications.",
    },

    hashing: {
      definition:
        "Hashing is a technique that transforms a key into a hash value using a hash function.",
      how:
        "A hash-based data structure uses the hash value to help determine where a key belongs. It then checks the relevant location to find the associated entry.",
      example:
        'student = "Aman"\nprint(hash(student))  # Example hash value',
      connection:
        "Python dictionaries use hashing to help locate keys. Instead of checking every entry one by one, the hash value helps identify where to look.",
      why:
        "Hashing helps explain dictionary performance, hash collisions, and how hash-based data structures organize information.",
    },

    tables: {
      definition:
        "A hash table is a data structure that uses a hash function to support key-based storage and lookup.",
      how:
        "A hash function helps map a key to a table location. When multiple keys map to the same location, the implementation must resolve the collision.",
      example:
        "Imagine storing student IDs alongside their marks. A hash table helps locate a student's entry using their ID.",
      connection:
        "Python dictionaries use a hash-table approach. Learning about hash tables explains the ideas behind dictionary lookup, insertion, deletion, and collision handling.",
      why:
        "Hash tables are useful in lookup systems, caches, symbol tables, and many other applications.",
    },

    sets: {
      definition:
        "A Python set stores unique elements and supports operations such as membership testing, union, intersection, and difference.",
      how:
        "Python sets use hashing for efficient membership checks when their elements are hashable.",
      example:
        'subjects = {"Python", "AI", "Python"}\nprint(subjects)  # Only unique elements',
      connection:
        "Sets and dictionaries both use hashing. A set stores unique elements, while a dictionary associates keys with values.",
      why:
        "Sets help remove duplicates, compare collections, and check whether an item belongs to a group.",
    },

    collision: {
      definition:
        "A hash collision occurs when different keys produce the same hash value or map to the same location in a hash table.",
      how:
        "Hash-based structures use collision-resolution techniques to ensure that different keys can still be stored and retrieved correctly.",
      example:
        "Imagine two student IDs being assigned the same storage location. The data structure needs a strategy to distinguish their records.",
      connection:
        "Collisions are a natural concern in hash tables and help explain why a dictionary needs more than simply calculating a hash value.",
      why:
        "Understanding collisions helps explain correctness, performance, and the internal workings of hash-based structures.",
    },

    database: {
      definition:
        "Database indexing uses an additional data structure to help a database find records without scanning every row.",
      how:
        "Different index types organize data differently. Hash indexes suit certain equality lookups, while B-tree indexes support a broader range of queries.",
      example:
        "A student database might index student_id to find a particular student's record more efficiently.",
      connection:
        "Database indexing relates to hashing because hash-based indexes can use keys to locate records. However, not every database index uses hashing.",
      why:
        "Indexing can improve data retrieval as databases grow, helping applications respond more efficiently to queries.",
    },
  },

  recursion: {
    root: {
      definition:
        "Recursion is a programming technique in which a function calls itself to solve a smaller version of a problem.",
      how:
        "A recursive function needs a stopping condition, called a base case, and a recursive step that moves the problem toward that condition.",
      example:
        "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)",
      connection:
        "Recursion connects to base cases, the call stack, tree traversal, factorial, and divide-and-conquer algorithms.",
      why:
        "It is especially useful for hierarchical structures and problems that can naturally be broken into smaller versions of themselves.",
    },

    base: {
      definition:
        "A base case is the condition that stops a recursive function from making more recursive calls.",
      how:
        "When the base case is reached, the function returns a result directly. Without a suitable stopping condition, recursion may continue until a runtime error occurs.",
      example:
        "In factorial, factorial(0) = 1 is the base case.",
      connection:
        "The base case lets recursive calls finish. Each earlier call can then use the returned result to complete its own calculation.",
      why:
        "Understanding base cases helps you write recursive functions that terminate correctly.",
    },

    stack: {
      definition:
        "The call stack tracks active function calls and stores information needed for each call to continue and return.",
      how:
        "When a function calls another function, a stack frame is created. When the new call finishes, execution returns to the waiting caller.",
      example:
        "factorial(3) calls factorial(2), which calls factorial(1). The earlier calls wait for the deeper calls to return.",
      connection:
        "Recursive calls use the call stack to keep track of unfinished work until the base case is reached and results return.",
      why:
        "Understanding the call stack helps you trace recursive programs and understand stack overflow errors.",
    },

    trees: {
      definition:
        "Tree traversal is the process of visiting nodes in a tree in a particular order.",
      how:
        "Common depth-first traversals include preorder, inorder, and postorder. Each follows a different order when visiting a node and its subtrees.",
      example:
        "Inorder traversal visits the left subtree, then the current node, then the right subtree.",
      connection:
        "Recursion is often used for tree traversal because each subtree can be processed using the same logic as the whole tree.",
      why:
        "Tree traversal is useful for searching, displaying, and processing hierarchical data.",
    },

    divide: {
      definition:
        "Divide and conquer solves a problem by splitting it into smaller subproblems, solving them, and combining their results when needed.",
      how:
        "Many divide-and-conquer algorithms use recursion to solve each smaller problem until a stopping condition is reached.",
      example:
        "Merge sort divides a list into smaller parts, sorts them recursively, and merges the sorted parts.",
      connection:
        "Recursion provides a natural way to express the repeated subproblem-solving used by many divide-and-conquer algorithms.",
      why:
        "This approach can produce efficient algorithms for sorting, searching, and other computational problems.",
    },

    factorial: {
      definition:
        "The factorial of a non-negative integer n is the product of all positive integers up to n. By definition, 0! = 1.",
      how:
        "Factorial can be defined recursively as n! = n × (n−1)! for n greater than zero.",
      example:
        "5! = 5 × 4 × 3 × 2 × 1 = 120.",
      connection:
        "Factorial is a classic example of recursion because each calculation reduces to a smaller factorial until it reaches the base case.",
      why:
        "It helps beginners understand recursive definitions, stopping conditions, and how function calls return results.",
    },
  },

  neural: {
    root: {
      definition:
        "A neural network is a machine-learning model made from interconnected computational units that learn patterns from data.",
      how:
        "During training, the model makes predictions, measures its errors using a loss function, and adjusts its parameters to improve.",
      example:
        "A network can learn patterns from labelled images to help classify new images.",
      connection:
        "Neural networks connect to artificial neurons, training data, gradient-based optimization, deep learning, and applications such as computer vision.",
      why:
        "They are used in tasks such as image recognition, language processing, speech recognition, and prediction.",
    },

    neurons: {
      definition:
        "An artificial neuron combines input values with learned weights and a bias, then applies an activation function.",
      how:
        "The weighted combination of inputs is transformed by the activation function. Its output can then be passed to other neurons or layers.",
      example:
        "A neuron might combine numerical features from a dataset to produce a signal used by a classification model.",
      connection:
        "Neural networks are built from connected computational units. Their weights and biases are adjusted during training.",
      why:
        "Understanding neurons provides a foundation for learning about layers, activation functions, and neural-network training.",
    },

    training: {
      definition:
        "Training data consists of examples that a machine-learning model uses to learn patterns or relationships.",
      how:
        "In supervised learning, a model makes predictions on examples and compares them with target labels to calculate its error.",
      example:
        "An image classifier might learn from labelled pictures of cats and dogs.",
      connection:
        "Neural networks learn from training data by adjusting their parameters according to the training procedure.",
      why:
        "The quality and coverage of training data influence how well a model learns and how it performs on new examples.",
    },

    gradient: {
      definition:
        "Gradient descent is an optimization method that updates model parameters in an attempt to reduce a loss function.",
      how:
        "The gradient describes how the loss changes with respect to the parameters. A learning rate controls the size of each update.",
      example:
        "During training, parameter updates can reduce the difference between a network's predictions and the target values.",
      connection:
        "Gradient-based optimization is commonly used to train neural networks by adjusting their weights and biases.",
      why:
        "It helps explain how a model learns from errors instead of simply storing predefined answers.",
    },

    deep: {
      definition:
        "Deep learning is a branch of machine learning that uses neural networks with multiple layers to learn representations from data.",
      how:
        "Layers transform their inputs, allowing the network to combine simpler patterns into more complex representations.",
      example:
        "An image model may learn edges and textures before combining them into features useful for recognizing objects.",
      connection:
        "Deep learning builds on neural networks by using multiple layers and training procedures to learn complex patterns.",
      why:
        "It is widely used for language, image recognition, speech, and many other complex tasks.",
    },

    vision: {
      definition:
        "Computer vision is a field of artificial intelligence focused on helping computers interpret images and videos.",
      how:
        "Vision systems process visual input for tasks such as classification, object detection, segmentation, and image understanding.",
      example:
        "A vision model can identify whether an image contains a bicycle, a car, or a pedestrian.",
      connection:
        "Neural networks, particularly deep-learning models, are widely used to learn visual features and perform computer-vision tasks.",
      why:
        "Computer vision is used in medical imaging, robotics, accessibility tools, quality inspection, and autonomous systems.",
    },
  },
};

/* ==========================================
   TOPIC AND LESSON HELPERS
   ========================================== */

function getMapForTopic(topic) {
  const value = topic.toLowerCase();

  if (
    value.includes("dictionary") ||
    value.includes("hash") ||
    value.includes("database indexing") ||
    value.includes("python sets")
  ) {
    return knowledgeMaps.dictionary;
  }

  if (
    value.includes("recursion") ||
    value.includes("factorial") ||
    value.includes("call stack") ||
    value.includes("tree traversal") ||
    value.includes("divide and conquer")
  ) {
    return knowledgeMaps.recursion;
  }

  if (
    value.includes("neural") ||
    value.includes("machine learning") ||
    value.includes("deep learning") ||
    value.includes("computer vision") ||
    value.includes("gradient descent")
  ) {
    return knowledgeMaps.neural;
  }

  return null;
}

function getLessonCategory(topic) {
  const value = topic.toLowerCase();

  if (
    value.includes("dictionary") ||
    value.includes("hash") ||
    value.includes("database indexing") ||
    value.includes("python sets")
  ) {
    return "dictionary";
  }

  if (
    value.includes("recursion") ||
    value.includes("factorial") ||
    value.includes("call stack") ||
    value.includes("tree traversal") ||
    value.includes("divide and conquer")
  ) {
    return "recursion";
  }

  if (
    value.includes("neural") ||
    value.includes("machine learning") ||
    value.includes("deep learning") ||
    value.includes("computer vision") ||
    value.includes("gradient descent")
  ) {
    return "neural";
  }

  return null;
}

function getLesson(topic, node) {
  const category = getLessonCategory(topic);
  const categoryLessons = category ? lessons[category] : null;
  const specificLesson = categoryLessons?.[node.id];

  if (specificLesson) {
    return {
      title: node.label.replace("\n", " "),
      ...specificLesson,
    };
  }

  return {
    title: node.label.replace("\n", " "),
    definition: node.detail,
    how:
      "Start by identifying the inputs, the process, and the output of this concept. Then trace a small example to understand how it works.",
    example:
      "Try writing a small example of this concept and explain each step in your own words.",
    connection:
      `${node.label.replace("\n", " ")} relates to ${topic} through the relationship shown in the knowledge map. Understanding both ideas helps explain how they work together.`,
    why:
      "Understanding this connection helps you build a broader picture of the subject and apply the concept in other problems.",
  };
}

/* ==========================================
   MAIN COMPONENT
   ========================================== */

export default function ConceptMap() {
  const [topic, setTopic] = useState("Python Dictionaries");
  const [search, setSearch] = useState("Python Dictionaries");
  const [map, setMap] = useState(knowledgeMaps.dictionary);
  const [selectedNode, setSelectedNode] = useState("root");
  const [error, setError] = useState("");

  function generateMap(event) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      setError("Enter a topic to explore its connections.");
      return;
    }

    const nextMap = getMapForTopic(value);

    if (!nextMap) {
      setError(
        "This topic is not in the demo library yet. AWS AI integration will enable concept maps and lessons for other topics."
      );
      return;
    }

    setTopic(value);
    setMap(nextMap);
    setSelectedNode("root");
    setError("");
  }

  function selectNode(nodeId) {
    setSelectedNode(nodeId);
  }

  const selected = map.nodes.find(
    (node) => node.id === selectedNode
  );

  const relatedLinks = map.links.filter(
    (link) =>
      link.from === selectedNode ||
      link.to === selectedNode
  );

  const lesson = selected ? getLesson(topic, selected) : null;

  const videoSearchUrl = selected
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${selected.label.replace("\n", " ")} explained tutorial`
      )}`
    : "https://www.youtube.com/";

  return (
    <main className="cmap-page">
      <header className="cmap-topbar">
        <a className="cmap-back" href="#home">
          ← Dashboard
        </a>

        <span className="cmap-brand">
          TechBook / Concept Map
        </span>
      </header>

      <section className="cmap-hero">
        <span className="cmap-eyebrow">
          SEE THE BIGGER PICTURE
        </span>

        <h1>
          One topic.
          <br />
          <span>A world of connections.</span>
        </h1>

        <p>
          Discover connected concepts, understand how they work,
          learn through examples, and explore the bigger picture
          behind what you study.
        </p>
      </section>

      <form className="cmap-search-panel" onSubmit={generateMap}>
        <div className="cmap-search-copy">
          <label htmlFor="cmap-topic">
            What topic are you exploring?
          </label>

          <p>
            Enter a concept to discover related ideas and lessons.
          </p>
        </div>

        <div className="cmap-search-controls">
          <input
            id="cmap-topic"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="e.g. Python Dictionaries"
          />

          <button className="cmap-generate" type="submit">
            Explore connections <span>✦</span>
          </button>
        </div>

        {error && (
          <p className="cmap-error" role="alert">
            {error}
          </p>
        )}

        <div className="cmap-examples">
          Try:

          {[
            "Python Dictionaries",
            "Recursion",
            "Neural Networks",
          ].map((example) => (
            <button
              type="button"
              key={example}
              onClick={() => {
                setSearch(example);
                setError("");
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </form>

      <section className="cmap-workspace">
        <div className="cmap-graph-card">
          <div className="cmap-graph-heading">
            <div>
              <span className="cmap-eyebrow">
                YOUR KNOWLEDGE WEB
              </span>

              <h2>{topic}</h2>
            </div>

            <span className="cmap-node-count">
              {map.nodes.length} concepts
            </span>
          </div>

          <div className="cmap-legend">
            <span>
              <i style={{ background: nodeColors.foundation }} />
              Foundations
            </span>

            <span>
              <i style={{ background: nodeColors.related }} />
              Related
            </span>

            <span>
              <i style={{ background: nodeColors.application }} />
              Applications
            </span>
          </div>

          <div className="cmap-graph">
            <svg
              className="cmap-edges"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-label="Connections between concepts"
            >
              {map.links.map((link, index) => {
                const from = map.nodes.find(
                  (node) => node.id === link.from
                );

                const to = map.nodes.find(
                  (node) => node.id === link.to
                );

                if (!from || !to) return null;

                const isActive =
                  link.from === selectedNode ||
                  link.to === selectedNode;

                return (
                  <line
                    key={index}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className={
                      isActive
                        ? "cmap-edge active"
                        : "cmap-edge"
                    }
                  />
                );
              })}
            </svg>

            {map.nodes.map((node) => (
              <button
                type="button"
                key={node.id}
                aria-pressed={selectedNode === node.id}
                aria-label={`Learn about ${node.label.replace("\n", " ")}`}
                className={`cmap-node ${node.kind} ${
                  selectedNode === node.id ? "active" : ""
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  "--node-color": nodeColors[node.kind],
                }}
                onClick={() => selectNode(node.id)}
              >
                <span>
                  {node.label.split("\n").map((line, index) => (
                    <span key={index}>{line}</span>
                  ))}
                </span>
              </button>
            ))}
          </div>

          <p className="cmap-graph-hint">
            Select any concept to learn what it means, see an
            example, and understand how it connects to {topic}.
          </p>
        </div>

        <aside className="cmap-detail-card">
          <span className="cmap-eyebrow">
            YOUR MINI LESSON
          </span>

          {selected && lesson && (
            <>
              <div
                className="cmap-detail-symbol"
                style={{
                  "--node-color": nodeColors[selected.kind],
                }}
              >
                ✦
              </div>

              <h2>{lesson.title}</h2>

              <section className="cmap-lesson-section">
                <h3>01 · What is it?</h3>
                <p>{lesson.definition}</p>
              </section>

              <section className="cmap-lesson-section">
                <h3>02 · How does it work?</h3>
                <p>{lesson.how}</p>
              </section>

              <section className="cmap-lesson-section">
                <h3>03 · See an example</h3>
                <pre>{lesson.example}</pre>
              </section>

              <section className="cmap-lesson-section cmap-connection-explanation">
                <h3>
                  04 · How does it connect to {topic}?
                </h3>

                <p>{lesson.connection}</p>
              </section>

              <section className="cmap-lesson-section">
                <h3>05 · Why should you learn it?</h3>
                <p>{lesson.why}</p>
              </section>

              <a
                className="cmap-video-link"
                href={videoSearchUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="cmap-video-icon">▶</span>

                <span>
                  <strong>Watch a video lesson</strong>
                  <small>
                    Find tutorials about {lesson.title}
                  </small>
                </span>

                <span>↗</span>
              </a>

              <div className="cmap-connection-heading">
                <h3>Explore connected concepts</h3>
                <span>{relatedLinks.length} links</span>
              </div>

              <div className="cmap-connection-list">
                {relatedLinks.map((link, index) => {
                  const otherId =
                    link.from === selectedNode
                      ? link.to
                      : link.from;

                  const other = map.nodes.find(
                    (node) => node.id === otherId
                  );

                  if (!other) return null;

                  const relationship =
                    link.from === selectedNode
                      ? link.label
                      : `Connects through: ${link.label}`;

                  return (
                    <button
                      type="button"
                      className="cmap-connection"
                      key={`${link.from}-${link.to}-${index}`}
                      onClick={() => selectNode(otherId)}
                    >
                      <span
                        className="cmap-connection-dot"
                        style={{
                          background: nodeColors[other.kind],
                        }}
                      />

                      <span className="cmap-connection-text">
                        <strong>
                          {other.label.replace("\n", " ")}
                        </strong>

                        <small>{relationship}</small>
                      </span>

                      <span className="cmap-connection-arrow">
                        ↗
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </aside>
      </section>

      <p className="cmap-note">
        Demo lessons are currently built in. Dynamic AI-generated
        explanations and new concept maps will be added with AWS
        integration. Video links currently open YouTube search results.
      </p>
    </main>
  );
}
