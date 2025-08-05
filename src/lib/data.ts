import type { LucideIcon } from 'lucide-react';
import { Component, Code, Database, Workflow, TestTube2, Book } from 'lucide-react';

export type Folder = {
  id: string;
  name: string;
  icon: LucideIcon;
};

export type Snippet = {
  id: string;
  folderId: string;
  name: string;
  language: 'javascript' | 'python' | 'html' | 'css' | 'sql';
  code: string;
  tags: string[];
  description: string;
};

export const folders: Folder[] = [
  { id: 'f1', name: 'React Components', icon: Component },
  { id: 'f2', name: 'Server-side Logic', icon: Code },
  { id: 'f3', name: 'Database Queries', icon: Database },
  { id: 'f4', name: 'API Integrations', icon: Workflow },
  { id: 'f5', name: 'Testing Utilities', icon: TestTube2 },
  { id: 'f6', name: 'Documentation', icon: Book },
];

export const snippets: Snippet[] = [
  {
    id: 's1',
    folderId: 'f1',
    name: 'Custom Hook for Window Size',
    language: 'javascript',
    code: `import { useState, useEffect } from 'react';

function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}`,
    tags: ['react', 'hook', 'ui'],
    description: 'A React hook to get the current window dimensions.',
  },
  {
    id: 's2',
    folderId: 'f1',
    name: 'Themed Button Component',
    language: 'javascript',
    code: `const Button = ({ theme, children }) => {
  const styles = {
    color: theme === 'dark' ? 'white' : 'black',
    backgroundColor: theme === 'dark' ? 'black' : 'white',
  };
  return <button style={styles}>{children}</button>;
};`,
    tags: ['react', 'component', 'styling'],
    description: 'A simple button component that accepts a theme prop.',
  },
  {
    id: 's3',
    folderId: 'f2',
    name: 'Python Flask Route',
    language: 'python',
    code: `from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'`,
    tags: ['python', 'flask', 'backend'],
    description: 'A basic "Hello, World!" route in a Flask application.',
  },
  {
    id: 's4',
    folderId: 'f3',
    name: 'Select Users by Role',
    language: 'sql',
    code: `SELECT id, name, email
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;`,
    tags: ['sql', 'database', 'query'],
    description: 'SQL query to select all users with the admin role.',
  },
  {
    id: 's5',
    folderId: 'f4',
    name: 'Fetch API with POST',
    language: 'javascript',
    code: `async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}`,
    tags: ['javascript', 'api', 'fetch'],
    description: 'An async function to send a POST request using the Fetch API.',
  },
  {
    id: 's6',
    folderId: 'f5',
    name: 'Simple Sum Test',
    language: 'javascript',
    code: `test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});`,
    tags: ['jest', 'testing', 'unit-test'],
    description: 'A basic test case using Jest to verify a sum function.',
  },
  {
    id: 's7',
    folderId: 'f1',
    name: 'useState with an object',
    language: 'javascript',
    code: `const [user, setUser] = useState({ name: 'John', age: 30 });

const updateName = (newName) => {
  setUser(currentUser => ({ ...currentUser, name: newName }));
};`,
    tags: ['react', 'state-management', 'hook'],
    description: 'Example of using the useState hook with an object.',
  },
  {
    id: 's8',
    folderId: 'f2',
    name: 'Python List Comprehension',
    language: 'python',
    code: `# Square each number in a list
numbers = [1, 2, 3, 4, 5]
squares = [n**2 for n in numbers]
print(squares) # Output: [1, 4, 9, 16, 25]`,
    tags: ['python', 'data-structures'],
    description: 'A concise way to create a list of squares using list comprehension.',
  },
];
