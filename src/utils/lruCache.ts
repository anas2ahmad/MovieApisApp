interface CacheNode<T> {
  key: string;
  value: T;
  next: CacheNode<T> | null;
  prev: CacheNode<T> | null;
}

class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, CacheNode<T>>;
  private head: CacheNode<T> | null;
  private tail: CacheNode<T> | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  private moveToFront(node: CacheNode<T>): void {
    if (node === this.head) return;

    // Remove node from current position
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.tail) this.tail = node.prev;

    // Move to front
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
  }

  get(key: string): T | null {
    const node = this.cache.get(key);
    if (!node) return null;

    this.moveToFront(node);
    return node.value;
  }

  put(key: string, value: T): void {
    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      this.moveToFront(existingNode);
      return;
    }

    // Create new node
    const newNode: CacheNode<T> = {
      key,
      value,
      next: this.head,
      prev: null
    };

    // Update head
    if (this.head) this.head.prev = newNode;
    this.head = newNode;

    // Add to cache
    this.cache.set(key, newNode);

    // Remove least recently used if capacity exceeded
    if (this.cache.size > this.capacity) {
      if (this.tail) {
        this.cache.delete(this.tail.key);
        this.tail = this.tail.prev;
        if (this.tail) this.tail.next = null;
      }
    } else if (!this.tail) {
      this.tail = newNode;
    }
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }

  // Utility method to get cache size
  size(): number {
    return this.cache.size;
  }
}

export default LRUCache; 